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
      status: 'ready_for_access'
    })
    .select('common_name scientific_name taxonomy health_status stain contributor collected_at source created_at')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await UploadMetadata.countDocuments({
      scientific_name: scientificName,
      approved: true,
      status: 'ready_for_access'
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
      status: 'ready_for_access'
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
      status: 'ready_for_access'
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
