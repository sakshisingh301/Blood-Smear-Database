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
  const parts = [];
  if (age.years)  parts.push(`${age.years} year${age.years !== 1 ? 's' : ''}`);
  if (age.months) parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`);
  if (age.days)   parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`);
  if (age.value)  return `${age.value} ${age.unit || ''}`.trim();
  return parts.length ? parts.join(', ') : 'N/A';
};

const DetailRow = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value || 'N/A'}</span>
  </div>
);

const SpeciesDetailPage = () => {
  const { scientificName } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');

  const [record, setRecord]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeImageModal, setActiveImageModal] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided. Please return to the species list and click a specimen.');
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="species-detail-page">
        <UCDavisNavbar />
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading specimen data…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !record) {
    return (
      <div className="species-detail-page">
        <UCDavisNavbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Specimen not found'}</p>
          <Link to="/species" className="back-button">← Back to Species List</Link>
        </div>
      </div>
    );
  }

  const taxonomy   = record.taxonomy || {};
  const dziEntry   = record.dzi_outputs?.whole_slide?.[0];
  const dziUrl     = dziEntry?.dzi_url || null;
  const cellavision = record.cellavision_images || {};
  const hasCellavision = Object.keys(cellavision).some(k => cellavision[k]?.length > 0);

  return (
    <div className="species-detail-page">
      <UCDavisNavbar />

      {/* ── Breadcrumb ── */}
      <div className="breadcrumb">
        <Link to="/species">Species Explorer</Link>
        <span> → </span>
        <span>{record.common_name}</span>
      </div>

      {/* ── Header ── */}
      <div className="species-header">
        <div className="species-title">
          <h1>{record.common_name}</h1>
          <p className="scientific-name"><em>{record.scientific_name}</em></p>
        </div>
        <div className="species-taxonomy">
          <div className="taxonomy-breadcrumb">
            {taxonomy.phylum && <><span className="taxonomy-link">{taxonomy.phylum}</span><span className="taxonomy-separator">→</span></>}
            {taxonomy.class  && <><span className="taxonomy-link">{taxonomy.class}</span><span className="taxonomy-separator">→</span></>}
            {taxonomy.order  && <><span className="taxonomy-link">{taxonomy.order}</span><span className="taxonomy-separator">→</span></>}
            {taxonomy.family && <span className="taxonomy-link">{taxonomy.family}</span>}
          </div>
        </div>
      </div>

      {/* ── Metadata grid ── */}
      <div className="blood-smear-section">
        <h2>Specimen Details</h2>
        <div className="records-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>

          {/* Taxonomy */}
          <div className="record-card">
            <div className="record-header"><h4>Taxonomy</h4></div>
            <div className="record-details">
              <DetailRow label="Common Name"     value={record.common_name} />
              <DetailRow label="Scientific Name" value={record.scientific_name} />
              <DetailRow label="Phylum"          value={taxonomy.phylum} />
              <DetailRow label="Class"           value={taxonomy.class} />
              <DetailRow label="Order"           value={taxonomy.order} />
              <DetailRow label="Family"          value={taxonomy.family} />
            </div>
          </div>

          {/* Health & Staining */}
          <div className="record-card">
            <div className="record-header"><h4>Health &amp; Staining</h4></div>
            <div className="record-details">
              <DetailRow label="Health Status"        value={record.health_status} />
              <DetailRow label="Custom Health Status" value={record.custom_health_status} />
              <DetailRow label="Stain"                value={record.stain} />
              <DetailRow label="Custom Stain"         value={record.custom_stain} />
            </div>
          </div>

          {/* Specimen Details */}
          <div className="record-card">
            <div className="record-header"><h4>Specimen Details</h4></div>
            <div className="record-details">
              <DetailRow label="Sex"           value={record.sex} />
              <DetailRow label="Age"           value={formatAge(record.age)} />
              <DetailRow label="Scanner Type"  value={record.scanner_type === 'custom' ? record.custom_scanner_type : record.scanner_type} />
              <DetailRow label="Magnification" value={record.magnification} />
            </div>
          </div>

          {/* Collection Info */}
          <div className="record-card">
            <div className="record-header"><h4>Collection Info</h4></div>
            <div className="record-details">
              <DetailRow label="Contributor"      value={record.contributor} />
              <DetailRow label="Collection Date"  value={formatDate(record.collected_at)} />
              <DetailRow label="Source"           value={record.source} />
              <DetailRow label="Approved" value={
                record.approved
                  ? <span style={{ color: '#1a6b3c', fontWeight: 600 }}>✅ Yes</span>
                  : <span style={{ color: '#b91c1c', fontWeight: 600 }}>❌ No</span>
              } />
            </div>
          </div>

        </div>
      </div>

      {/* ── Whole Slide Viewer ── */}
      {dziUrl && (
        <div className="images-section">
          <h3>Whole Slide Image Viewer</h3>
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
      )}

      {/* ── CellaVision Images ── */}
      {hasCellavision && (
        <div className="images-section">
          <h3>CellaVision Images</h3>
          {Object.entries(cellavision).map(([cellType, images]) => {
            if (!images?.length) return null;
            return (
              <div key={cellType} className="cell-type-section">
                <h5>{cellType}</h5>
                <div className="image-grid">
                  {images.map((img, idx) => {
                    const url = img.s3_storage?.cloudfront_url || img.s3_storage?.s3_url;
                    if (!url) return null;
                    return (
                      <div key={idx} className="image-item">
                        <TransformWrapper initialScale={1} minScale={1} maxScale={4} doubleClick={{ mode: 'reset' }}>
                          <TransformComponent>
                            <img
                              src={url}
                              alt={`${cellType} image ${idx + 1}`}
                              className="image-thumbnail"
                              style={{ width: '100%', height: 'auto', cursor: 'zoom-in', display: 'block' }}
                              onClick={() => setActiveImageModal({ url, label: `${cellType} — Image ${idx + 1}` })}
                            />
                          </TransformComponent>
                        </TransformWrapper>
                        <p>{cellType} — Image {idx + 1}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No images state */}
      {!dziUrl && !hasCellavision && (
        <div className="images-section">
          <h3>Images</h3>
          <div className="no-data">
            <p>
              {record.status === 'ready_for_viewer'
                ? 'No images available for this specimen.'
                : `Images are being processed (status: ${record.status}). Check back shortly.`}
            </p>
          </div>
        </div>
      )}

      {/* ── Image modal ── */}
      {activeImageModal && (
        <div className="image-modal" onClick={() => setActiveImageModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setActiveImageModal(null)}>×</button>
            <img src={activeImageModal.url} alt={activeImageModal.label} className="modal-image" />
            <div className="modal-info"><h4>{activeImageModal.label}</h4></div>
          </div>
        </div>
      )}

      {/* ── Back ── */}
      <div className="back-to-list">
        <Link to="/species" className="back-button">← Back to Species List</Link>
      </div>
    </div>
  );
};

export default SpeciesDetailPage;
