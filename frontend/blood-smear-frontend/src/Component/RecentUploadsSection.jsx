import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentUploadsSection.css';

// Placeholder specimens — in production these would come from GET /api/species/browse
const RECENT_SPECIMENS = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=480&h=360&fit=crop&crop=center',
    commonName: 'Canine',
    scientificName: 'Canis lupus familiaris',
    classTag: 'Mammalia',
    uploadDate: '2024-01-15',
    contributor: 'Dr. Smith',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=480&h=360&fit=crop&crop=center',
    commonName: 'Feline',
    scientificName: 'Felis catus',
    classTag: 'Mammalia',
    uploadDate: '2024-01-14',
    contributor: 'Dr. Johnson',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=480&h=360&fit=crop&crop=center',
    commonName: 'Avian',
    scientificName: 'Psittacus erithacus',
    classTag: 'Aves',
    uploadDate: '2024-01-13',
    contributor: 'Dr. Williams',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=360&fit=crop&crop=center',
    commonName: 'Equine',
    scientificName: 'Equus ferus caballus',
    classTag: 'Mammalia',
    uploadDate: '2024-01-12',
    contributor: 'Dr. Brown',
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-b6a253d1ce90?w=480&h=360&fit=crop&crop=center',
    commonName: 'Reptile',
    scientificName: 'Varanus komodoensis',
    classTag: 'Reptilia',
    uploadDate: '2024-01-11',
    contributor: 'Dr. Davis',
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=480&h=360&fit=crop&crop=center',
    commonName: 'Rodent',
    scientificName: 'Cavia porcellus',
    classTag: 'Mammalia',
    uploadDate: '2024-01-10',
    contributor: 'Dr. Wilson',
  },
];

const CLASS_CHIP_MOD = {
  Mammalia:      'rus-chip--mammalia',
  Aves:          'rus-chip--aves',
  Reptilia:      'rus-chip--reptilia',
  Amphibia:      'rus-chip--amphibia',
  Actinopterygii:'rus-chip--fish',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const RecentUploadsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="rus-section" aria-labelledby="rus-heading">
      <div className="rus-inner">

        {/* Section header */}
        <div className="rus-header">
          <div>
            <h2 id="rus-heading" className="rus-header__title">Recently Added Specimens</h2>
            <p className="rus-header__sub">Latest hematology images added to the archive</p>
          </div>
          <button
            className="rus-header__cta"
            onClick={() => navigate('/species')}
            aria-label="Explore all specimens"
          >
            Explore All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Specimen grid */}
        <div className="rus-grid" role="list">
          {RECENT_SPECIMENS.map((s) => (
            <article
              key={s.id}
              className="rus-card"
              role="listitem"
              onClick={() => navigate('/species')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/species')}
              aria-label={`${s.commonName} — ${s.scientificName}`}
            >
              {/* Image */}
              <div className="rus-card__img-wrap">
                <img
                  src={s.imageUrl}
                  alt={`Blood smear specimen — ${s.commonName}`}
                  className="rus-card__img"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="rus-card__overlay" aria-hidden="true">
                  <span className="rus-card__overlay-text">View Specimen</span>
                </div>
              </div>

              {/* Card body */}
              <div className="rus-card__body">
                <div className="rus-card__names">
                  <h3 className="rus-card__common">{s.commonName}</h3>
                  <p className="rus-card__sci">{s.scientificName}</p>
                </div>
                <div className="rus-card__meta">
                  <span className={`rus-chip ${CLASS_CHIP_MOD[s.classTag] || ''}`}>
                    {s.classTag}
                  </span>
                  <span className="rus-card__date">{formatDate(s.uploadDate)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="rus-footer">
          <button
            className="rus-footer__btn"
            onClick={() => navigate('/species')}
          >
            Explore All Specimens
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default RecentUploadsSection;
