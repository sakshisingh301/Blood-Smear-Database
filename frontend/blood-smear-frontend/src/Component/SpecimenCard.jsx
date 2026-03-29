import React from 'react';
import { Link } from 'react-router-dom';
import './SpecimenCard.css';

const CLASS_ACCENT = {
  Aves: '#1a6b3c',
  Mammalia: '#7b3514',
  Reptilia: '#4a6120',
  Amphibia: '#1a5a6b',
  Actinopterygii: '#1a3a7b',
};

const SpecimenCard = ({ specimen }) => {
  const accentColor = CLASS_ACCENT[specimen.class] || '#022851';
  const clsKey = specimen.class?.toLowerCase() || 'default';

  return (
    <Link
      to={`/species/${encodeURIComponent(specimen.scientificName)}${specimen.jobId ? `?job=${specimen.jobId}` : ''}`}
      className="sc-card"
      aria-label={`View ${specimen.commonName} — ${specimen.scientificName}`}
    >
      <span className="sc-accent" style={{ background: accentColor }} aria-hidden="true" />

      <div className="sc-body">
        <div className="sc-names">
          <h3 className="sc-common-name">{specimen.commonName}</h3>
          <p className="sc-sci-name">{specimen.scientificName}</p>
        </div>

        <div className="sc-chips">
          {specimen.class && (
            <span className={`sc-chip sc-chip--class sc-chip--${clsKey}`}>
              {specimen.class}
            </span>
          )}
          {specimen.order && (
            <span className="sc-chip sc-chip--order">{specimen.order}</span>
          )}
          {specimen.family && (
            <span className="sc-chip sc-chip--family">{specimen.family}</span>
          )}
        </div>

        {specimen.description && (
          <p className="sc-desc">
            {specimen.description.length > 185
              ? `${specimen.description.slice(0, 185)}…`
              : specimen.description}
          </p>
        )}
      </div>

      <span className="sc-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </Link>
  );
};

export default SpecimenCard;
