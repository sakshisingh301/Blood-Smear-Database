import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './SpeciesListPage.css';


const SpeciesListPage = () => {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedGenus, setSelectedGenus] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    // Mock data for UI testing (backend API not implemented yet)
    const mockSpecies = [
      {
        scientificName: "Passer domesticus",
        commonName: "House Sparrow",
        class: "Aves",
        order: "Passeriformes",
        family: "Passeridae",
        description: "A small bird found in urban areas worldwide. House sparrows are highly adaptable and have colonized nearly every corner of the globe."
      },
      {
        scientificName: "Canis lupus",
        commonName: "Gray Wolf",
        class: "Mammalia",
        order: "Carnivora",
        family: "Canidae",
        description: "A large carnivorous mammal native to wilderness areas. Gray wolves are apex predators and live in complex social structures called packs."
      },
      {
        scientificName: "Felis catus",
        commonName: "Domestic Cat",
        class: "Mammalia",
        order: "Carnivora",
        family: "Felidae",
        description: "A small domesticated carnivorous mammal. Cats have been associated with humans for at least 9,500 years."
      },
      {
        scientificName: "Tyto alba",
        commonName: "Barn Owl",
        class: "Aves",
        order: "Strigiformes",
        family: "Tytonidae",
        description: "A pale-colored owl found on every continent except Antarctica. Barn owls are known for their heart-shaped facial disk."
      },
      {
        scientificName: "Panthera leo",
        commonName: "Lion",
        class: "Mammalia",
        order: "Carnivora",
        family: "Felidae",
        description: "A large cat species native to Africa and India. Lions are the only cats that live in groups called prides."
      },
      {
        scientificName: "Aquila chrysaetos",
        commonName: "Golden Eagle",
        class: "Aves",
        order: "Accipitriformes",
        family: "Accipitridae",
        description: "A large bird of prey found across the Northern Hemisphere. Golden eagles are among the largest and most formidable raptors."
      },
      {
        scientificName: "Vulpes vulpes",
        commonName: "Red Fox",
        class: "Mammalia",
        order: "Carnivora",
        family: "Canidae",
        description: "The largest of the true foxes and most widespread carnivore in the world. Red foxes are highly adaptable to various environments."
      },
      {
        scientificName: "Corvus corax",
        commonName: "Common Raven",
        class: "Aves",
        order: "Passeriformes",
        family: "Corvidae",
        description: "One of the largest and most intelligent bird species. Ravens are known for their problem-solving abilities and complex vocalizations."
      },
      {
        scientificName: "Ursus arctos",
        commonName: "Brown Bear",
        class: "Mammalia",
        order: "Carnivora",
        family: "Ursidae",
        description: "A large bear species found across Eurasia and North America. Brown bears are omnivores with a varied diet."
      },
      {
        scientificName: "Falco peregrinus",
        commonName: "Peregrine Falcon",
        class: "Aves",
        order: "Falconiformes",
        family: "Falconidae",
        description: "The fastest animal on Earth when diving. Peregrine falcons can reach speeds over 240 mph during their hunting stoop."
      },
      {
        scientificName: "Equus ferus",
        commonName: "Domestic Horse",
        class: "Mammalia",
        order: "Perissodactyla",
        family: "Equidae",
        description: "A domesticated odd-toed ungulate. Horses have been companions and workers for humans for thousands of years."
      },
      {
        scientificName: "Bubo bubo",
        commonName: "Eurasian Eagle-Owl",
        class: "Aves",
        order: "Strigiformes",
        family: "Strigidae",
        description: "One of the largest species of owl. These powerful predators can take prey as large as foxes and young deer."
      }
    ];

    // Simulate API delay and set mock data
    setTimeout(() => {
      setSpecies(mockSpecies);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    filterSpecies();
    setCurrentPage(1); // Reset to first page when filters change
  }, [species, searchQuery, selectedClass, selectedOrder, selectedFamily, selectedGenus, selectedSpecies]);

  const filterSpecies = () => {
    let filtered = species;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(species => 
        species.commonName.toLowerCase().includes(query) ||
        species.scientificName.toLowerCase().includes(query) ||
        species.family.toLowerCase().includes(query) ||
        species.order.toLowerCase().includes(query) ||
        species.class.toLowerCase().includes(query)
      );
    }

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(species => species.class === selectedClass);
    }

    // Filter by order
    if (selectedOrder !== 'all') {
      filtered = filtered.filter(species => species.order === selectedOrder);
    }

    // Filter by family
    if (selectedFamily !== 'all') {
      filtered = filtered.filter(species => species.family === selectedFamily);
    }

    // Filter by genus (extract from scientific name)
    if (selectedGenus !== 'all') {
      filtered = filtered.filter(species => {
        const genus = species.scientificName.split(' ')[0];
        return genus === selectedGenus;
      });
    }

    // Filter by species (extract from scientific name)
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(species => {
        const speciesName = species.scientificName.split(' ')[1];
        return speciesName === selectedSpecies;
      });
    }

    setFilteredSpecies(filtered);
  };

  const getUniqueClasses = () => {
    return [...new Set(species.map(s => s.class))];
  };

  const getUniqueOrders = () => {
    return [...new Set(species.map(s => s.order))];
  };

  const getUniqueFamilies = () => {
    return [...new Set(species.map(s => s.family))];
  };

  const getUniqueGenera = () => {
    return [...new Set(species.map(s => s.scientificName.split(' ')[0]))];
  };

  const getUniqueSpecies = () => {
    return [...new Set(species.map(s => s.scientificName.split(' ')[1]))];
  };

  const getSpeciesCountByClass = (className) => {
    return species.filter(s => s.class === className).length;
  };

  const getSpeciesCountByOrder = (orderName) => {
    return species.filter(s => s.order === orderName).length;
  };

  const getSpeciesCountByFamily = (familyName) => {
    return species.filter(s => s.family === familyName).length;
  };

  const getSpeciesCountByGenus = (genusName) => {
    return species.filter(s => s.scientificName.split(' ')[0] === genusName).length;
  };

  const getSpeciesCountBySpecies = (speciesName) => {
    return species.filter(s => s.scientificName.split(' ')[1] === speciesName).length;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpecies = filteredSpecies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSpecies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="species-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading species data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="species-list-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="species-list-page">
      <UCDavisNavbar />
      
      {/* Main Content Container */}
      <div className="main-content">
        {/* Left Sidebar Navigation */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Explore Taxonomy</h3>
            <div className="taxonomy-nav">
              <div className="taxonomy-group">
                <h4>Birds (Aves)</h4>
                <ul>
                  <li><a href="#paleognathae">Paleognathae</a></li>
                  <li><a href="#galloanseres">Galloanseres</a></li>
                  <li><a href="#neoaves">Neoaves</a></li>
                  <li><a href="#telluraves">Telluraves</a></li>
                  <li><a href="#australaves">Australaves</a></li>
                </ul>
              </div>
              <div className="taxonomy-group">
                <h4>Mammals (Mammalia)</h4>
                <ul>
                  <li><a href="#carnivora">Carnivora</a></li>
                  <li><a href="#primates">Primates</a></li>
                  <li><a href="#rodentia">Rodentia</a></li>
                  <li><a href="#artiodactyla">Artiodactyla</a></li>
                </ul>
              </div>
              <div className="taxonomy-group">
                <h4>Reptiles (Reptilia)</h4>
                <ul>
                  <li><a href="#squamata">Squamata</a></li>
                  <li><a href="#testudines">Testudines</a></li>
                  <li><a href="#crocodylia">Crocodylia</a></li>
                  <li><a href="#rhynchocephalia">Rhynchocephalia</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Quick Stats</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">{species.filter(s => s.class === 'Aves').length}</span>
                <span className="stat-label">Bird Species</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{species.filter(s => s.class === 'Mammalia').length}</span>
                <span className="stat-label">Mammal Species</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{species.filter(s => s.class === 'Reptilia').length}</span>
                <span className="stat-label">Reptile Species</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{getUniqueOrders().length}</span>
                <span className="stat-label">Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          <div className="page-header">
            <h1>Search Criteria</h1>
            <p>Filter and search through our comprehensive collection of exotic animal blood smear specimens</p>
          </div>

          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by common name, scientific name, class, order, or family..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="class-filter">Class:</label>
                <select
                  id="class-filter"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Classes</option>
                  {getUniqueClasses().map(className => (
                    <option key={className} value={className}>
                      {className} ({getSpeciesCountByClass(className)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="order-filter">Order:</label>
                <select
                  id="order-filter"
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Orders</option>
                  {getUniqueOrders().map(orderName => (
                    <option key={orderName} value={orderName}>
                      {orderName} ({getSpeciesCountByOrder(orderName)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="family-filter">Family:</label>
                <select
                  id="family-filter"
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Families</option>
                  {getUniqueFamilies().map(familyName => (
                    <option key={familyName} value={familyName}>
                      {familyName} ({getSpeciesCountByFamily(familyName)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="genus-filter">Genus:</label>
                <select
                  id="genus-filter"
                  value={selectedGenus}
                  onChange={(e) => setSelectedGenus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Genera</option>
                  {getUniqueGenera().map(genusName => (
                    <option key={genusName} value={genusName}>
                      {genusName} ({getSpeciesCountByGenus(genusName)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="species-filter">Species:</label>
                <select
                  id="species-filter"
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Species</option>
                  {getUniqueSpecies().map(speciesName => (
                    <option key={speciesName} value={speciesName}>
                      {speciesName} ({getSpeciesCountBySpecies(speciesName)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="results-summary">
            <p>
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredSpecies.length)} of {filteredSpecies.length} species
              {searchQuery && ` matching "${searchQuery}"`}
              {filteredSpecies.length > itemsPerPage && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          <div className="species-list">
            {currentSpecies.map((speciesItem) => (
              <Link
                key={speciesItem.scientificName}
                to={`/species/${encodeURIComponent(speciesItem.scientificName)}`}
                className="species-item"
              >
                <div className="species-item-content">
                  <div className="species-names">
                    <h3 className="species-common-name">{speciesItem.commonName}</h3>
                    <p className="species-scientific-name">
                      <em>{speciesItem.scientificName}</em>
                    </p>
                  </div>
                  
                  <div className="species-taxonomy">
                    <span className="taxonomy-badge">{speciesItem.family}</span>
                    <span className="taxonomy-badge">{speciesItem.order}</span>
                    <span className="taxonomy-badge">{speciesItem.class}</span>
                  </div>
                  
                  {speciesItem.description && (
                    <p className="species-description">
                      {speciesItem.description.length > 200 
                        ? `${speciesItem.description.substring(0, 200)}...`
                        : speciesItem.description
                      }
                    </p>
                  )}
                </div>
                
                <div className="species-arrow">
                  →
                </div>
              </Link>
            ))}
          </div>

          {filteredSpecies.length === 0 && (
            <div className="no-results">
              <h3>No species found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="pagination-numbers">
                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      className={`pagination-number ${
                        pageNumber === currentPage ? 'active' : ''
                      } ${pageNumber === '...' ? 'ellipsis' : ''}`}
                      onClick={() => typeof pageNumber === 'number' && paginate(pageNumber)}
                      disabled={pageNumber === '...'}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button
                  className="pagination-button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
              
              <div className="pagination-info">
                <p>
                  Page {currentPage} of {totalPages} • {filteredSpecies.length} total species
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeciesListPage;
