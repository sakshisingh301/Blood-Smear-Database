import React from 'react';
import { Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './AboutUsPage.css';
import melanieImage from '../assets/melanie-ammersbach.jpg';
import sakshiImage from '../assets/sakshi_singh.jpg';

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const AboutUsPage = () => {
  return (
    <div className="ab-page">
      <UCDavisNavbar />

      {/* ── Hero ── */}
      <div className="ab-hero">
        <div className="ab-hero__inner">
          <p className="ab-hero__eyebrow">UC Davis School of Veterinary Medicine</p>
          <h1 className="ab-hero__title">About the Blood Smear Database</h1>
          <p className="ab-hero__sub">
            Advancing hematological research through rare exotic animal specimens — a digital repository
            built for researchers, veterinarians, and students worldwide.
          </p>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="ab-section ab-section--white">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Our Mission</h2>
          <p className="ab-section__lead">
            The Blood Smear Database is a comprehensive digital repository of rare blood smear images
            from exotic and endangered animals, preserving specimens that are otherwise inaccessible
            to the broader scientific community.
          </p>
          <ul className="ab-list">
            <li>Preserve and share rare specimens from species difficult to study in clinical settings</li>
            <li>Advance comparative hematology across diverse taxonomic groups</li>
            <li>Support veterinary education and wildlife conservation medicine globally</li>
          </ul>
        </div>
      </section>

      {/* ── Principal Investigators ── */}
      <section className="ab-section ab-section--tinted">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Principal Investigators</h2>
          <p className="ab-section__intro">
            The database is directed by two UC Davis faculty specialists in clinical pathology
            of non-traditional species.
          </p>
          <div className="ab-pi-grid">

            {/* PI 1 */}
            <div className="ab-pi-card">
              <div className="ab-pi-card__photo-wrap">
                <img
                  src={melanieImage}
                  alt="Dr. Melanie Audrey Ammersbach"
                  className="ab-pi-card__photo"
                />
              </div>
              <div className="ab-pi-card__body">
                <span className="ab-pi-card__badge">Principal Investigator</span>
                <h3 className="ab-pi-card__name">Dr. Melanie Audrey Ammersbach</h3>
                <p className="ab-pi-card__role">Associate Professor</p>
                <p className="ab-pi-card__dept">
                  Pathology, Microbiology &amp; Immunology · UC Davis School of Veterinary Medicine
                </p>
                <p className="ab-pi-card__bio">
                  Specialist in clinical pathology of exotic pets, zoo animals, wildlife, and laboratory
                  species. Dr. Ammersbach has dedicated her career to advancing hematology, cytology, and
                  biochemistry across diverse and rare species, publishing extensively in peer-reviewed
                  journals and training the next generation of veterinary pathologists.
                </p>
                <div className="ab-chips">
                  <span className="ab-chip">Clinical Pathology</span>
                  <span className="ab-chip">Exotic Species</span>
                  <span className="ab-chip">Wildlife Medicine</span>
                  <span className="ab-chip">Hematology</span>
                </div>
              </div>
            </div>

            {/* PI 2 */}
            <div className="ab-pi-card">
              <div className="ab-pi-card__photo-wrap">
                <img
                  src="/src/assets/professor-hugues-beaufrere.jpg"
                  alt="Professor Hugues Beaufrere"
                  className="ab-pi-card__photo"
                />
              </div>
              <div className="ab-pi-card__body">
                <span className="ab-pi-card__badge">Co-Principal Investigator</span>
                <h3 className="ab-pi-card__name">Professor Hugues Beaufrere</h3>
                <p className="ab-pi-card__role">Professor</p>
                <p className="ab-pi-card__dept">
                  Pathology, Microbiology &amp; Immunology · UC Davis School of Veterinary Medicine
                </p>
                <p className="ab-pi-card__bio">
                  Renowned expert in veterinary and comparative pathology with extensive experience in
                  exotic and wildlife species. Developed standardized protocols for specimen collection
                  and analysis, contributing to numerous publications and conservation medicine
                  initiatives worldwide.
                </p>
                <div className="ab-chips">
                  <span className="ab-chip">Veterinary Pathology</span>
                  <span className="ab-chip">Comparative Pathology</span>
                  <span className="ab-chip">Conservation Medicine</span>
                  <span className="ab-chip">Diagnostics</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── About the Database ── */}
      <section className="ab-section ab-section--white">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">About the Database</h2>
          <p className="ab-section__lead">
            A unique collection of high-resolution blood smear images from exotic animals — many rare,
            endangered, or otherwise inaccessible in standard clinical settings.
          </p>
          <div className="ab-species-grid">
            <div className="ab-species-card">
              <span className="ab-species-card__icon" aria-hidden="true">🐦</span>
              <h4 className="ab-species-card__title">Birds</h4>
              <p className="ab-species-card__text">
                Multiple orders including raptors, waterfowl, songbirds, and exotic species from
                around the world. Many specimens represent birds rarely encountered in veterinary practice.
              </p>
            </div>
            <div className="ab-species-card">
              <span className="ab-species-card__icon" aria-hidden="true">🦁</span>
              <h4 className="ab-species-card__title">Mammals</h4>
              <p className="ab-species-card__text">
                Large carnivores, primates, marine mammals, and other exotic species. Includes both
                healthy and pathological specimens for comparative analysis.
              </p>
            </div>
            <div className="ab-species-card">
              <span className="ab-species-card__icon" aria-hidden="true">🦎</span>
              <h4 className="ab-species-card__title">Reptiles &amp; Amphibians</h4>
              <p className="ab-species-card__text">
                Specialized reptilian and amphibian blood smears representing species with unique
                hematological characteristics and evolutionary adaptations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research Impact — dark banner ── */}
      <section className="ab-stats-banner">
        <div className="ab-section__inner">
          <h2 className="ab-stats-banner__heading">Research Impact</h2>
          <p className="ab-stats-banner__sub">
            Facilitating groundbreaking comparative hematology research — contributing to diagnostic
            criteria for hematological disorders in exotic species and supporting conservation initiatives worldwide.
          </p>
          <div className="ab-stats-grid">
            <div className="ab-stat">
              <span className="ab-stat__num">500+</span>
              <span className="ab-stat__label">Species Represented</span>
            </div>
            <div className="ab-stat">
              <span className="ab-stat__num">10,000+</span>
              <span className="ab-stat__label">Blood Smear Images</span>
            </div>
            <div className="ab-stat">
              <span className="ab-stat__num">50+</span>
              <span className="ab-stat__label">Research Publications</span>
            </div>
            <div className="ab-stat">
              <span className="ab-stat__num">100+</span>
              <span className="ab-stat__label">Collaborating Institutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technology & Methodology ── */}
      <section className="ab-section ab-section--white">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Technology &amp; Methodology</h2>
          <p className="ab-section__lead">
            Every specimen is captured and archived using standardized protocols designed for
            research-grade consistency and long-term scientific utility.
          </p>
          <ul className="ab-list ab-list--checks">
            <li>State-of-the-art microscopy at 1000× magnification with consistent lighting and focus</li>
            <li>Uniform staining protocols (Wright–Giemsa and equivalent) applied across all specimens</li>
            <li>Comprehensive metadata per image: taxonomy, collection date, health status, clinical context</li>
            <li>Expert peer review at every stage to ensure diagnostic quality and accuracy</li>
          </ul>
          <div className="ab-feature-grid">
            <div className="ab-feature-card">
              <h4 className="ab-feature-card__title">High-Resolution Imaging</h4>
              <p className="ab-feature-card__text">
                All images captured at 1000× magnification with consistent lighting and focus
              </p>
            </div>
            <div className="ab-feature-card">
              <h4 className="ab-feature-card__title">Standardized Protocols</h4>
              <p className="ab-feature-card__text">
                Consistent staining and preparation methods applied uniformly across all specimens
              </p>
            </div>
            <div className="ab-feature-card">
              <h4 className="ab-feature-card__title">Comprehensive Metadata</h4>
              <p className="ab-feature-card__text">
                Detailed taxonomy, clinical data, and specimen context for every image in the archive
              </p>
            </div>
            <div className="ab-feature-card">
              <h4 className="ab-feature-card__title">Quality Assurance</h4>
              <p className="ab-feature-card__text">
                Rigorous expert review process to ensure diagnostic accuracy before publication
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Development Team ── */}
      <section className="ab-section ab-section--tinted">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Development Team</h2>
          <p className="ab-section__intro">
            The platform was designed, architected, and built by a UC Davis Computer Science graduate
            student working directly with the veterinary research team.
          </p>
          <div className="ab-dev-card">
            <div className="ab-dev-card__photo-wrap">
              <img
                src={sakshiImage}
                alt="Sakshi Singh"
                className="ab-dev-card__photo"
              />
            </div>
            <div className="ab-dev-card__body">
              <div className="ab-dev-card__header">
                <div>
                  <h3 className="ab-dev-card__name">Sakshi Singh</h3>
                  <p className="ab-dev-card__role">Lead Developer &amp; Platform Architect</p>
                  <p className="ab-dev-card__dept">
                    Master's Student, Computer Science · UC Davis
                  </p>
                </div>
                <span className="ab-badge ab-badge--dev">Platform Owner</span>
              </div>
              <p className="ab-dev-card__bio">
                First-year M.S. Computer Science student at UC Davis. Designed and built the Blood Smear
                Database platform from the ground up — delivering an end-to-end research tool for the
                global veterinary and scientific communities.
              </p>
              <ul className="ab-dev-list">
                <li>React frontend with taxonomy browsing, advanced search, and whole-slide image viewer</li>
                <li>Node.js REST API backend with cloud storage pipeline (AWS S3)</li>
                <li>Whole-slide imaging integration via Deep Zoom format and OpenSeadragon</li>
                <li>Database architecture, specimen metadata schema, and user experience design</li>
              </ul>
              <div className="ab-chips ab-chips--spaced">
                <span className="ab-chip">React</span>
                <span className="ab-chip">Node.js</span>
                <span className="ab-chip">AWS S3</span>
                <span className="ab-chip">Full-Stack</span>
                <span className="ab-chip">UX Design</span>
              </div>
              <a
                href="https://www.linkedin.com/in/sakshi-singh-6346b6189/"
                target="_blank"
                rel="noopener noreferrer"
                className="ab-linkedin-btn"
              >
                <LinkedInIcon />
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact & Collaboration ── */}
      <section className="ab-section ab-section--white">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Contact &amp; Collaboration</h2>
          <p className="ab-section__lead">
            We welcome collaboration with researchers, veterinarians, and institutions worldwide.
            Reach out to learn more about the database, explore research partnerships, or contribute specimens.
          </p>
          <div className="ab-contact-grid">
            <div className="ab-contact-card">
              <span className="ab-contact-card__label">Principal Investigator</span>
              <p className="ab-contact-card__name">Dr. Melanie Audrey Ammersbach</p>
              <p className="ab-contact-card__detail">Associate Professor, Pathology, Microbiology &amp; Immunology</p>
              <p className="ab-contact-card__detail">UC Davis School of Veterinary Medicine</p>
              <a href="mailto:mammersbach@ucdavis.edu" className="ab-contact-card__email">
                mammersbach@ucdavis.edu
              </a>
            </div>
            <div className="ab-contact-card">
              <span className="ab-contact-card__label">Database Administrator</span>
              <p className="ab-contact-card__name">Blood Smear Database Team</p>
              <p className="ab-contact-card__detail">UC Davis School of Veterinary Medicine</p>
              <p className="ab-contact-card__detail">One Shields Avenue, Davis, CA 95616</p>
              <a href="mailto:bloodsmear@ucdavis.edu" className="ab-contact-card__email">
                bloodsmear@ucdavis.edu
              </a>
            </div>
          </div>
          <div className="ab-contact-actions">
            <a
              href="mailto:mammersbach@ucdavis.edu"
              className="ab-cta-btn ab-cta-btn--primary"
            >
              Contact Us
            </a>
            <a
              href="mailto:mammersbach@ucdavis.edu?subject=Collaboration%20Inquiry"
              className="ab-cta-btn ab-cta-btn--outline"
            >
              Propose Collaboration
            </a>
            <Link to="/contribute" className="ab-cta-btn ab-cta-btn--green">
              Contribute Data
            </Link>
          </div>
        </div>
      </section>

      {/* ── Acknowledgments ── */}
      <section className="ab-section ab-section--tinted">
        <div className="ab-section__inner">
          <h2 className="ab-section__heading">Acknowledgments</h2>
          <p className="ab-section__lead">
            This database exists because of the generosity and expertise of many contributors
            across the global veterinary and scientific communities.
          </p>
          <ul className="ab-list">
            <li>Wildlife veterinarians and conservation organizations worldwide</li>
            <li>Zoological institutions that provided rare and otherwise inaccessible specimens</li>
            <li>Research collaborators who contributed expertise, peer review, and clinical data</li>
            <li>UC Davis School of Veterinary Medicine for ongoing institutional support</li>
          </ul>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="ab-footer">
        <div className="ab-footer__inner">
          <Link to="/" className="ab-footer__home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </Link>
          <p className="ab-footer__copy">
            © {new Date().getFullYear()} UC Davis School of Veterinary Medicine · Blood Smear Image Database
          </p>
        </div>
      </div>

    </div>
  );
};

export default AboutUsPage;
