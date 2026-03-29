import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import WholeSlideViewer from '../Component/WholeSlideViewer';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './SpeciesDetailPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatAge = (age) => {
  if (!age) return 'N/A';
  if (age.value) return `${age.value} ${age.unit || ''}`.trim();
  const parts = [];
  if (age.years)  parts.push(`${age.years}y`);
  if (age.months) parts.push(`${age.months}m`);
  if (age.days)   parts.push(`${age.days}d`);
  return parts.length ? parts.join(' ') : 'N/A';
};

// Sub-components
const TaxonomyChips = ({ taxonomy }) => {
  const levels = [
    { key: 'phylum', label: taxonomy?.phylum },
    { key: 'class',  label: taxonomy?.class },
    { key: 'order',  label: taxonomy?.order },
    { key: 'family', label: taxonomy?.family },
  ].filter(l => l.label);

  if (!levels.length) return null;
  return (
    <div className="sdp-tax-chips">
      {levels.map((l, i) => (
        <React.Fragment key={l.key}>
          <span className="sdp-tax-chip">{l.label}</span>
          {i < levels.length - 1 && <span className="sdp-tax-sep" aria-hidden="true">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const QuickInfoBar = ({ record }) => {
  const items = [
    { icon: '🩺', label: 'Health', value: record.health_status || 'Unknown' },
    { icon: '🔬', label: 'Stain', value: record.stain || record.custom_stain || 'N/A' },
    { icon: '🔭', label: 'Magnification', value: record.magnification || 'N/A' },
    { icon: '📅', label: 'Collected', value: record.collected_at ? new Date(record.collected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A' },
  ];
  return (
    <div className="sdp-quickbar">
      {items.map(item => (
        <div key={item.label} className="sdp-quickbar__item">
          <span className="sdp-quickbar__icon" aria-hidden="true">{item.icon}</span>
          <div className="sdp-quickbar__text">
            <span className="sdp-quickbar__label">{item.label}</span>
            <span className="sdp-quickbar__value">{item.value}</span>
          </div>
        </div>
      ))}
      <div className="sdp-quickbar__item">
        <span className="sdp-quickbar__icon" aria-hidden="true">{record.approved ? '✅' : '⏳'}</span>
        <div className="sdp-quickbar__text">
          <span className="sdp-quickbar__label">Status</span>
          <span className={`sdp-status-badge ${record.approved ? 'sdp-status-badge--approved' : 'sdp-status-badge--pending'}`}>
            {record.approved ? 'Approved' : 'Pending Review'}
          </span>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon, rows }) => (
  <div className="sdp-infocard">
    <div className="sdp-infocard__head">
      <span className="sdp-infocard__icon" aria-hidden="true">{icon}</span>
      <h3 className="sdp-infocard__title">{title}</h3>
    </div>
    <dl className="sdp-infocard__rows">
      {rows.map(({ label, value }) => (
        <div key={label} className="sdp-infocard__row">
          <dt className="sdp-infocard__label">{label}</dt>
          <dd className="sdp-infocard__value">{value || <span className="sdp-na">N/A</span>}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const SpeciesDetailPage = () => {
  const { scientificName } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');

  const [record, setRecord]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeImageModal, setActiveImageModal] = useState(null);
  const [activeCellType, setActiveCellType]     = useState(null);

  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided. Return to the species list and select a specimen.');
      setLoading(false);
      return;
    }
    const fetchRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`${API_BASE}/api/uploads/${jobId}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Record not found');
        setRecord(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [jobId]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sdp-page">
        <UCDavisNavbar />
        <div className="sdp-state-center">
          <div className="sdp-spinner" aria-label="Loading" />
          <p className="sdp-state-msg">Loading specimen data…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !record) {
    return (
      <div className="sdp-page">
        <UCDavisNavbar />
        <div className="sdp-state-center sdp-state-center--error">
          <span className="sdp-state-icon" aria-hidden="true">⚠️</span>
          <h2 className="sdp-state-title">Unable to Load Specimen</h2>
          <p className="sdp-state-msg">{error || 'Specimen not found'}</p>
          <Link to="/species" className="sdp-btn sdp-btn--primary">← Back to Species List</Link>
        </div>
      </div>
    );
  }

  const taxonomy    = record.taxonomy || {};
  const dziEntry    = record.dzi_outputs?.whole_slide?.[0];
  const dziUrl      = dziEntry?.dzi_url || null;
  const cellavision = record.cellavision_images || {};
  const cellaTypes  = Object.keys(cellavision).filter(k => cellavision[k]?.length > 0);
  const hasCellavision = cellaTypes.length > 0;
  const displayName = record.common_name?.trim() || 'Specimen Record';
  const hasName     = !!record.common_name?.trim();

  // Set first cell type active by default
  const currentCellType = activeCellType || cellaTypes[0];

  return (
    <div className="sdp-page">
      <UCDavisNavbar />

      {/* ── Breadcrumb ── */}
      <nav className="sdp-breadcrumb" aria-label="Breadcrumb">
        <div className="sdp-breadcrumb__inner">
          <Link to="/" className="sdp-breadcrumb__link">Home</Link>
          <span className="sdp-breadcrumb__sep" aria-hidden="true">›</span>
          <Link to="/species" className="sdp-breadcrumb__link">Search Results</Link>
          {taxonomy.class && (
            <>
              <span className="sdp-breadcrumb__sep" aria-hidden="true">›</span>
              <span className="sdp-breadcrumb__current">{taxonomy.class}</span>
            </>
          )}
          <span className="sdp-breadcrumb__sep" aria-hidden="true">›</span>
          <span className="sdp-breadcrumb__current">{displayName}</span>
        </div>
      </nav>

      <div className="sdp-body">

        {/* ── Hero: Title + taxonomy chips ── */}
        <header className="sdp-hero">
          <div className="sdp-hero__text">
            {!hasName && (
              <span className="sdp-hero__placeholder-badge">Unnamed Specimen</span>
            )}
            <h1 className="sdp-hero__title">{displayName}</h1>
            {record.scientific_name && (
              <p className="sdp-hero__sci"><em>{record.scientific_name}</em></p>
            )}
            <TaxonomyChips taxonomy={taxonomy} />
          </div>
          <div className="sdp-hero__meta">
            <span className="sdp-hero__job">Job ID: <code>{record.job_id}</code></span>
            <span className={`sdp-status-badge ${record.approved ? 'sdp-status-badge--approved' : 'sdp-status-badge--pending'}`}>
              {record.approved ? '✓ Approved' : '⏳ Pending Review'}
            </span>
          </div>
        </header>

        {/* ── Main image viewer ── */}
        {dziUrl ? (
          <section className="sdp-viewer-section" aria-label="Whole slide image viewer">
            <div className="sdp-viewer-header">
              <h2 className="sdp-section-title">
                <span className="sdp-section-title__icon" aria-hidden="true">🔬</span>
                Whole Slide Image
              </h2>
              <div className="sdp-viewer-stats">
                {dziEntry.pyramid_levels && <span className="sdp-viewer-stat">{dziEntry.pyramid_levels} zoom levels</span>}
                {dziEntry.tile_count     && <span className="sdp-viewer-stat">{dziEntry.tile_count.toLocaleString()} tiles</span>}
                {dziEntry.image_width && dziEntry.image_height && (
                  <span className="sdp-viewer-stat">{dziEntry.image_width.toLocaleString()} × {dziEntry.image_height.toLocaleString()} px</span>
                )}
              </div>
            </div>
            <div className="sdp-viewer-wrap">
              <WholeSlideViewer
                dziUrl={dziUrl}
                metadata={{
                  image_width:    dziEntry.image_width,
                  image_height:   dziEntry.image_height,
                  pyramid_levels: dziEntry.pyramid_levels,
                  tile_count:     dziEntry.tile_count,
                  tile_size:      dziEntry.tile_size,
                }}
              />
            </div>
          </section>
        ) : hasCellavision ? null : (
          <section className="sdp-no-image">
            <span className="sdp-no-image__icon" aria-hidden="true">🔬</span>
            <p className="sdp-no-image__msg">
              {record.status === 'ready_for_viewer'
                ? 'No whole-slide image available for this specimen.'
                : <>Images are being processed — <strong>status: {record.status}</strong>. Check back shortly.</>
              }
            </p>
          </section>
        )}

        {/* ── Quick info bar ── */}
        <QuickInfoBar record={record} />

        {/* ── Info cards ── */}
        <section className="sdp-cards" aria-label="Specimen information">
          <InfoCard
            title="Taxonomy"
            icon="🧬"
            rows={[
              { label: 'Common Name',     value: record.common_name },
              { label: 'Scientific Name', value: record.scientific_name && <em>{record.scientific_name}</em> },
              { label: 'Phylum',          value: taxonomy.phylum },
              { label: 'Class',           value: taxonomy.class },
              { label: 'Order',           value: taxonomy.order },
              { label: 'Family',          value: taxonomy.family },
            ]}
          />
          <InfoCard
            title="Health & Staining"
            icon="🩺"
            rows={[
              { label: 'Health Status',        value: record.health_status },
              { label: 'Custom Health Status', value: record.custom_health_status },
              { label: 'Stain',                value: record.stain },
              { label: 'Custom Stain',         value: record.custom_stain },
            ]}
          />
          <InfoCard
            title="Specimen Details"
            icon="🦁"
            rows={[
              { label: 'Sex',           value: record.sex },
              { label: 'Age',           value: formatAge(record.age) },
              { label: 'Scanner Type',  value: record.scanner_type === 'custom' ? record.custom_scanner_type : record.scanner_type },
              { label: 'Magnification', value: record.magnification },
            ]}
          />
          <InfoCard
            title="Collection & Attribution"
            icon="📋"
            rows={[
              { label: 'Contributor',     value: record.contributor },
              { label: 'Collection Date', value: formatDate(record.collected_at) },
              { label: 'Source',          value: record.source },
              { label: 'Submitted',       value: formatDate(record.created_at) },
            ]}
          />
        </section>

        {/* ── CellaVision gallery ── */}
        {hasCellavision && (
          <section className="sdp-gallery-section" aria-label="CellaVision images">
            <div className="sdp-gallery-header">
              <h2 className="sdp-section-title">
                <span className="sdp-section-title__icon" aria-hidden="true">🧫</span>
                CellaVision Images
              </h2>
              <p className="sdp-gallery-sub">{cellaTypes.length} cell type{cellaTypes.length !== 1 ? 's' : ''} · click any image to enlarge</p>
            </div>

            {/* Cell type tabs */}
            {cellaTypes.length > 1 && (
              <div className="sdp-celltabs" role="tablist">
                {cellaTypes.map(ct => (
                  <button
                    key={ct}
                    role="tab"
                    aria-selected={currentCellType === ct}
                    className={`sdp-celltab${currentCellType === ct ? ' sdp-celltab--active' : ''}`}
                    onClick={() => setActiveCellType(ct)}
                  >
                    {ct}
                    <span className="sdp-celltab__count">{cellavision[ct].length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Image grid for active cell type */}
            {currentCellType && (
              <div className="sdp-gallery-grid" role="tabpanel">
                {cellavision[currentCellType].map((img, idx) => {
                  const url = img.s3_storage?.cloudfront_url || img.s3_storage?.s3_url;
                  if (!url) return null;
                  return (
                    <button
                      key={idx}
                      className="sdp-gallery-item"
                      onClick={() => setActiveImageModal({ url, label: `${currentCellType} — Image ${idx + 1}`, filename: img.original_filename })}
                      aria-label={`View ${currentCellType} image ${idx + 1}`}
                    >
                      <div className="sdp-gallery-item__img-wrap">
                        <img src={url} alt={`${currentCellType} ${idx + 1}`} className="sdp-gallery-item__img" loading="lazy" />
                        <div className="sdp-gallery-item__overlay" aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                        </div>
                      </div>
                      <p className="sdp-gallery-item__label">{currentCellType} {idx + 1}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Action bar ── */}
        <div className="sdp-actions">
          <Link to="/species" className="sdp-btn sdp-btn--outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Results
          </Link>
          {dziUrl && (
            <a href={dziUrl} target="_blank" rel="noopener noreferrer" className="sdp-btn sdp-btn--secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Raw DZI
            </a>
          )}
          <Link to="/contribute" className="sdp-btn sdp-btn--ghost">
            + Contribute a Specimen
          </Link>
        </div>
      </div>

      {/* ── Image modal ── */}
      {activeImageModal && (
        <div className="sdp-modal" role="dialog" aria-modal="true" aria-label={activeImageModal.label} onClick={() => setActiveImageModal(null)}>
          <div className="sdp-modal__box" onClick={e => e.stopPropagation()}>
            <button className="sdp-modal__close" onClick={() => setActiveImageModal(null)} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="sdp-modal__img-wrap">
              <img src={activeImageModal.url} alt={activeImageModal.label} className="sdp-modal__img" />
            </div>
            <div className="sdp-modal__footer">
              <span className="sdp-modal__label">{activeImageModal.label}</span>
              {activeImageModal.filename && (
                <span className="sdp-modal__filename">{activeImageModal.filename}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesDetailPage;
