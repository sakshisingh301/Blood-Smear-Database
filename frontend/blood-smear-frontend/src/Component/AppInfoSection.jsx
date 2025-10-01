import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AppInfoSection.css";

const AppInfoSection = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  
  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="app-info-section">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Advanced Blood Smear Analysis Platform
            </h1>
            <p className="hero-subtitle">
              Empowering veterinarians and researchers with comprehensive hematological 
              image management and analysis tools
            </p>
            <div className="brand-slogan">
              <span>Exceptional Care, Education and Innovation</span>
            </div>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={handleGetStarted}>
                Get Started
              </button>
              <button className="btn btn-secondary btn-large" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="feature-preview">
              <div className="preview-item">
                <div className="preview-icon">🔬</div>
                <span>Full Slide Images</span>
              </div>
              <div className="preview-item">
                <div className="preview-icon">📸</div>
                <span>Cellavision</span>
              </div>
              <div className="preview-item">
                <div className="preview-icon">🔍</div>
                <span>Analysis Tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Options Section */}
        <div className="main-options-section">
          <div className="options-grid">
            <div className="option-card" onClick={() => navigate('/species/browse')}>
              <div className="option-icon">🔍</div>
              <h3>Explore & Search Cases</h3>
              <p>
                Browse and search our comprehensive database of blood smear cases 
                from various animal species with detailed taxonomic information.
              </p>
              <div className="option-features">
                <span>View Blood Smear Images of Exotic Animals</span>
                <span>Advanced Search & Filtering</span>
              </div>
              <button className="option-btn">
              </button>
            </div>
            
            <div className="option-card" onClick={() => navigate('/contribute')}>
              <div className="option-icon">📤</div>
              <h3>Contribute to the Database</h3>
              <p>
                Share your blood smear images and help build a comprehensive 
                resource for the veterinary community. All contributions are reviewed by experts.
              </p>
              <div className="option-features">
                <span>Upload Full Slide Images</span>
                <span>Share Cellavision Captures</span>
                <span>Expert Review Process</span>
              </div>
              <button className="option-btn">
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Image Upload & Management</h3>
              <p>
                Upload and organize full slide images and Cellavision captures with 
                advanced metadata tagging and categorization systems.
              </p>
              <ul className="feature-list">
                <li>Multiple image format support</li>
                <li>Batch upload capabilities</li>
                <li>Secure cloud storage</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h3>Image Bank & Browsing</h3>
              <p>
                Comprehensive image library with advanced search, filtering, and 
                browsing capabilities for research and reference purposes.
              </p>
              <ul className="feature-list">
                <li>Advanced search algorithms</li>
                <li>Category-based filtering</li>
                <li>High-resolution viewing</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community Contribution</h3>
              <p>
                You can contribute to the database by sharing your blood smear images 
                and helping build a comprehensive resource for the veterinary community.
              </p>
              <ul className="feature-list">
                <li>Share your expertise</li>
                <li>Collaborate with peers</li>
                <li>Build community knowledge</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Use Cases Section */}
        <div className="use-cases-section">
          <h2 className="section-title">Who Benefits</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">👨‍⚕️</div>
              <h3>Veterinarians</h3>
              <p>
                Enhance diagnostic accuracy with access to a comprehensive 
                library of blood smear images and advanced analysis tools.
              </p>
              <div className="use-case-features">
                <span>Diagnostic Support</span>
                <span>Case Management</span>
                <span>Reference Library</span>
              </div>
            </div>

            <div className="use-case-card">
              <div className="use-case-icon">🔬</div>
              <h3>Researchers</h3>
              <p>
                Conduct groundbreaking research with access to extensive 
                image datasets and collaborative analysis tools.
              </p>
              <div className="use-case-features">
                <span>Data Analysis</span>
                <span>Collaboration</span>
                <span>Publication Support</span>
              </div>
            </div>

            <div className="use-case-card">
              <div className="use-case-icon">🎓</div>
              <h3>Students & Educators</h3>
              <p>
                Learn and teach with access to high-quality educational 
                resources and interactive learning tools.
              </p>
              <div className="use-case-features">
                <span>Educational Resources</span>
                <span>Interactive Learning</span>
                <span>Assessment Tools</span>
              </div>
            </div>
          </div>
        </div>



      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={closeLoginModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign In</h3>
              <button className="modal-close" onClick={closeLoginModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Enter your email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" placeholder="Enter your password" required />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Sign In
                </button>
              </form>
              <div className="auth-links">
                <a href="#" className="forgot-password">Forgot Password?</a>
                <p className="signup-prompt">
                  Don't have an account? 
                  <button className="link-button" onClick={() => {
                    closeLoginModal();
                    openRegisterModal();
                  }}>
                    Sign up here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="modal-overlay" onClick={closeRegisterModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Account</h3>
              <button className="modal-close" onClick={closeRegisterModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="auth-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" placeholder="Enter your full name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Enter your email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" placeholder="Create a password" required />
                </div>
                <div className="form-group">
                  <label htmlFor="userType">I am a:</label>
                  <select id="userType" required>
                    <option value="">Select your role</option>
                    <option value="veterinarian">Veterinarian</option>
                    <option value="researcher">Researcher</option>
                    <option value="student">Student</option>
                    <option value="educator">Educator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Create Account
                </button>
              </form>
              <div className="auth-links">
                <p className="signup-prompt">
                  Already have an account? 
                  <button className="link-button" onClick={() => {
                    closeRegisterModal();
                    openLoginModal();
                  }}>
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppInfoSection;
