import React from 'react';
import './RecentUploadsSection.css';

const RecentUploadsSection = () => {
  // Random blood smear images - in a real app, these would come from an API
  const recentUploads = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
      species: 'Canine',
      uploadDate: '2024-01-15',
      uploader: 'Dr. Smith'
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
      species: 'Feline',
      uploadDate: '2024-01-14',
      uploader: 'Dr. Johnson'
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop&crop=center',
      species: 'Avian',
      uploadDate: '2024-01-13',
      uploader: 'Dr. Williams'
    },
    {
      id: 4,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      species: 'Equine',
      uploadDate: '2024-01-12',
      uploader: 'Dr. Brown'
    },
    {
      id: 5,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-b6a253d1ce90?w=400&h=300&fit=crop&crop=center',
      species: 'Reptile',
      uploadDate: '2024-01-11',
      uploader: 'Dr. Davis'
    },
    {
      id: 6,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
      species: 'Rodent',
      uploadDate: '2024-01-10',
      uploader: 'Dr. Wilson'
    }
  ];

  return (
    <div className="recent-uploads-section">
      <div className="recent-uploads-container">
        <div className="section-header">
          <h2>Recent Uploads</h2>
          <p>Latest blood smear images added to our database</p>
        </div>
        
        <div className="uploads-carousel">
          <div className="uploads-track">
            {/* First set of images */}
            {recentUploads.map((upload) => (
              <div key={`first-${upload.id}`} className="upload-item">
                <div className="upload-image-container">
                  <img 
                    src={upload.imageUrl} 
                    alt={`Blood smear - ${upload.species}`}
                    className="upload-image"
                  />
                  <div className="upload-overlay">
                    <div className="upload-info">
                      <span className="species">{upload.species}</span>
                      <span className="uploader">{upload.uploader}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {recentUploads.map((upload) => (
              <div key={`second-${upload.id}`} className="upload-item">
                <div className="upload-image-container">
                  <img 
                    src={upload.imageUrl} 
                    alt={`Blood smear - ${upload.species}`}
                    className="upload-image"
                  />
                  <div className="upload-overlay">
                    <div className="upload-info">
                      <span className="species">{upload.species}</span>
                      <span className="uploader">{upload.uploader}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="section-footer">
          <button className="view-all-btn">
            View All Recent Uploads
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentUploadsSection;
