import React from 'react';
import { Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './AboutUsPage.css';
import melanieImage from '../assets/melanie-ammersbach.jpg';
import sakshiImage from '../assets/sakshi_singh.jpg';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">
      <UCDavisNavbar />
      
      <div className="main-content">
        <div className="content-container">
          <div className="page-header">
            <h1>About the Blood Smear Database</h1>
            <p className="page-subtitle">Advancing Hematological Research Through Rare Exotic Animal Specimens</p>
          </div>

          <div className="content-sections">
            {/* Mission Section */}
            <section className="content-section">
              <h2>Our Mission</h2>
              <p>
                The Blood Smear Database represents a groundbreaking initiative in veterinary hematology, 
                dedicated to preserving and sharing rare blood smear images from exotic and endangered animal species. 
                This comprehensive digital repository serves as an invaluable resource for researchers, veterinarians, 
                and students worldwide, advancing our understanding of comparative hematology across diverse species.
              </p>
            </section>

            {/* Professor Section */}
            <section className="content-section">
              <h2>Principal Investigators</h2>
              <div className="professor-info">
                <div className="professor-details">
                  <div className="professor-image-container">
                    <img 
                      src={melanieImage} 
                      alt="Dr. Melanie Audrey Ammersbach" 
                      className="professor-image"
                    />
                  </div>
                  <div className="professor-text">
                    <h3>Dr. Melanie Audrey Ammersbach</h3>
                    <p className="professor-title">Associate Professor</p>
                    <p className="professor-department">Pathology, Microbiology & Immunology - UC Davis School of Veterinary Medicine</p>
                    
                    <div className="professor-bio">
                      <p>
                        Dr. Melanie Audrey Ammersbach is a distinguished Associate Professor specializing in 
                        clinical pathology of non-traditional species, including exotic pets, zoo animals, 
                        wildlife, and laboratory species. As the principal investigator of this blood smear 
                        database, Dr. Ammersbach has dedicated her career to advancing our understanding of 
                        hematology, cytology, and biochemistry across diverse and rare species.
                      </p>
                      <p>
                        Her research focuses on the clinical pathology of exotic and wildlife species, 
                        contributing significantly to veterinary medicine and wildlife conservation efforts. 
                        Dr. Ammersbach has published extensively in peer-reviewed journals and has been 
                        instrumental in developing diagnostic criteria for hematological disorders in 
                        non-traditional species, training the next generation of veterinary pathologists.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="professor-details">
                  <div className="professor-image-container">
                    <img 
                      src="/src/assets/professor-hugues-beaufrere.jpg" 
                      alt="Professor Hugues Beaufrere" 
                      className="professor-image"
                    />
                  </div>
                  <div className="professor-text">
                    <h3>Professor Hugues Beaufrere</h3>
                    <p className="professor-title">Professor</p>
                    <p className="professor-department">Pathology, Microbiology & Immunology - UC Davis School of Veterinary Medicine</p>
                    
                    <div className="professor-bio">
                      <p>
                        Professor Hugues Beaufrere is a renowned expert in veterinary pathology and clinical 
                        pathology, with extensive experience in exotic and wildlife species. His research 
                        contributions have significantly advanced our understanding of comparative pathology 
                        and hematology across diverse animal species.
                      </p>
                      <p>
                        As a co-principal investigator of this blood smear database, Professor Beaufrere 
                        brings invaluable expertise in diagnostic pathology and has been instrumental in 
                        developing standardized protocols for specimen collection and analysis. His work 
                        has contributed to numerous publications and has supported conservation medicine 
                        initiatives worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Database Section */}
            <section className="content-section">
              <h2>About the Database</h2>
              <div className="database-info">
                <p>
                  Our Blood Smear Database contains an extensive collection of high-resolution blood smear 
                  images from exotic animals, many of which are rare, endangered, or difficult to study 
                  in clinical settings. This unique resource includes specimens from:
                </p>
                
                <div className="species-categories">
                  <div className="category">
                    <h4>Birds</h4>
                    <p>
                      Comprehensive collection spanning multiple orders including raptors, waterfowl, 
                      songbirds, and exotic species from around the world. Many specimens represent 
                      species rarely encountered in veterinary practice.
                    </p>
                  </div>
                  
                  <div className="category">
                    <h4>Mammals</h4>
                    <p>
                      Diverse mammalian species including large carnivores, primates, marine mammals, 
                      and other exotic species. The collection includes both healthy and pathological 
                      specimens for comparative analysis.
                    </p>
                  </div>
                  
                  <div className="category">
                    <h4>Reptiles & Amphibians</h4>
                    <p>
                      Specialized collection of reptilian and amphibian blood smears, representing 
                      species with unique hematological characteristics and adaptations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Research Impact Section */}
            <section className="content-section">
              <h2>Research Impact</h2>
              <div className="impact-stats">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Species Represented</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Blood Smear Images</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Research Publications</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Collaborating Institutions</div>
                </div>
              </div>
              
              <p>
                This database has facilitated groundbreaking research in comparative hematology, 
                contributing to our understanding of species-specific adaptations, disease processes, 
                and conservation medicine. The collection has been instrumental in developing 
                diagnostic criteria for hematological disorders in exotic species and has supported 
                numerous conservation and research initiatives worldwide.
              </p>
            </section>

            {/* Technology Section */}
            <section className="content-section">
              <h2>Technology & Methodology</h2>
              <p>
                All blood smear images in our database are captured using state-of-the-art microscopy 
                equipment and standardized protocols to ensure consistency and quality. Each specimen 
                is carefully prepared, stained using appropriate techniques, and digitally archived 
                with comprehensive metadata including species identification, collection date, 
                health status, and relevant clinical information.
              </p>
              
              <div className="methodology-features">
                <div className="feature">
                  <h4>High-Resolution Imaging</h4>
                  <p>All images captured at 1000x magnification with consistent lighting and focus</p>
                </div>
                <div className="feature">
                  <h4>Standardized Protocols</h4>
                  <p>Consistent staining and preparation methods across all specimens</p>
                </div>
                <div className="feature">
                  <h4>Comprehensive Metadata</h4>
                  <p>Detailed information for each specimen including taxonomy and clinical data</p>
                </div>
                <div className="feature">
                  <h4>Quality Assurance</h4>
                  <p>Rigorous review process to ensure diagnostic quality and accuracy</p>
                </div>
              </div>
            </section>

            {/* Development Team Section */}
            <section className="content-section">
              <h2>Development Team</h2>
              <div className="development-team">
                <p>
                  The Blood Smear Database platform has been architected and designed by Sakshi Singh, 
                  a first-year Master's student in Computer Science at UC Davis.
                </p>
                
                <div className="professor-info">
                  <div className="professor-details">
                    <div className="professor-image-container">
                      <img 
                        src={sakshiImage} 
                        alt="Sakshi Singh" 
                        className="professor-image"
                      />
                    </div>
                    <div className="professor-text">
                      <h3>Sakshi Singh</h3>
                      <p className="professor-title">Lead Developer & Architect</p>
                      <p className="professor-department">Master's Student, Computer Science - UC Davis</p>
                      
                      <div className="professor-bio">
                        <p>
                          Sakshi Singh is a first-year Master's student in Computer Science at UC Davis, 
                          serving as the lead developer and architect of the Blood Smear Database platform. 
                          Her expertise encompasses full-stack development, system architecture, and 
                          user interface design, creating an intuitive and powerful tool for the veterinary 
                          and research communities.
                        </p>
                        <p>
                          With a strong foundation in computer science and a passion for developing 
                          innovative solutions, Sakshi has designed and implemented the complete platform 
                          including database architecture, frontend and backend development, and user 
                          experience optimization.
                        </p>
                      </div>
                      
                      <div className="contact-links">
                        <a 
                          href="https://www.linkedin.com/in/sakshi-singh-6346b6189/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="linkedin-icon-link"
                          title="Visit Sakshi Singh's LinkedIn Profile"
                        >
                          <div className="linkedin-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <span className="linkedin-text">LinkedIn Profile</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="content-section">
              <h2>Contact & Collaboration</h2>
              <p>
                We welcome collaboration with researchers, veterinarians, and institutions worldwide. 
                For questions about the database, research collaboration opportunities, or specimen 
                contributions, please contact us:
              </p>
              
              <div className="contact-info">
                <div className="contact-item">
                  <h4>Principal Investigator</h4>
                  <p>Dr. Melanie Audrey Ammersbach</p>
                  <p>Associate Professor</p>
                  <p>Pathology, Microbiology & Immunology</p>
                  <p>UC Davis School of Veterinary Medicine</p>
                  <p>Email: mammersbach@ucdavis.edu</p>
                </div>
                
                <div className="contact-item">
                  <h4>Database Administrator</h4>
                  <p>Blood Smear Database Team</p>
                  <p>Email: bloodsmear@ucdavis.edu</p>
                  <p>UC Davis School of Veterinary Medicine</p>
                  <p>One Shields Avenue, Davis, CA 95616</p>
                </div>
              </div>
            </section>

            {/* Acknowledgments */}
            <section className="content-section">
              <h2>Acknowledgments</h2>
              <p>
                We gratefully acknowledge the contributions of numerous wildlife veterinarians, 
                conservation organizations, zoological institutions, and research collaborators 
                who have made this database possible. Special thanks to the UC Davis School of 
                Veterinary Medicine for their continued support of this important research initiative.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <div className="home-button-container">
        <Link to="/" className="home-button">
          🏠 Home
        </Link>
      </div>
    </div>
  );
};

export default AboutUsPage;
