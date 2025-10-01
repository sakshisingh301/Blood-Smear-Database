import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './UploadedContentPage.css';
import UTIF from 'utif';

const UploadedContentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  
  // Get upload data from location state or localStorage
  const uploadDataFromState = location.state?.uploadData;
  const uploadDataFromStorage = localStorage.getItem('currentUploadData');
  
  // Use data from state first, then localStorage
  const jobId = uploadDataFromState?.job_id || JSON.parse(uploadDataFromStorage || '{}').job_id || '';
  
  

  // Transform API data to match the expected format
  const transformApiData = (apiData) => {
    if (!apiData) return null;

    console.log('🔍 API Data:', apiData);
    // Helper function to get proper CloudFront URL
    const getImageUrl = (s3Storage) => {
      if (!s3Storage) return null;
      
      // Prioritize CloudFront URL for better performance
      if (s3Storage.cloudfront_url) {
        // Add https:// if missing
        const cloudfrontUrl = s3Storage.cloudfront_url.startsWith('http') 
          ? s3Storage.cloudfront_url 
          : `https://${s3Storage.cloudfront_url}`;
        return cloudfrontUrl;
      }
      
      // Fallback to S3 URL
      return null;
    };
    
    return {
      job_id: apiData.job_id,
      status: apiData.status,
      message: getStatusMessage(apiData.status),
      metadata: {
        common_name: apiData.common_name,
        scientific_name: apiData.scientific_name,
        phylum: apiData.taxonomy?.phylum,
        class: apiData.taxonomy?.class,
        order: apiData.taxonomy?.order,
        health_status: apiData.health_status,
        custom_health_status: apiData.custom_health_status,
        stain: apiData.stain,
        custom_stain: apiData.custom_stain,
        sex: apiData.sex,
        age: apiData.age ? `${apiData.age.years || 0} years, ${apiData.age.months || 0} months, ${apiData.age.days || 0} days` : '',
        scanner_type: apiData.scanner_type,
        magnification: apiData.magnification,
        contributor: apiData.contributor,
        collected_at: apiData.collected_at,
        source: apiData.source,
        approved: apiData.approved
      },
      whole_slide_image: {
        filename: apiData.whole_slide_image?.original_filename,
        url: getImageUrl(apiData.whole_slide_image?.s3_storage),
        status: apiData.whole_slide_image?.s3_storage?.upload_success ? 'completed' : 'failed',
        file_size: `${(apiData.whole_slide_image?.size_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        resolution: 'Unknown',
        s3_url: apiData.whole_slide_image?.s3_storage?.s3_url,
        cloudfront_url: apiData.whole_slide_image?.s3_storage?.cloudfront_url
      },
      cellavision_images: apiData.cellavision_images ? Object.entries(apiData.cellavision_images).reduce((acc, [cellType, images]) => {
        acc[cellType.toLowerCase()] = images.map(img => ({
          filename: img.original_filename,
          url: getImageUrl(img.s3_storage),
          status: img.s3_storage?.upload_success ? 'completed' : 'failed',
          cell_count: 1, // Default value
          s3_url: img.s3_storage?.s3_url,
          cloudfront_url: img.s3_storage?.cloudfront_url
        }));
        return acc;
      }, {}) : {},
      s3_upload_summary: apiData.s3_upload_summary,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at
    };
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'processing':
        return 'Your upload is being processed...';
      case 'clean':
        return 'Upload processed successfully and cleaned!';
      case 'failed':
        return 'Upload processing failed.';
      case 'uploading_to_s3':
        return 'Uploading to cloud storage...';
      case 'uploaded_to_s3':
        return 'Successfully uploaded to cloud storage!';
      case 'ready_for_access':
        return 'Upload is ready for access!';
      case 'partially_uploaded':
        return 'Some files uploaded successfully, others failed.';
      default:
        return 'Status unknown.';
    }
  };

  // Get the actual data from API
  const apiData = uploadDataFromState || (uploadDataFromStorage ? JSON.parse(uploadDataFromStorage) : null);
  // console.log('🔍 API Data:', apiData);
  // console.log('�� Cellavision Images:', apiData?.cellavision_images);
  // console.log('�� Whole Slide:', apiData?.whole_slide_image);

  const transformedApiData = transformApiData(apiData);
  // console.log('✅ Transformed Data:', transformedApiData);
  // console.log('✅ Transformed Cellavision:', transformedApiData?.cellavision_images);
  const jobData = editedData || transformedApiData;

  // Initialize edited data when component mounts
  useEffect(() => {
    if (transformedApiData) {
      setEditedData(JSON.parse(JSON.stringify(transformedApiData)));
    }
  }, [jobId, transformedApiData]);

  useEffect(() => {
    const fetchLatestData = async () => {
      if (jobId) {
        try {
          const response = await fetch(`http://localhost:3000/api/uploads/${jobId}`);
          const result = await response.json();
          
          if (response.ok && result.success) {
            // Update localStorage with fresh data
            localStorage.setItem('currentUploadData', JSON.stringify(result.data));
            
            // Transform and set the data
            const transformed = transformApiData(result.data);
            setEditedData(JSON.parse(JSON.stringify(transformed)));
          }
        } catch (error) {
          console.error('Failed to fetch latest data:', error);
        }
      }
    };
    
    fetchLatestData();
  }, [jobId]); // Run when component mounts or jobId changes

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // If canceling edit, reset to original data
      const originalData = transformedApiData;
      if (originalData) {
        setEditedData(JSON.parse(JSON.stringify(originalData)));
      }
    }
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving data:', editedData);
    setIsEditing(false);
    // You could add a success notification here
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (image, event) => {
    event.stopPropagation();
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

  // Updated TiffImage component using UTIF
  const TiffImage = ({ url, alt, onClick, className }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [pngUrl, setPngUrl] = useState(null);

    useEffect(() => {
      // console.log('🖼️ TiffImage received URL:', url);
      
      if (!url) {
        console.error('❌ No URL provided to TiffImage');
        setError(true);
        setLoading(false);
        return;
      }

      // Check if it's a TIFF file
      const isTiff = url.toLowerCase().endsWith('.tiff') || url.toLowerCase().endsWith('.tif');
      
      if (!isTiff) {
        setPngUrl(url);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Fetch TIFF file
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then(buffer => {
          // Decode TIFF
          const ifds = UTIF.decode(buffer);
          UTIF.decodeImage(buffer, ifds[0]);
          
          // Get image data
          const rgba = UTIF.toRGBA8(ifds[0]);
          
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;
          const ctx = canvas.getContext('2d');
          
          // Create ImageData
          const imageData = new ImageData(
            new Uint8ClampedArray(rgba),
            ifds[0].width,
            ifds[0].height
          );
          
          ctx.putImageData(imageData, 0, 0);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            const pngDataUrl = URL.createObjectURL(blob);
            setPngUrl(pngDataUrl);
            setLoading(false);
          }, 'image/png', 1.0);
        })
        .catch(err => {
          console.error('TIFF conversion error:', err);
          setError(true);
          setLoading(false);
        });

      // Cleanup
      return () => {
        if (pngUrl && pngUrl.startsWith('blob:')) {
          URL.revokeObjectURL(pngUrl);
        }
      };
    }, [url]);

    if (loading) {
      return (
        <div className="tiff-loading">
          <div className="spinner"></div>
          <p>Converting TIFF to PNG...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="tiff-error">
          <p>❌ Failed to load image</p>
          <p className="error-details">Unable to convert TIFF file</p>
          <a 
            href={url} 
            download 
            target="_blank" 
            rel="noopener noreferrer"
            className="download-original-btn"
          >
            📥 Download Original File
          </a>
        </div>
      );
    }

    return (
      <img 
        src={pngUrl} 
        alt={alt} 
        onClick={onClick} 
        className={className}
        onError={() => {
          console.error('Image failed to load:', pngUrl);
          setError(true);
        }}
      />
    );
  };

  if (!jobData) {
    return (
      <div className="uploaded-content-page">
        <UCDavisNavbar />
        <div className="content-container">
          <div className="error-message">
            <h2>Job Not Found</h2>
            <p>Job ID "{jobId}" not found. Please check your job ID and try again.</p>
            <Link to="/recent-uploads" className="back-btn">
              ← Back to Recent Uploads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uploaded-content-page">
      <UCDavisNavbar />
      
      <div className="content-container">
        {/* Header */}
        <div className="content-header">
          <div className="header-content">
            <div className="header-text">
              <h1>📋 Uploaded Content</h1>
              <p>Detailed view of uploaded images and metadata</p>
            </div>
            <div className="header-actions">
              <button 
                className={isEditing ? "cancel-btn" : "edit-btn"}
                onClick={handleEditToggle}
              >
                {isEditing ? "❌ Cancel" : "✏️ Edit"}
              </button>
              {isEditing && (
                <button 
                  className="save-btn"
                  onClick={handleSave}
                >
                  💾 Save Changes
                </button>
              )}
              <Link to="/recent-uploads" className="back-btn">
                ← Back to Recent Uploads
              </Link>
              <Link to="/job-status" className="status-btn">
                👁️ Job Status
              </Link>
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="job-info-section">
          <div className="job-id-display">
            <h2>Job ID: {jobData.job_id}</h2>
            <div className="status-badge">
              <span className="status-icon">{getStatusIcon(jobData.status)}</span>
              <span 
                className="status-text"
                style={{ color: getStatusColor(jobData.status) }}
              >
                {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
              </span>
            </div>
          </div>
          <p className="job-message">{jobData.message}</p>
        </div>

        {/* Metadata Section */}
        <div className="metadata-section">
          <h3>Specimen Information</h3>
          <div className="metadata-grid">
            <div className="metadata-group">
              <h4>Taxonomy</h4>
              <div className="metadata-item">
                <label>Common Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.common_name}
                    onChange={(e) => handleFieldChange('common_name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.common_name}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Scientific Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.scientific_name}
                    onChange={(e) => handleFieldChange('scientific_name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.scientific_name}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Phylum:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.phylum}
                    onChange={(e) => handleFieldChange('phylum', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.phylum}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Class:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.class}
                    onChange={(e) => handleFieldChange('class', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.class}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Order:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.order}
                    onChange={(e) => handleFieldChange('order', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.order}</span>
                )}
              </div>
            </div>

            <div className="metadata-group">
              <h4>Health & Staining</h4>
              <div className="metadata-item">
                <label>Health Status:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.health_status}
                    onChange={(e) => handleFieldChange('health_status', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Clinically Healthy">Clinically Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                ) : (
                  <span>{jobData.metadata.health_status}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Custom Health Status:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.custom_health_status || ''}
                    onChange={(e) => handleFieldChange('custom_health_status', e.target.value)}
                    className="edit-input"
                    placeholder="Enter custom health status"
                  />
                ) : (
                  <span>{jobData.metadata.custom_health_status || 'N/A'}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Stain:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.stain}
                    onChange={(e) => handleFieldChange('stain', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Wright-Giemsa">Wright-Giemsa</option>
                    <option value="H&E">H&E</option>
                    <option value="PAS">PAS</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span>{jobData.metadata.stain}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Custom Stain:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.custom_stain || ''}
                    onChange={(e) => handleFieldChange('custom_stain', e.target.value)}
                    className="edit-input"
                    placeholder="Enter custom stain"
                  />
                ) : (
                  <span>{jobData.metadata.custom_stain || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="metadata-group">
              <h4>Specimen Details</h4>
              <div className="metadata-item">
                <label>Sex:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.sex}
                    onChange={(e) => handleFieldChange('sex', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                ) : (
                  <span>{jobData.metadata.sex}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Age:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    className="edit-input"
                    placeholder="e.g., 3 years, 5 months"
                  />
                ) : (
                  <span>{jobData.metadata.age}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Scanner Type:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.scanner_type}
                    onChange={(e) => handleFieldChange('scanner_type', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Olympus">Olympus</option>
                    <option value="Leica">Leica</option>
                    <option value="Nikon">Nikon</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span>{jobData.metadata.scanner_type}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Magnification:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.magnification}
                    onChange={(e) => handleFieldChange('magnification', e.target.value)}
                    className="edit-select"
                  >
                    <option value="10x">10x</option>
                    <option value="20x">20x</option>
                    <option value="40x">40x</option>
                    <option value="60x">60x</option>
                    <option value="100x">100x</option>
                  </select>
                ) : (
                  <span>{jobData.metadata.magnification}</span>
                )}
              </div>
            </div>

            <div className="metadata-group">
              <h4>Collection Info</h4>
              <div className="metadata-item">
                <label>Contributor:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.contributor}
                    onChange={(e) => handleFieldChange('contributor', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.contributor}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Collection Date:</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={jobData.metadata.collected_at.split('T')[0]}
                    onChange={(e) => handleFieldChange('collected_at', e.target.value + 'T00:00:00.000+00:00')}
                    className="edit-input"
                  />
                ) : (
                  <span>{formatDate(jobData.metadata.collected_at)}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Source:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.metadata.source}
                    onChange={(e) => handleFieldChange('source', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{jobData.metadata.source}</span>
                )}
              </div>
              <div className="metadata-item">
                <label>Approved:</label>
                {isEditing ? (
                  <select
                    value={jobData.metadata.approved}
                    onChange={(e) => handleFieldChange('approved', e.target.value === 'true')}
                    className="edit-select"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className={jobData.metadata.approved ? 'approved' : 'not-approved'}>
                    {jobData.metadata.approved ? '✅ Yes' : '❌ No'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="images-section">
          <h3>Uploaded Images</h3>
          
          {/* Whole Slide Image */}
          {jobData.whole_slide_image && Object.keys(jobData.whole_slide_image).length > 0 && (
            <div className="image-category">
              <h4>Whole Slide Image</h4>
              <div className="image-card">
                <div className="image-preview">
                  <TiffImage 
                    url={jobData.whole_slide_image.url} 
                    alt={jobData.whole_slide_image.filename}
                    onClick={(e) => handleImageClick(jobData.whole_slide_image, e)}
                    className="clickable-image"
                  />
                  <div className="image-status-overlay">
                    <span 
                      className="image-status-badge"
                      style={{
                        backgroundColor: getStatusColor(jobData.whole_slide_image.status) + '20',
                        color: getStatusColor(jobData.whole_slide_image.status),
                        border: `1px solid ${getStatusColor(jobData.whole_slide_image.status)}40`
                      }}
                    >
                      {getStatusIcon(jobData.whole_slide_image.status)} {jobData.whole_slide_image.status}
                    </span>
                  </div>
                </div>
                <div className="image-info">
                  <h5>{jobData.whole_slide_image.filename}</h5>
                  <div className="image-details">
                    <p><strong>File Size:</strong> {jobData.whole_slide_image.file_size}</p>
                    <p><strong>Resolution:</strong> {jobData.whole_slide_image.resolution}</p>
                    {jobData.whole_slide_image.status === 'completed' && (
                      <>
                        <p><strong>Processing Time:</strong> {jobData.whole_slide_image.processing_time}</p>
                        <p><strong>Completed:</strong> {formatDate(jobData.whole_slide_image.completed_at)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cellavision Images - FIXED */}
          {jobData.cellavision_images && Object.keys(jobData.cellavision_images).length > 0 && (
            <div className="image-category">
              <h4>Cellavision Images</h4>
              {Object.entries(jobData.cellavision_images).map(([cellType, images]) => (
                <div key={cellType} className="cell-type-section">
                  <h5>{cellType.charAt(0).toUpperCase() + cellType.slice(1)}</h5>
                  <div className="cellavision-grid">
                    {Array.isArray(images) ? images.map((imageData, index) => (
                      <div key={index} className="image-card">
                        <div className="image-preview">
                          <TiffImage 
                            url={imageData.url} 
                            alt={imageData.filename}
                            onClick={(e) => handleImageClick(imageData, e)}
                            className="clickable-image"
                          />
                          <div className="image-status-overlay">
                            <span 
                              className="image-status-badge"
                              style={{
                                backgroundColor: getStatusColor(imageData.status) + '20',
                                color: getStatusColor(imageData.status),
                                border: `1px solid ${getStatusColor(imageData.status)}40`
                              }}
                            >
                              {getStatusIcon(imageData.status)} {imageData.status}
                            </span>
                          </div>
                        </div>
                        <div className="image-info">
                          <h6>{imageData.filename}</h6>
                          <p><strong>Cell Count:</strong> {imageData.cell_count || 'N/A'}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="image-card">
                        <div className="image-preview">
                          <TiffImage 
                            url={images.url} 
                            alt={images.filename}
                            onClick={(e) => handleImageClick(images, e)}
                            className="clickable-image"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processing Summary */}
        {jobData.status === 'completed' && (
          <div className="processing-summary">
            <h3>Processing Summary</h3>
            <div className="summary-details">
              <p><strong>Total Processing Time:</strong> {jobData.processing_time}</p>
              <p><strong>Completed At:</strong> {formatDate(jobData.completed_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Image Viewer Modal */}
      {fullscreenImage && (
        <div className="fullscreen-image-modal" onClick={closeFullscreenImage}>
          <div className="fullscreen-image-container">
            <div className="fullscreen-image-header">
              <h3>{fullscreenImage.filename}</h3>
              <button className="close-fullscreen-btn" onClick={closeFullscreenImage}>×</button>
            </div>
            <div className="fullscreen-image-content">
              <TiffImage 
                url={fullscreenImage.url} 
                alt={fullscreenImage.filename}
                className="fullscreen-image"
              />
            </div>
            <div className="fullscreen-image-footer">
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

export default UploadedContentPage;
