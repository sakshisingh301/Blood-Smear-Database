import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ucdavisLogo from "../assets/ucdavis_logo_blue.png";
import vetMedLogo from "../assets/left-aligned-blue-gold-logo-rgb.png";
import "./UCDavisNavbar.css";

const UCDavisNavbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if we're on public species pages
  const isPublicSpeciesPage = location.pathname.startsWith('/species');
  
  // Check if we're on about page
  const isAboutPage = location.pathname === '/about';

  return (
    <div className="uc-davis-navbar"> 
    <div className="navbar navbar-inverted navbar-expand-md" role="navigation">
      <button 
        type="button" 
        className="navbar-toggler" 
        onClick={toggleNavbar}
        aria-expanded={!isCollapsed}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="navbar-banner">
        <div className="navbar-container">
          <a className="navbar-brand navbar-brand" href="#">
            <img src={ucdavisLogo} alt="UC Davis" />
          </a>
        </div>
      </div>
      
      <div className="navbar-main">
        <div className="navbar-container">
          <a className="navbar-brand-main" href="#">
            <img src={vetMedLogo} alt="UC Davis School of Veterinary Medicine" />
          </a>
          {(location.pathname === '/register' || location.pathname === '/login') && (
            <Link to="/" className="back-to-home">
              🏠 Home
            </Link>
          )}
          {isAboutPage && (
            <Link to="/" className="back-to-home">
              🏠 Home
            </Link>
          )}
          {isPublicSpeciesPage && (
            <Link to="/" className="back-to-home">
              🏠 Home
            </Link>
          )}
        </div>
      </div>
      
      <div className={`navbar-row navbar-collapse ${!isCollapsed ? 'show' : ''}`}>
        <div className="navbar-center">
          <div className="title-container">
            <h1 className="blood-smear-title">Blood Smear Database</h1>
            <div className="title-accent"></div>
            <p className="blood-smear-subtitle">Explore blood smear images for exotic animals</p>
          </div>
        </div>
        
        {!isAboutPage && (
          <ul className="nav navbar-nav navbar-tabs">
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                <span className="nav-text">About Us</span>
              </Link>
            </li>
            
          </ul>
        )}
      </div>
    </div>
    </div>
  );
};

export default UCDavisNavbar;