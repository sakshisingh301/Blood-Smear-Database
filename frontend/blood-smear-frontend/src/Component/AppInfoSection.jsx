import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppInfoSection.css";

// ── SVG icons (inline, no external deps) ─────────────────────────────────

const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IconGrid = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

const AppInfoSection = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <IconSearch />,
      title: "Explore & Search Cases",
      description:
        "Browse our database of blood smear images from exotic and zoo animals. Filter by taxonomy, class, or specimen metadata.",
      tags: ["Taxonomy Browse", "Advanced Filters", "Whole Slide Viewer"],
      cta: "Open Database",
      path: "/species/browse",
      accentVar: "var(--ais-blue)",
    },
    {
      icon: <IconUpload />,
      title: "Contribute to the Database",
      description:
        "Share your blood smear images and help build a comprehensive hematology resource. All contributions go through expert review.",
      tags: ["Full Slide Upload", "Cellavision Data", "Expert Review"],
      cta: "Start Contributing",
      path: "/contribute",
      accentVar: "var(--ais-green)",
    },
    {
      icon: <IconGrid />,
      title: "View Recent Uploads",
      description:
        "See the latest specimens added to the archive with taxonomy metadata and hematology context from the UC Davis veterinary team.",
      tags: ["Latest Specimens", "Taxonomy Tags", "Image Previews"],
      cta: "View Recent",
      path: "/recent-uploads",
      accentVar: "var(--ais-teal)",
    },
  ];

  const audiences = [
    {
      emoji: "👨‍⚕️",
      title: "Veterinarians",
      text: "Enhance diagnostic accuracy with a comprehensive library of comparative hematology images and advanced search tools.",
      tags: ["Diagnostic Support", "Case Management"],
    },
    {
      emoji: "🔬",
      title: "Researchers",
      text: "Conduct research with access to extensive image datasets and curated taxonomic metadata across exotic animal species.",
      tags: ["Dataset Access", "Taxonomy Metadata"],
    },
    {
      emoji: "🎓",
      title: "Students & Educators",
      text: "Learn and teach with high-quality hematology specimens organized by species, class, and morphology.",
      tags: ["Educational Archive", "Species Breadth"],
    },
  ];

  return (
    <div className="ais-page">

      {/* ── Stats bar ── */}
      <div className="ais-statsbar" role="region" aria-label="Collection statistics">
        <div className="ais-statsbar__inner">
          <div className="ais-stat">
            <span className="ais-stat__num">12+</span>
            <span className="ais-stat__label">Species</span>
          </div>
          <span className="ais-stat__div" aria-hidden="true" />
          <div className="ais-stat">
            <span className="ais-stat__num">3</span>
            <span className="ais-stat__label">Animal Classes</span>
          </div>
          <span className="ais-stat__div" aria-hidden="true" />
          <div className="ais-stat">
            <span className="ais-stat__num">Expert</span>
            <span className="ais-stat__label">Reviewed Dataset</span>
          </div>
          <span className="ais-stat__div" aria-hidden="true" />
          <div className="ais-stat">
            <span className="ais-stat__num">UC&nbsp;Davis</span>
            <span className="ais-stat__label">Veterinary Medicine</span>
          </div>
        </div>
      </div>

      {/* ── Action cards ── */}
      <section className="ais-actions" aria-label="Main entry points">
        <div className="ais-section-inner">
          <h2 className="ais-section-heading">Get Started</h2>
          <div className="ais-actions__grid">
            {actions.map((a) => (
              <button
                key={a.title}
                className="ais-action-card"
                onClick={() => navigate(a.path)}
                style={{ '--card-accent': a.accentVar }}
                aria-label={a.cta}
              >
                <div className="ais-action-card__icon-wrap">
                  {a.icon}
                </div>
                <h3 className="ais-action-card__title">{a.title}</h3>
                <p className="ais-action-card__desc">{a.description}</p>
                <div className="ais-action-card__tags">
                  {a.tags.map((t) => (
                    <span key={t} className="ais-chip">{t}</span>
                  ))}
                </div>
                <span className="ais-action-card__cta">
                  {a.cta}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audience cards ── */}
      <section className="ais-audiences" aria-label="Who uses this database">
        <div className="ais-section-inner">
          <h2 className="ais-section-heading">Who Uses This Database</h2>
          <div className="ais-audiences__grid">
            {audiences.map((a) => (
              <div key={a.title} className="ais-audience-card">
                <span className="ais-audience-card__emoji" aria-hidden="true">
                  {a.emoji}
                </span>
                <h3 className="ais-audience-card__title">{a.title}</h3>
                <p className="ais-audience-card__text">{a.text}</p>
                <div className="ais-audience-card__tags">
                  {a.tags.map((t) => (
                    <span key={t} className="ais-chip ais-chip--light">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AppInfoSection;
