import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './ContributePage.css';

const ContributePage = () => {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState('fullSlide');

  // Taxonomic classification data
  const phylumClassMapping = {
    'Porifera': ['Calcarea', 'Demospongiae', 'Hexactinellida'],
    'Cnidaria': ['Anthozoa', 'Scyphozoa', 'Cubozoa', 'Hydrozoa', 'Staurozoa'],
    'Ctenophora': ['Tentaculata', 'Nuda'],
    'Platyhelminthes': ['Turbellaria', 'Trematoda', 'Cestoda', 'Monogenea'],
    'Nematoda': ['Chromadorea', 'Enoplea'],
    'Rotifera': ['Monogononta', 'Bdelloidea'],
    'Annelida': ['Polychaeta', 'Oligochaeta', 'Hirudinea'],
    'Mollusca': ['Gastropoda', 'Bivalvia', 'Cephalopoda', 'Polyplacophora', 'Monoplacophora', 'Scaphopoda', 'Solenogastres', 'Caudofoveata'],
    'Arthropoda': ['Insecta', 'Arachnida', 'Merostomata', 'Pycnogonida', 'Chilopoda', 'Diplopoda', 'Pauropoda', 'Symphyla', 'Malacostraca', 'Branchiopoda', 'Maxillopoda', 'Ostracoda', 'Remipedia', 'Cephalocarida', 'Hexanauplia'],
    'Echinodermata': ['Asteroidea', 'Ophiuroidea', 'Echinoidea', 'Holothuroidea', 'Crinoidea'],
    'Chordata': ['Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Osteichthyes', 'Chondrichthyes', 'Agnatha', 'Ascidiacea', 'Thaliacea', 'Larvacea', 'Cephalochordata']
  };
  
  const [formData, setFormData] = useState({
    // Common metadata
    common_name: '',
    scientific_name: '',
    phylum: '',
    class: '',
    order: '',
    family: '',
    health_status: '',
    stain: '',
    contributor: '',
    collected_at: '',
    source: '',
    
    // New optional fields
    sex: '',
    age_years: '',
    age_months: '',
    age_days: '',
    magnification: '',
    scanner_type: '',
    disease: '',
    stain_other: '',
    phylum_other: '',
    
    // Full slide specific
    fullSlideImage: null,
    
    // Cellavision specific
    cellTypes: [
      {
        type: 'Neutrophil',
        images: [],
        count: 0
      },
      {
        type: 'Lymphocyte',
        images: [],
        count: 0
      },
      {
        type: 'Monocyte',
        images: [],
        count: 0
      },
      {
        type: 'Eosinophil',
        images: [],
        count: 0
      },
      {
        type: 'Basophil',
        images: [],
        count: 0
      },
      {
        type: 'Platelet',
        images: [],
        count: 0
      },
      {
        type: 'Red Blood Cell',
        images: [],
        count: 0
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [recentUploads, setRecentUploads] = useState(() => {
    // Load recent uploads from localStorage on component mount
    const saved = localStorage.getItem('recentContributions');
    return saved ? JSON.parse(saved) : [];
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If phylum changes, reset class field
    if (name === 'phylum') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        class: '' // Reset class when phylum changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFullSlideImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fullSlideImage: file
      }));
    }
  };

  const handleCellTypeImageChange = (index, e) => {
    const newFiles = Array.from(e.target.files);
    const updatedCellTypes = [...formData.cellTypes];
    
    // Append new files to existing ones instead of replacing
    updatedCellTypes[index].images = [...updatedCellTypes[index].images, ...newFiles];
    updatedCellTypes[index].count = updatedCellTypes[index].images.length;
    
    setFormData(prev => ({
      ...prev,
      cellTypes: updatedCellTypes
    }));
    
    // Clear the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const addCustomCellType = () => {
    const newType = prompt('Enter custom cell type name:');
    if (newType && newType.trim()) {
      setFormData(prev => ({
        ...prev,
        cellTypes: [
          ...prev.cellTypes,
          {
            type: newType.trim(),
            images: [],
            count: 0
          }
        ]
      }));
    }
  };

  const removeCellType = (index) => {
    if (formData.cellTypes.length > 1) {
      const updatedCellTypes = formData.cellTypes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        cellTypes: updatedCellTypes
      }));
    }
  };

  const removeImage = (cellTypeIndex, imageIndex) => {
    const updatedCellTypes = [...formData.cellTypes];
    updatedCellTypes[cellTypeIndex].images = updatedCellTypes[cellTypeIndex].images.filter((_, i) => i !== imageIndex);
    updatedCellTypes[cellTypeIndex].count = updatedCellTypes[cellTypeIndex].images.length;
    
    setFormData(prev => ({
      ...prev,
      cellTypes: updatedCellTypes
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate common metadata
    if (!formData.common_name.trim()) {
      newErrors.common_name = 'Common name is required';
    }
    if (!formData.scientific_name.trim()) {
      newErrors.scientific_name = 'Scientific name is required';
    }
    if (!formData.contributor.trim()) {
      newErrors.contributor = 'Contributor is required';
    }
    if (!formData.collected_at) {
      newErrors.collected_at = 'Collection date is required';
    }
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    // Validate upload type specific requirements
    if (uploadType === 'fullSlide') {
      if (!formData.fullSlideImage) {
        newErrors.fullSlideImage = 'Full slide image is required';
      }
    } else if (uploadType === 'cellavision') {
      const hasImages = formData.cellTypes.some(cellType => cellType.images.length > 0);
      if (!hasImages) {
        newErrors.cellavision = 'At least one cell type must have images';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setJobStatus(null);
      
      try {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Create metadata object for backend
        const metadata = {
          common_name: formData.common_name,
          scientific_name: formData.scientific_name,
          taxonomy: {
            phylum: formData.phylum,
            class: formData.class,
            order: formData.order,
            family: formData.family
          },
          health_status: formData.health_status,
          stain: formData.stain,
          contributor: formData.contributor,
          collected_at: formData.collected_at,
          source: formData.source,
          // Additional optional fields (for future backend support)
          sex: formData.sex,
          age_years: formData.age_years,
          age_months: formData.age_months,
          age_days: formData.age_days,
          magnification: formData.magnification,
          scanner_type: formData.scanner_type,
          disease: formData.disease,
          stain_other: formData.stain_other,
          phylum_other: formData.phylum_other,
          approved: false // User contributions need approval
        };

        // Add metadata as JSON string
        formDataToSend.append('metadata', JSON.stringify(metadata));

        // Add upload type
        formDataToSend.append('uploadType', uploadType);

        if (uploadType === 'fullSlide') {
          formDataToSend.append('whole_slide', formData.fullSlideImage);
        } else if (uploadType === 'cellavision') {
          formData.cellTypes.forEach((cellType, index) => {
            if (cellType.images.length > 0) {
              cellType.images.forEach((image, imageIndex) => {
                formDataToSend.append(`cellavision[${index}]`, image);
              });
              formDataToSend.append(`cell_type[${index}]`, cellType.type);
            }
          });
        }

        // Call the contribute API (different from admin upload)
        const response = await fetch('/api/upload/contribute', {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();
        
        if (response.ok) {
          const newJobId = result.job_id;
          setCurrentJobId(newJobId);
          setJobStatus({
            status: 'received',
            message: result.message,
            job_id: newJobId
          });
          
          // Add to recent contributions
          const newContribution = {
            id: newJobId,
            timestamp: new Date().toISOString(),
            specimen: formData.common_name || 'Unknown Specimen',
            type: uploadType === 'fullSlide' ? 'Full Slide' : 'Cellavision',
            status: 'pending_review'
          };
          
          const updatedContributions = [newContribution, ...recentUploads.slice(0, 4)]; // Keep last 5 contributions
          setRecentUploads(updatedContributions);
          // Save to localStorage
          localStorage.setItem('recentContributions', JSON.stringify(updatedContributions));
          
          // Show success message and redirect to job status page
          setTimeout(() => {
            navigate('/job-status', { 
              state: { 
                jobId: newJobId,
                showSuccessMessage: true,
                isContribution: true
              } 
            });
          }, 2000);
          
          // Reset form after successful upload
          setFormData({
            common_name: '',
            scientific_name: '',
            phylum: '',
            class: '',
            order: '',
            family: '',
            health_status: '',
            stain: '',
            contributor: '',
            collected_at: '',
            source: '',
            sex: '',
            age_years: '',
            age_months: '',
            age_days: '',
            magnification: '',
            scanner_type: '',
            disease: '',
            stain_other: '',
            phylum_other: '',
            fullSlideImage: null,
            cellTypes: [
              { type: 'Neutrophil', images: [], count: 0 },
              { type: 'Lymphocyte', images: [], count: 0 },
              { type: 'Monocyte', images: [], count: 0 },
              { type: 'Eosinophil', images: [], count: 0 },
              { type: 'Basophil', images: [], count: 0 },
              { type: 'Platelet', images: [], count: 0 },
              { type: 'Red Blood Cell', images: [], count: 0 }
            ]
          });
        } else {
          alert(`Contribution failed: ${result.message || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.error('Contribution error:', error);
        alert('Contribution failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const checkJobStatus = async () => {
    if (!currentJobId) return;
    
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/job-status/${currentJobId}`);
      const result = await response.json();
      
      if (response.ok) {
        setJobStatus(result);
      } else {
        alert(`Failed to check status: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Status check error:', error);
      alert('Failed to check contribution status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return '#3b82f6'; // Blue
      case 'processing':
        return '#f59e0b'; // Amber
      case 'completed':
        return '#10b981'; // Green
      case 'failed':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return '📥';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="contribute-page">
      <UCDavisNavbar />
      
      <div className="contribute-container">
        <div className="contribute-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Contribute to the Database</h1>
              <p>Share your blood smear images to help build a comprehensive resource for the veterinary community</p>
            </div>
            <div className="header-right">
              <Link to="/" className="go-home-btn">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>

        {/* Contribution Success Message */}
        {jobStatus && jobStatus.status === 'received' && (
          <div className="contribute-success-container">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h3>Contribution Submitted!</h3>
              <p className="success-message">{jobStatus.message}</p>
              <div className="job-id-display">
                <strong>Submission ID:</strong> <span className="job-id">{jobStatus.job_id}</span>
                <button 
                  className="copy-job-id-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(jobStatus.job_id);
                    // Show temporary success message
                    const btn = document.querySelector('.copy-job-id-btn');
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = '#10b981';
                    setTimeout(() => {
                      btn.textContent = originalText;
                      btn.style.background = '';
                    }, 2000);
                  }}
                  title="Copy Submission ID to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <div className="review-notice">
                <h4>📋 Review Process</h4>
                <p>Your contribution will be reviewed by our team before being added to the database. This process typically takes 2-3 business days.</p>
              </div>
              <p className="redirect-message">
                Redirecting to submission status page in a few seconds...
              </p>
              <div className="redirect-actions">
                <button 
                  className="view-status-btn"
                  onClick={() => navigate('/job-status', { 
                    state: { 
                      jobId: jobStatus.job_id,
                      isContribution: true
                    } 
                  })}
                >
                  View Submission Status
                </button>
                <button 
                  className="contribute-another-btn"
                  onClick={() => {
                    setJobStatus(null);
                    setCurrentJobId(null);
                  }}
                >
                  Contribute Another Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons-container">
          <button 
            className="recent-contributions-btn"
            onClick={() => navigate('/recent-contributions')}
            title="View recent contributions and Submission IDs"
          >
            📋 Recent Contributions {recentUploads.length > 0 && `(${recentUploads.length})`}
          </button>
        </div>

        {/* Contribution Guidelines */}
        <div className="guidelines-container">
          <h2>Contribution Guidelines</h2>
          <div className="guidelines-content">
            <div className="guideline-item">
              <div className="guideline-icon">📸</div>
              <h3>Image Quality</h3>
              <p>Ensure your images are clear, well-focused, and properly stained for accurate analysis.</p>
            </div>
            <div className="guideline-item">
              <div className="guideline-icon">📝</div>
              <h3>Complete Metadata</h3>
              <p>Provide accurate species identification and collection information to help other researchers.</p>
            </div>
            <div className="guideline-item">
              <div className="guideline-icon">🔍</div>
              <h3>Review Process</h3>
              <p>All contributions are reviewed by experts before being added to the public database.</p>
            </div>
          </div>
        </div>

        <div className="upload-type-selector">
          <h2>Select Upload Type</h2>
          <div className="upload-type-buttons">
            <button
              type="button"
              className={`upload-type-btn ${uploadType === 'fullSlide' ? 'active' : ''}`}
              onClick={() => setUploadType('fullSlide')}
            >
              Full Slide Image
            </button>
            <button
              type="button"
              className={`upload-type-btn ${uploadType === 'cellavision' ? 'active' : ''}`}
              onClick={() => setUploadType('cellavision')}
            >
              Cellavision Images
            </button>
          </div>
        </div>

        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            {/* Common Metadata Section */}
            <div className="form-section">
              <h3>Specimen Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="common_name">Common Name *</label>
                  <input
                    type="text"
                    id="common_name"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleInputChange}
                    className={errors.common_name ? 'error' : ''}
                    placeholder="e.g., Somali Ostrich"
                  />
                  {errors.common_name && <span className="error-message">{errors.common_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="scientific_name">Scientific Name *</label>
                  <input
                    type="text"
                    id="scientific_name"
                    name="scientific_name"
                    value={formData.scientific_name}
                    onChange={handleInputChange}
                    className={errors.scientific_name ? 'error' : ''}
                    placeholder="e.g., Struthio molybdophanes"
                  />
                  {errors.scientific_name && <span className="error-message">{errors.scientific_name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phylum">Phylum</label>
                  <select
                    id="phylum"
                    name="phylum"
                    value={formData.phylum}
                    onChange={handleInputChange}
                  >
                    <option value="">Select phylum</option>
                    <option value="Porifera">Porifera (Sponges)</option>
                    <option value="Cnidaria">Cnidaria (Jellyfish, Corals, Anemones)</option>
                    <option value="Ctenophora">Ctenophora (Comb jellies)</option>
                    <option value="Platyhelminthes">Platyhelminthes (Flatworms)</option>
                    <option value="Nematoda">Nematoda (Roundworms)</option>
                    <option value="Rotifera">Rotifera</option>
                    <option value="Annelida">Annelida (Segmented worms)</option>
                    <option value="Mollusca">Mollusca (Snails, Clams, Octopus, etc.)</option>
                    <option value="Arthropoda">Arthropoda (Insects, Crustaceans, Spiders, etc.)</option>
                    <option value="Echinodermata">Echinodermata (Starfish, Sea Urchins, etc.)</option>
                    <option value="Chordata">Chordata (Vertebrates + a few others)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Conditional Other Phylum Field */}
                {formData.phylum === 'Other' && (
                  <div className="form-group">
                    <label htmlFor="phylum_other">Specify Other Phylum</label>
                    <input
                      type="text"
                      id="phylum_other"
                      name="phylum_other"
                      value={formData.phylum_other}
                      onChange={handleInputChange}
                      placeholder="e.g., Bryozoa, Brachiopoda, etc."
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="class">Class</label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    disabled={!formData.phylum}
                  >
                    <option value="">Select class</option>
                    {formData.phylum && phylumClassMapping[formData.phylum]?.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="order">Order</label>
                  <input
                    type="text"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="e.g., Struthioniformes"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="family">Family</label>
                  <input
                    type="text"
                    id="family"
                    name="family"
                    value={formData.family}
                    onChange={handleInputChange}
                    placeholder="e.g., Struthionidae"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="health_status">Health Status</label>
                  <select
                    id="health_status"
                    name="health_status"
                    value={formData.health_status}
                    onChange={handleInputChange}
                  >
                    <option value="">Select health status</option>
                    <option value="Clinically Healthy">Clinically Healthy</option>
                    <option value="Diseased">Diseased</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stain">Stain Type</label>
                  <select
                    id="stain"
                    name="stain"
                    value={formData.stain}
                    onChange={handleInputChange}
                  >
                    <option value="">Select stain type</option>
                    <option value="Diff-Quik">Diff-Quik</option>
                    <option value="Wright-Giemsa">Wright-Giemsa</option>
                    <option value="Acid-fast">Acid-fast</option>
                    <option value="New Methylene Blue">New Methylene Blue</option>
                    <option value="Grocott's Methenamine Silver (GMS)">Grocott's Methenamine Silver (GMS)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Conditional Other Stain Field */}
                {formData.stain === 'Other' && (
                  <div className="form-group">
                    <label htmlFor="stain_other">Specify Other Stain Type</label>
                    <input
                      type="text"
                      id="stain_other"
                      name="stain_other"
                      value={formData.stain_other}
                      onChange={handleInputChange}
                      placeholder="e.g., May-Grünwald-Giemsa, Romanowsky, etc."
                    />
                  </div>
                )}

                {/* Conditional Disease Field */}
                {formData.health_status === 'Diseased' && (
                  <div className="form-group">
                    <label htmlFor="disease">Disease Information</label>
                    <input
                      type="text"
                      id="disease"
                      name="disease"
                      value={formData.disease}
                      onChange={handleInputChange}
                      placeholder="e.g., Anemia, Leukemia, Infection"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contributor">Contributor *</label>
                  <input
                    type="text"
                    id="contributor"
                    name="contributor"
                    value={formData.contributor}
                    onChange={handleInputChange}
                    className={errors.contributor ? 'error' : ''}
                    placeholder="e.g., Dr. John Smith"
                  />
                  {errors.contributor && <span className="error-message">{errors.contributor}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="collected_at">Collection Date *</label>
                  <input
                    type="date"
                    id="collected_at"
                    name="collected_at"
                    value={formData.collected_at}
                    onChange={handleInputChange}
                    className={errors.collected_at ? 'error' : ''}
                  />
                  {errors.collected_at && <span className="error-message">{errors.collected_at}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="source">Source *</label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className={errors.source ? 'error' : ''}
                    placeholder="e.g., Wildlife Center, Zoo, Clinic"
                  />
                  {errors.source && <span className="error-message">{errors.source}</span>}
                </div>
              </div>

              {/* Additional Optional Information */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sex">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <div className="age-inputs">
                    <div className="age-field">
                      <input
                        type="number"
                        id="age_years"
                        name="age_years"
                        value={formData.age_years}
                        onChange={handleInputChange}
                        placeholder="Years"
                        min="0"
                      />
                      <label htmlFor="age_years" className="age-label">Years</label>
                    </div>
                    <div className="age-field">
                      <input
                        type="number"
                        id="age_months"
                        name="age_months"
                        value={formData.age_months}
                        onChange={handleInputChange}
                        placeholder="Months"
                        min="0"
                        max="11"
                      />
                      <label htmlFor="age_months" className="age-label">Months</label>
                    </div>
                    <div className="age-field">
                      <input
                        type="number"
                        id="age_days"
                        name="age_days"
                        value={formData.age_days}
                        onChange={handleInputChange}
                        placeholder="Days"
                        min="0"
                        max="30"
                      />
                      <label htmlFor="age_days" className="age-label">Days</label>
                    </div>
                  </div>
                  <p className="age-help-text">Fill in any combination of age units (e.g., 2 years, 3 months, 15 days)</p>
                </div>

                <div className="form-group">
                  <label htmlFor="magnification">Magnification</label>
                  <select
                    id="magnification"
                    name="magnification"
                    value={formData.magnification}
                    onChange={handleInputChange}
                  >
                    <option value="">Select magnification</option>
                    <option value="40x">40x</option>
                    <option value="50x">50x</option>
                    <option value="60x">60x</option>
                    <option value="100x">100x</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="scanner_type">Scanner Type</label>
                  <select
                    id="scanner_type"
                    name="scanner_type"
                    value={formData.scanner_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select scanner type</option>
                    <option value="Olympus">Olympus</option>
                    <option value="Grundium">Grundium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Upload Type Specific Section */}
            {uploadType === 'fullSlide' && (
              <div className="form-section">
                <h3>Full Slide Image</h3>
                <div className="form-group">
                  <label htmlFor="fullSlideImage">Upload Full Slide Image *</label>
                  <input
                    type="file"
                    id="fullSlideImage"
                    name="fullSlideImage"
                    accept=".tiff,.tif,.vsi,.ndpi,.svs"
                    onChange={handleFullSlideImageChange}
                    className={errors.fullSlideImage ? 'error' : ''}
                  />
                  <p className="file-help">Supported formats: TIFF, VSI, NDPI, SVS</p>
                  {errors.fullSlideImage && <span className="error-message">{errors.fullSlideImage}</span>}
                </div>
              </div>
            )}

            {uploadType === 'cellavision' && (
              <div className="form-section">
                <h3>Cellavision Images</h3>
               
                {formData.cellTypes.map((cellType, index) => (
                  <div key={index} className="cell-type-section">
                    <div className="cell-type-header">
                      <h4>{cellType.type}</h4>
                      <div className="cell-type-controls">
                        <span className="image-count">{cellType.count} images</span>
                        {formData.cellTypes.length > 1 && (
                          <button
                            type="button"
                            className="remove-cell-type-btn"
                            onClick={() => removeCellType(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`cellType-${index}`}>
                        Upload {cellType.type} Images
                      </label>
                      
                      {/* Always show the add images button */}
                      <div className="add-images-section">
                        <button
                          type="button"
                          className="add-images-btn"
                          onClick={() => document.getElementById(`cellType-${index}`).click()}
                        >
                          {cellType.images.length === 0 ? '+ Add Images' : '+ Add More Images'}
                        </button>
                        <input
                          type="file"
                          id={`cellType-${index}`}
                          name={`cellType-${index}`}
                          accept=".jpg,.jpeg,.png,.tiff,.tif"
                          multiple
                          onChange={(e) => handleCellTypeImageChange(index, e)}
                          style={{ display: 'none' }}
                        />
                        <p className="file-help">
                          {cellType.images.length === 0 
                            ? 'Click to select multiple images (JPG, PNG, TIFF)' 
                            : 'Click to add more images to this cell type'
                          }
                        </p>
                      </div>
                      
                      {/* Display selected images */}
                      {cellType.images.length > 0 && (
                        <div className="selected-images">
                          <div className="images-header">
                            <h5>Selected Images ({cellType.images.length})</h5>
                          </div>
                          <div className="image-list">
                            {cellType.images.map((image, imageIndex) => (
                              <div key={imageIndex} className="image-item">
                                <div className="image-info">
                                  <span className="image-name">{image.name}</span>
                                  <span className="image-size">({(image.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button
                                  type="button"
                                  className="remove-image-btn"
                                  onClick={() => removeImage(index, imageIndex)}
                                  title="Remove this image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="add-cell-type-btn"
                  onClick={addCustomCellType}
                >
                  + Add Custom Cell Type
                </button>
                
                {errors.cellavision && <span className="error-message">{errors.cellavision}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="contribute-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting for Review...' : 'Submit for Review'}
            </button>
          </form>
        </div>

        {/* Physical Submission Address */}
        <div className="physical-address-container">
          <h2>Physical Slide Submission</h2>
          <div className="address-content">
            <div className="address-icon">📬</div>
            <div className="address-details">
              <h3>Send Glass Slides To:</h3>
              <div className="address-block">
                <p><strong>Attention: Bloodsmear Library</strong></p>
                <p>UC Davis VMTH</p>
                <p>Clinical Laboratory Receiving, Rm 1033</p>
                <p>1 Garrod Drive</p>
                <p>Davis, CA 95616</p>
              </div>
              <p className="address-note">
                Please include your contact information and any relevant specimen details with your physical submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributePage;
