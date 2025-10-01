import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './UploadedDataPage.css';

const UploadedDataPage = () => {
  const navigate = useNavigate();
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [fullscreenImage, setFullscreenImage] = useState(null); // For full-screen image viewer

  // Dummy data to demonstrate the functionality
  useEffect(() => {
    const dummyData = [
      {
        id: 'upload-001',
        timestamp: '2024-01-15T10:30:00Z',
        uploadType: 'fullSlide',
        metadata: {
          common_name: 'Somali Ostrich',
          scientific_name: 'Struthio molybdophanes',
          order: 'Struthioniformes',
          family: 'Struthionidae',
          group: 'Bird',
          health_status: 'Clinically Healthy',
          stain: 'Wright-Giemsa',
          contributor: 'Dr. Sarah Johnson',
          collected_at: '2024-01-10',
          source: 'UC Davis Primate Center'
        },
        images: [
          {
            type: 'whole_slide',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            filename: '22K002-1.tiff',
            size: '45.2 MB',
            dimensions: '2048x1536'
          }
        ],
        status: 'completed',
        processing_time: '2 minutes 34 seconds'
      },
      {
        id: 'upload-002',
        timestamp: '2024-01-14T14:20:00Z',
        uploadType: 'cellavision',
        metadata: {
          common_name: 'Rhesus Macaque',
          scientific_name: 'Macaca mulatta',
          order: 'Primates',
          family: 'Cercopithecidae',
          group: 'Mammal',
          health_status: 'Diseased',
          stain: 'Diff-Quik',
          contributor: 'Dr. Michael Chen',
          collected_at: '2024-01-08',
          source: 'UC Davis Veterinary Hospital'
        },
        images: [
          {
            type: 'Neutrophil',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            filename: 'neutrophil_001.jpg',
            size: '2.1 MB',
            dimensions: '512x512'
          },
          {
            type: 'Lymphocyte',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            filename: 'lymphocyte_001.jpg',
            size: '1.8 MB',
            dimensions: '512x512'
          },
          {
            type: 'Monocyte',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            filename: 'monocyte_001.jpg',
            size: '2.3 MB',
            dimensions: '512x512'
          },
          {
            type: 'Eosinophil',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            filename: 'eosinophil_001.jpg',
            size: '1.9 MB',
            dimensions: '512x512'
          }
        ],
        status: 'completed',
        processing_time: '1 minute 45 seconds'
      },
      {
        id: 'upload-003',
        timestamp: '2024-01-13T09:15:00Z',
        uploadType: 'fullSlide',
        metadata: {
          common_name: 'Common Chimpanzee',
          scientific_name: 'Pan troglodytes',
          order: 'Primates',
          family: 'Hominidae',
          group: 'Mammal',
          health_status: 'Clinically Healthy',
          stain: 'May-Grünwald-Giemsa',
          contributor: 'Dr. Emily Rodriguez',
          collected_at: '2024-01-05',
          source: 'UC Davis Primate Center'
        },
        images: [
          {
            type: 'whole_slide',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            filename: 'chimpanzee_blood_001.tiff',
            size: '38.7 MB',
            dimensions: '2048x1536'
          }
        ],
        status: 'completed',
        processing_time: '3 minutes 12 seconds'
      },
      {
        id: 'upload-004',
        timestamp: '2024-01-12T16:45:00Z',
        uploadType: 'cellavision',
        metadata: {
          common_name: 'Capuchin Monkey',
          scientific_name: 'Cebus capucinus',
          order: 'Primates',
          family: 'Cebidae',
          group: 'Mammal',
          health_status: 'Unknown',
          stain: 'Wright-Giemsa',
          contributor: 'Dr. David Kim',
          collected_at: '2024-01-03',
          source: 'UC Davis Research Facility'
        },
        images: [
          {
            type: 'Platelet',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            filename: 'platelet_001.jpg',
            size: '1.5 MB',
            dimensions: '512x512'
          },
          {
            type: 'Red Blood Cell',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            filename: 'rbc_001.jpg',
            size: '2.0 MB',
            dimensions: '512x512'
          },
          {
            type: 'Basophil',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            filename: 'basophil_001.jpg',
            size: '1.7 MB',
            dimensions: '512x512'
          }
        ],
        status: 'completed',
        processing_time: '2 minutes 8 seconds'
      }
    ];
    setUploadedData(dummyData);
  }, []);

  const handleUploadClick = (upload) => {
    setSelectedUpload(upload);
  };

  const closeUploadDetail = () => {
    setSelectedUpload(null);
  };

  const handleImageClick = (image, event) => {
    event.stopPropagation(); // Prevent opening upload details modal
    setFullscreenImage(image);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && fullscreenImage) {
        closeFullscreenImage();
      }
    };

    if (fullscreenImage) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [fullscreenImage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⚙️';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'processing':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getUploadTypeIcon = (type) => {
    switch (type) {
      case 'fullSlide':
        return '🔬';
      case 'cellavision':
        return '🔍';
      default:
        return '📋';
    }
  };

  return (
    <div className="uploaded-data-page">
      <UCDavisNavbar />
      
      <div className="uploaded-data-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>📊 Uploaded Data</h1>
              <p>View all your uploaded blood smear images and metadata</p>
            </div>
            <div className="header-actions">
              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  🔲 Grid
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  📋 List
                </button>
              </div>
              <Link to="/admin/upload" className="back-to-upload-btn">
                ← Back to Upload
              </Link>
            </div>
          </div>
        </div>

        <div className="main-content-wrapper">
          <div className="main-content">
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">{uploadedData.length}</div>
                  <div className="stat-label">Total Uploads</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔬</div>
                <div className="stat-content">
                  <div className="stat-number">
                    {uploadedData.filter(u => u.uploadType === 'fullSlide').length}
                  </div>
                  <div className="stat-label">Full Slide Images</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔍</div>
                <div className="stat-content">
                  <div className="stat-number">
                    {uploadedData.filter(u => u.uploadType === 'cellavision').length}
                  </div>
                  <div className="stat-label">Cellavision Images</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">
                    {uploadedData.filter(u => u.status === 'completed').length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
            </div>

            <div className="uploads-content">
              {viewMode === 'grid' ? (
                <div className="uploads-grid">
                  {uploadedData.map((upload) => (
                    <div 
                      key={upload.id} 
                      className="upload-card"
                      onClick={() => handleUploadClick(upload)}
                    >
                      <div className="card-header">
                        <div className="upload-type-badge">
                          {getUploadTypeIcon(upload.uploadType)} {upload.uploadType === 'fullSlide' ? 'Full Slide' : 'Cellavision'}
                        </div>
                        <div className="status-badge" style={{ backgroundColor: getStatusColor(upload.status) }}>
                          {getStatusIcon(upload.status)} {upload.status}
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <h3 className="specimen-name">{upload.metadata.common_name}</h3>
                        <p className="scientific-name">{upload.metadata.scientific_name}</p>
                        <p className="contributor">By: {upload.metadata.contributor}</p>
                        <p className="upload-date">
                          {new Date(upload.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="card-footer">
                        <div className="image-count">
                          {upload.images.length} image{upload.images.length !== 1 ? 's' : ''}
                        </div>
                        <div className="processing-time">
                          {upload.processing_time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="uploads-list">
                  {uploadedData.map((upload) => (
                    <div 
                      key={upload.id} 
                      className="upload-list-item"
                      onClick={() => handleUploadClick(upload)}
                    >
                      <div className="list-item-main">
                        <div className="item-type">
                          {getUploadTypeIcon(upload.uploadType)}
                        </div>
                        <div className="item-info">
                          <h3>{upload.metadata.common_name}</h3>
                          <p>{upload.metadata.scientific_name}</p>
                          <span className="contributor-info">Contributor: {upload.metadata.contributor}</span>
                        </div>
                        <div className="item-status">
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(upload.status) }}>
                            {getStatusIcon(upload.status)} {upload.status}
                          </span>
                        </div>
                      </div>
                      <div className="list-item-details">
                        <span className="upload-date">
                          {new Date(upload.timestamp).toLocaleDateString()}
                        </span>
                        <span className="image-count">
                          {upload.images.length} image{upload.images.length !== 1 ? 's' : ''}
                        </span>
                        <span className="processing-time">
                          {upload.processing_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Sidebar */}
          <div className="user-sidebar">
            <div className="user-profile-card">
              <div className="user-avatar">
                <span className="avatar-text">👤</span>
              </div>
              <div className="user-info">
                <h3 className="username">Dr. Sarah Johnson</h3>
                <p className="user-role">Administrator</p>
                <p className="user-department">UC Davis Primate Center</p>
              </div>
              <div className="user-stats">
                <div className="user-stat-item">
                  <span className="stat-number">{uploadedData.length}</span>
                  <span className="stat-label">Total Uploads</span>
                </div>
                <div className="user-stat-item">
                  <span className="stat-number">
                    {uploadedData.filter(u => u.metadata.contributor === 'Dr. Sarah Johnson').length}
                  </span>
                  <span className="stat-label">My Uploads</span>
                </div>
                <div className="user-stat-item">
                  <span className="stat-number">
                    {uploadedData.filter(u => u.status === 'completed' && u.metadata.contributor === 'Dr. Sarah Johnson').length}
                  </span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              <div className="user-actions">
                <button className="profile-btn">Edit Profile</button>
                <button className="settings-btn">Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Detail Modal */}
      {selectedUpload && (
        <div className="upload-detail-modal" onClick={closeUploadDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Details</h2>
              <button className="close-btn" onClick={closeUploadDetail}>×</button>
            </div>
            
                          <div className="modal-body">
                <div className="detail-section">
                  <div className="metadata-grid">
                  <div className="metadata-item">
                    <label>Common Name:</label>
                    <span>{selectedUpload.metadata.common_name}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Scientific Name:</label>
                    <span>{selectedUpload.metadata.scientific_name}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Order:</label>
                    <span>{selectedUpload.metadata.order}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Family:</label>
                    <span>{selectedUpload.metadata.family}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Group:</label>
                    <span>{selectedUpload.metadata.group}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Health Status:</label>
                    <span>{selectedUpload.metadata.health_status}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Stain Type:</label>
                    <span>{selectedUpload.metadata.stain}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Contributor:</label>
                    <span>{selectedUpload.metadata.contributor}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Collection Date:</label>
                    <span>{selectedUpload.metadata.collected_at}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Source:</label>
                    <span>{selectedUpload.metadata.source}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>🖼️ Images ({selectedUpload.images.length})</h3>
                <div className="images-grid">
                  {selectedUpload.images.map((image, index) => (
                    <div key={index} className="image-card">
                      <div className="image-preview">
                        <img 
                          src={image.url} 
                          alt={`${image.type} - ${image.filename}`}
                          onClick={(e) => handleImageClick(image, e)}
                          className="clickable-image"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop';
                            e.target.alt = 'Fallback Image';
                          }}
                        />
                      </div>
                      <div className="image-info">
                        <h4>{image.type}</h4>
                        <p className="filename">{image.filename}</p>
                        <p className="file-details">
                          {image.size} • {image.dimensions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>📊 Processing Information</h3>
                <div className="processing-info">
                  <div className="info-item">
                    <label>Upload ID:</label>
                    <span className="upload-id">{selectedUpload.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Upload Type:</label>
                    <span>{selectedUpload.uploadType === 'fullSlide' ? 'Full Slide Image' : 'Cellavision Images'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedUpload.status) }}>
                      {getStatusIcon(selectedUpload.status)} {selectedUpload.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Processing Time:</label>
                    <span>{selectedUpload.processing_time}</span>
                  </div>
                  <div className="info-item">
                    <label>Upload Date:</label>
                    <span>{new Date(selectedUpload.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Viewer Modal */}
      {fullscreenImage && (
        <div className="fullscreen-image-modal" onClick={closeFullscreenImage}>
          <div className="fullscreen-image-container">
            <div className="fullscreen-image-header">
              <h3>{fullscreenImage.type} - {fullscreenImage.filename}</h3>
              <button className="close-fullscreen-btn" onClick={closeFullscreenImage}>×</button>
            </div>
            <div className="fullscreen-image-content">
              <img 
                src={fullscreenImage.url} 
                alt={`${fullscreenImage.type} - ${fullscreenImage.filename}`}
                className="fullscreen-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop';
                  e.target.alt = 'Fallback Image';
                }}
              />
            </div>
            <div className="fullscreen-image-footer">
              <p className="image-details">
                {fullscreenImage.size} • {fullscreenImage.dimensions}
              </p>
              <p className="image-instructions">
                Click outside the image or press ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedDataPage;
