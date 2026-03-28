import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GoldBackgroundSection.css";

// Repurposed as the homepage Hero / Search entry point.
// The component name is kept for import compatibility with App.jsx.
const GoldBackgroundSection = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/species?q=${encodeURIComponent(q)}` : '/species');
  };

  return (
    <section className="hp-hero" aria-labelledby="hp-hero-heading">
      <div className="hp-hero__inner">
        <p className="hp-hero__eyebrow">UC Davis School of Veterinary Medicine</p>

        <h1 id="hp-hero-heading" className="hp-hero__title">
          Search and Explore Blood Smear Specimens<br className="hp-hero__br" />
          Across Exotic Species
        </h1>

        <p className="hp-hero__subtitle">
          A curated hematology image database for veterinary research, diagnostics, and education.
        </p>

        {/* Primary search entry point */}
        <form className="hp-hero__search" onSubmit={handleSearch} role="search" aria-label="Search specimens">
          <div className="hp-hero__search-wrap">
            <svg
              className="hp-hero__search-icon"
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="hp-hero__search-input"
              placeholder="Search by species, genus, family, or class…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search specimens"
            />
            <button type="submit" className="hp-hero__search-btn">
              Search
            </button>
          </div>

          {/* Quick taxonomy shortcuts */}
          <div className="hp-hero__quick-links" aria-label="Quick browse links">
            <span className="hp-hero__quick-label">Browse:</span>
            {['Aves', 'Mammalia', 'Reptilia'].map((cls) => (
              <button
                key={cls}
                type="button"
                className="hp-hero__quick-chip"
                onClick={() => navigate(`/species?q=${cls}`)}
              >
                {cls}
              </button>
            ))}
          </div>
        </form>

        {/* Secondary CTAs */}
        <div className="hp-hero__actions">
          <button
            className="hp-hero__cta hp-hero__cta--primary"
            onClick={() => navigate('/species')}
          >
            Explore Database
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            className="hp-hero__cta hp-hero__cta--secondary"
            onClick={() => navigate('/contribute')}
          >
            Contribute Images
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoldBackgroundSection;
