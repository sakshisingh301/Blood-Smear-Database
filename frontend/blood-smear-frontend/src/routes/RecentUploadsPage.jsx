import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './RecentUploadsPage.css';

const RecentUploadsPage = () => {
  const navigate = useNavigate();
  const [recentUploads, setRecentUploads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    // Load recent uploads from localStorage on component mount
    const saved = localStorage.getItem('recentUploads');
    if(saved){
      setRecentUploads(JSON.parse(saved));
    }
  }, []);

  const copyJobId = (jobId) => {
    navigator.clipboard.writeText(jobId);
    // You could add a toast notification here
  };

  const getUploadType = (upload) => {
    console.log("getting upload type ",upload)
    // Use the upload data to determine type
    if (upload.uploadData) {
      const hasWholeSlide = upload.uploadData.whole_slide_image;
      const hasCellavision = upload.uploadData.cellavision_images && 
        Object.keys(upload.uploadData.cellavision_images).length > 0;
      
      if (hasWholeSlide && hasCellavision) {
        return 'Full Slide + Cellavision';
      } else if (hasWholeSlide) {
        return 'Full Slide';
      } else if (hasCellavision) {
        return 'Cellavision';
      }
    }
    
    // Fallback to the type field if uploadData is not available
    return upload.type || 'Unknown';
  };

  const viewUploadedContent = (upload) => {
    
  
    if (upload.uploadData) {
      console.log("upload data after click view content ",upload.uploadData)
    
      // Navigate to uploaded content page with the complete data
      navigate('/uploaded-content', { 
        state: { uploadData: upload.uploadData } 
      });
    } else {
      // Fallback: navigate with job ID if no uploadData
      navigate('/uploaded-content', { 
        state: { jobId: upload.id } 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return '#f59e0b'; // Amber
      case 'uploaded_to_s3':
        return '#10b981'; // Green
      case 'ready_for_access':
        return '#059669'; // Dark Green
      case 'failed':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return '⚙️';
      case 'uploaded_to_s3':
        return '✅';
      case 'ready_for_access':
        return '🎉';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(recentUploads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUploads = recentUploads.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="recent-uploads-page">
      <UCDavisNavbar />
      
      <div className="recent-uploads-container">
        <div className="recent-uploads-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Recent Uploads</h1>
            </div>
            <div className="header-right">
              <Link to="/admin/upload" className="new-upload-btn">
                📤 New Upload
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-uploads-content">
          {recentUploads.length > 0 ? (
            <>
              <div className="uploads-summary">
                <p className="instruction-text">Click on any upload to view detailed information and images.</p>
                {totalPages > 1 && (
                  <p className="pagination-info">
                    Showing {startIndex + 1}-{Math.min(endIndex, recentUploads.length)} of {recentUploads.length} uploads
                  </p>
                )}
              </div>
              
              <div className="uploads-list">
                {currentUploads.map((upload, index) => (
                  <div key={upload.id} className="upload-item">
                    <div className="upload-info">
                      <div className="upload-specimen">
                        <strong>{upload.specimen}</strong>
                        <span className="upload-type">{getUploadType(upload)}</span>
                      </div>
                      <div className="upload-details">
                        <span className="upload-time">
                          {new Date(upload.timestamp).toLocaleString()}
                        </span>
                        {upload.status && (
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(upload.status) }}
                          >
                            {getStatusIcon(upload.status)} {upload.status}
                          </span>
                        )}
                      </div>
                      {upload.contributor && (
                        <div className="upload-meta">
                          <span className="contributor">Contributor: {upload.contributor}</span>
                          {upload.source && <span className="source">Source: {upload.source}</span>}
                        </div>
                      )}
                    </div>
                    <div className="upload-actions">
                      <div className="job-id-display">
                        <span className="job-id-label">Job ID:</span>
                        <span className="job-id-value">{upload.id}</span>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="copy-job-id-btn"
                          onClick={() => copyJobId(upload.id)}
                          title="Copy Job ID to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button 
                          className="view-content-btn"
                          onClick={() => viewUploadedContent(upload)}
                          title="View uploaded content and status"
                        >
                          🖼️ View Content
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    <button 
                      className="pagination-btn prev-btn"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className="pagination-btn next-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-uploads-message">
              <div className="no-uploads-icon">📋</div>
              <h4>No Recent Uploads</h4>
              <p>After you upload your first image, it will appear here with its Job ID for easy reference.</p>
              <Link to="/admin/upload" className="upload-first-btn">
                Upload Your First Image
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentUploadsPage;