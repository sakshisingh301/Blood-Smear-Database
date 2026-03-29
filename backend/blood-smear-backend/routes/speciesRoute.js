const express = require('express');
const router = express.Router();
const UploadMetadata = require('../models/UploadMetadata');
const { 
  getAllSpecies, 
  getSpeciesByScientificName, 
  searchSpecies,
  getSpeciesByClass,
  getSpeciesByOrder,
  getSpeciesByFamily
} = require('../data/speciesTaxonomy');

// Get all species taxonomy data
router.get('/taxonomy', (req, res) => {
  try {
    const allSpecies = getAllSpecies();
    res.json({
      success: true,
      data: allSpecies,
      total: allSpecies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching species taxonomy',
      error: error.message
    });
  }
});

// Get species by class (birds/mammals)
router.get('/taxonomy/:className', (req, res) => {
  try {
    const { className } = req.params;
    const classData = getSpeciesByClass(className);
    
    if (Object.keys(classData).length === 0) {
      return res.status(404).json({
        success: false,
        message: `Class '${className}' not found`
      });
    }
    
    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching species by class',
      error: error.message
    });
  }
});

// Get species by order
router.get('/taxonomy/:className/:orderName', (req, res) => {
  try {
    const { className, orderName } = req.params;
    const orderData = getSpeciesByOrder(className, orderName);
    
    if (Object.keys(orderData).length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order '${orderName}' not found in class '${className}'`
      });
    }
    
    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching species by order',
      error: error.message
    });
  }
});

// Get species by family
router.get('/taxonomy/:className/:orderName/:familyName', (req, res) => {
  try {
    const { className, orderName, familyName } = req.params;
    const familyData = getSpeciesByFamily(className, orderName, familyName);
    
    if (Object.keys(familyData).length === 0) {
      return res.status(404).json({
        success: false,
        message: `Family '${familyName}' not found in order '${orderName}'`
      });
    }
    
    res.json({
      success: true,
      data: familyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching species by family',
      error: error.message
    });
  }
});

// Get specific species information
router.get('/taxonomy/species/:scientificName', (req, res) => {
  try {
    const { scientificName } = req.params;
    const species = getSpeciesByScientificName(scientificName);
    
    if (!species) {
      return res.status(404).json({
        success: false,
        message: `Species '${scientificName}' not found`
      });
    }
    
    res.json({
      success: true,
      data: species
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching species information',
      error: error.message
    });
  }
});

// Search species
router.get('/search', (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const results = searchSpecies(query);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      query: query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching species',
      error: error.message
    });
  }
});

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/species/browse
 * Search approved uploads (blood smear cases) for /species/browse.
 * Query params (all optional except none required — empty filter returns all matching status):
 *   q            — matches common_name, scientific_name, taxonomy.family/order/class/phylum (partial, case-insensitive)
 *   phylum, class, order, family — exact match on taxonomy.* (case-insensitive)
 *   genus        — first word of scientific_name
 *   species      — specific epithet (second word of binomial)
 *   health_status, stain — exact match (case-insensitive)
 *   page, limit  — pagination (default page=1, limit=12, max limit=100)
 *   include_pending — if "true", include records where approved is false (for admin tooling)
 */
router.get('/browse', async (req, res) => {
  try {
    const {
      q,
      phylum,
      class: taxonomyClass,
      order: taxonomyOrder,
      family,
      genus,
      species: speciesEpithet,
      health_status,
      stain,
      include_pending,
    } = req.query;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 12;
    limit = Math.min(limit, 100);

    const andParts = [{ status: 'ready_for_viewer' }];

    if (include_pending !== 'true') {
      andParts.push({ approved: true });
    }

    if (phylum && String(phylum).trim()) {
      andParts.push({
        'taxonomy.phylum': new RegExp(`^${escapeRegex(phylum.trim())}$`, 'i'),
      });
    }
    if (taxonomyClass && String(taxonomyClass).trim()) {
      andParts.push({
        'taxonomy.class': new RegExp(`^${escapeRegex(taxonomyClass.trim())}$`, 'i'),
      });
    }
    if (taxonomyOrder && String(taxonomyOrder).trim()) {
      andParts.push({
        'taxonomy.order': new RegExp(`^${escapeRegex(taxonomyOrder.trim())}$`, 'i'),
      });
    }
    if (family && String(family).trim()) {
      andParts.push({
        'taxonomy.family': new RegExp(`^${escapeRegex(family.trim())}$`, 'i'),
      });
    }

    if (genus && String(genus).trim()) {
      andParts.push({
        scientific_name: new RegExp(`^${escapeRegex(genus.trim())}\\s+`, 'i'),
      });
    }
    if (speciesEpithet && String(speciesEpithet).trim()) {
      andParts.push({
        scientific_name: new RegExp(
          `^\\S+\\s+${escapeRegex(speciesEpithet.trim())}$`,
          'i'
        ),
      });
    }

    if (health_status && String(health_status).trim()) {
      andParts.push({
        health_status: new RegExp(`^${escapeRegex(health_status.trim())}$`, 'i'),
      });
    }
    if (stain && String(stain).trim()) {
      andParts.push({
        stain: new RegExp(`^${escapeRegex(stain.trim())}$`, 'i'),
      });
    }

    if (q && String(q).trim()) {
      const term = escapeRegex(q.trim());
      andParts.push({
        $or: [
          { common_name: new RegExp(term, 'i') },
          { scientific_name: new RegExp(term, 'i') },
          { 'taxonomy.phylum': new RegExp(term, 'i') },
          { 'taxonomy.class': new RegExp(term, 'i') },
          { 'taxonomy.order': new RegExp(term, 'i') },
          { 'taxonomy.family': new RegExp(term, 'i') },
        ],
      });
    }

    const filter = { $and: andParts };

    const skip = (page - 1) * limit;

    const projection =
      'job_id common_name scientific_name taxonomy health_status stain contributor collected_at source created_at approved status';

    const [rawDocs, total] = await Promise.all([
      UploadMetadata.find(filter)
        .select(projection)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UploadMetadata.countDocuments(filter),
    ]);

    const data = rawDocs.map((doc) => {
      const parts = (doc.scientific_name || '').trim().split(/\s+/);
      const genusName = parts[0] || '';
      const speciesName = parts[1] || '';
      const tax = doc.taxonomy || {};
      return {
        jobId: doc.job_id,
        scientificName: doc.scientific_name,
        commonName: doc.common_name,
        class: tax.class || '',
        order: tax.order || '',
        family: tax.family || '',
        phylum: tax.phylum || '',
        genus: genusName,
        speciesEpithet: speciesName,
        description: '',
        healthStatus: doc.health_status,
        stain: doc.stain,
        contributor: doc.contributor,
        collectedAt: doc.collected_at,
        source: doc.source,
        createdAt: doc.created_at,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error browsing blood smear cases',
      error: error.message,
    });
  }
});

// Get blood smear data for a specific species
router.get('/data/:scientificName', async (req, res) => {
  try {
    const { scientificName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // First verify the species exists in our taxonomy
    const species = getSpeciesByScientificName(scientificName);
    if (!species) {
      return res.status(404).json({
        success: false,
        message: `Species '${scientificName}' not found in taxonomy`
      });
    }
    
    // Find blood smear data for this species
    const skip = (page - 1) * limit;
    const bloodSmearData = await UploadMetadata.find({
      scientific_name: scientificName,
      approved: true,
      status: 'ready_for_viewer'
    })
    .select('common_name scientific_name taxonomy health_status stain contributor collected_at source created_at')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await UploadMetadata.countDocuments({
      scientific_name: scientificName,
      approved: true,
      status: 'ready_for_viewer'
    });
    
    res.json({
      success: true,
      data: {
        species: species,
        bloodSmearData: bloodSmearData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blood smear data for species',
      error: error.message
    });
  }
});

// Get detailed blood smear record with images
router.get('/data/:scientificName/:jobId', async (req, res) => {
  try {
    const { scientificName, jobId } = req.params;
    
    // Find the specific blood smear record
    const bloodSmearRecord = await UploadMetadata.findOne({
      scientific_name: scientificName,
      job_id: jobId,
      approved: true,
      status: 'ready_for_viewer'
    });
    
    if (!bloodSmearRecord) {
      return res.status(404).json({
        success: false,
        message: 'Blood smear record not found or not approved'
      });
    }
    
    // Get species information
    const species = getSpeciesByScientificName(scientificName);
    
    // Prepare image URLs
    const imageData = {
      wholeSlideImage: bloodSmearRecord.whole_slide_image?.s3_storage?.s3_url || null,
      cellavisionImages: {}
    };
    
    // Get cellavision images
    if (bloodSmearRecord.cellavision_images) {
      for (const [cellType, images] of bloodSmearRecord.cellavision_images.entries()) {
        imageData.cellavisionImages[cellType] = images
          .map(img => img.s3_storage?.s3_url)
          .filter(Boolean);
      }
    }
    
    res.json({
      success: true,
      data: {
        species: species,
        record: {
          id: bloodSmearRecord._id,
          jobId: bloodSmearRecord.job_id,
          commonName: bloodSmearRecord.common_name,
          scientificName: bloodSmearRecord.scientific_name,
          taxonomy: bloodSmearRecord.taxonomy,
          healthStatus: bloodSmearRecord.health_status,
          stain: bloodSmearRecord.stain,
          contributor: bloodSmearRecord.contributor,
          collectedAt: bloodSmearRecord.collected_at,
          source: bloodSmearRecord.source,
          createdAt: bloodSmearRecord.created_at
        },
        images: imageData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blood smear record details',
      error: error.message
    });
  }
});

// Get all approved blood smear data (for public browsing)
router.get('/data', async (req, res) => {
  try {
    const { page = 1, limit = 20, class: className, order, family } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter based on taxonomy parameters
    let filter = {
      approved: true,
      status: 'ready_for_viewer'
    };
    
    // If specific taxonomy filters are provided, we'll need to match against the taxonomy field
    // This is a simplified approach - in a real implementation, you might want to index taxonomy fields
    
    const bloodSmearData = await UploadMetadata.find(filter)
      .select('common_name scientific_name taxonomy health_status stain contributor collected_at source created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await UploadMetadata.countDocuments(filter);
    
    res.json({
      success: true,
      data: bloodSmearData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blood smear data',
      error: error.message
    });
  }
});

module.exports = router;
