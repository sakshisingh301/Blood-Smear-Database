import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './ContributePage.css';

const phylumClassMapping = {
  Chordata: ['Actinopterygii', 'Amphibia', 'Aves', 'Chondrichthyes', 'Mammalia', 'Reptilia', 'Sarcopterygii'],
  Arthropoda: ['Arachnida', 'Branchiopoda', 'Chilopoda', 'Diplopoda', 'Insecta', 'Malacostraca', 'Merostomata', 'Myriapoda'],
  Mollusca: ['Bivalvia', 'Cephalopoda', 'Gastropoda', 'Polyplacophora'],
  Annelida: ['Clitellata', 'Polychaeta'],
  Echinodermata: ['Asteroidea', 'Echinoidea', 'Holothuroidea', 'Ophiuroidea'],
  Platyhelminthes: ['Cestoda', 'Monogenea', 'Trematoda', 'Turbellaria'],
  Nematoda: ['Chromadorea', 'Enoplea'],
  Cnidaria: ['Anthozoa', 'Hydrozoa', 'Scyphozoa'],
};

const ContributePage = () => {
  const [uploadType, setUploadType] = useState('fullSlide');
  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    phylum: '',
    class: '',
    order: '',
    family: '',
    genus: '',
    species: '',
    sex: '',
    age_value: '',
    age_unit: 'years',
    health_status: '',
    collection_date: '',
    location: '',
    stain_type: '',
    magnification: '',
    additional_notes: '',
    uploaded_by: '',
    institution: '',
    imaging_system: '',
    animal_id: '',
    weight: '',
    body_condition_score: '',
    hematocrit: '',
    total_protein: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [fullSlideImage, setFullSlideImage] = useState(null);
  const [cellTypeImages, setCellTypeImages] = useState([
    { cellType: 'Heterophil', images: [] },
    { cellType: 'Eosinophil', images: [] },
    { cellType: 'Basophil', images: [] },
    { cellType: 'Lymphocyte', images: [] },
    { cellType: 'Monocyte', images: [] },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'phylum') setFormData(prev => ({ ...prev, phylum: value, class: '' }));
  };

  const handleFullSlideImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFullSlideImage(file);
  };

  const handleCellTypeImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    setCellTypeImages(prev => prev.map((ct, i) =>
      i === index ? { ...ct, images: [...ct.images, ...files] } : ct
    ));
  };

  const addCustomCellType = () => {
    const name = prompt('Enter cell type name:');
    if (name && name.trim()) {
      setCellTypeImages(prev => [...prev, { cellType: name.trim(), images: [] }]);
    }
  };

  const removeCellType = (index) => {
    setCellTypeImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (cellTypeIndex, imageIndex) => {
    setCellTypeImages(prev => prev.map((ct, i) =>
      i === cellTypeIndex
        ? { ...ct, images: ct.images.filter((_, j) => j !== imageIndex) }
        : ct
    ));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.common_name.trim()) newErrors.common_name = 'Common name is required';
    if (!formData.scientific_name.trim()) newErrors.scientific_name = 'Scientific name is required';
    if (!formData.phylum) newErrors.phylum = 'Phylum is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.health_status) newErrors.health_status = 'Health status is required';
    if (!formData.stain_type.trim()) newErrors.stain_type = 'Stain type is required';
    if (!formData.uploaded_by.trim()) newErrors.uploaded_by = 'Your name is required';
    if (uploadType === 'fullSlide' && !fullSlideImage) {
      newErrors.fullSlideImage = 'Please select a full slide image file';
    }
    if (uploadType === 'cellavision') {
      const hasImages = cellTypeImages.some(ct => ct.images.length > 0);
      if (!hasImages) newErrors.cellTypeImages = 'Please add at least one cell image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });
      data.append('upload_type', uploadType);
      if (uploadType === 'fullSlide' && fullSlideImage) {
        data.append('full_slide_image', fullSlideImage);
      } else if (uploadType === 'cellavision') {
        cellTypeImages.forEach(ct => {
          ct.images.forEach(img => {
            data.append(`cell_${ct.cellType}`, img);
          });
        });
      }
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (response.ok) {
        setCurrentJobId(result.jobId);
        setRecentUploads(prev => [...prev, { jobId: result.jobId, commonName: formData.common_name, status: 'queued' }]);
      } else {
        setErrors({ submit: result.message || 'Upload failed. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkJobStatus = async (jobId) => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const result = await response.json();
      if (response.ok) {
        setJobStatus(result);
        setRecentUploads(prev => prev.map(u => u.jobId === jobId ? { ...u, status: result.status } : u));
      }
    } catch {
      // silently fail
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return '#1a6b3c';
    if (status === 'failed') return '#b91c1c';
    if (status === 'processing') return '#b45309';
    return '#4b5563';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return '✓';
    if (status === 'failed') return '✗';
    if (status === 'processing') return '⟳';
    return '…';
  };

  const availableClasses = formData.phylum ? (phylumClassMapping[formData.phylum] || []) : [];

  return (
    <div className="cp-page">
      <UCDavisNavbar />

      {/* ── Hero ── */}
      <div className="cp-hero">
        <div className="cp-hero__inner">
          <p className="cp-hero__eyebrow">UC Davis Blood Smear Database</p>
          <h1 className="cp-hero__title">Contribute to the Database</h1>
          <p className="cp-hero__sub">
            Submit blood smear specimens to advance comparative hematology research. All contributions
            are reviewed by our team before being added to the public archive.
          </p>
        </div>
        <Link to="/" className="cp-hero__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="cp-body">

        {/* ── Success state ── */}
        {currentJobId && (
          <div className="cp-success">
            <div className="cp-success__icon">✓</div>
            <div className="cp-success__content">
              <h2 className="cp-success__title">Submission Received</h2>
              <p className="cp-success__msg">
                Your specimen has been queued for processing. Job ID: <strong>{currentJobId}</strong>
              </p>
              <button
                className="cp-btn cp-btn--primary"
                onClick={() => checkJobStatus(currentJobId)}
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? 'Checking…' : 'Check Status'}
              </button>
              {jobStatus && (
                <p className="cp-success__status" style={{ color: getStatusColor(jobStatus.status) }}>
                  {getStatusIcon(jobStatus.status)} {jobStatus.status}
                  {jobStatus.message ? ` — ${jobStatus.message}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Recent uploads toolbar ── */}
        {recentUploads.length > 0 && (
          <div className="cp-toolbar">
            <span className="cp-toolbar__label">Recent uploads</span>
            {recentUploads.map(u => (
              <button
                key={u.jobId}
                className="cp-toolbar__btn"
                onClick={() => checkJobStatus(u.jobId)}
              >
                {u.commonName}
                <span className="cp-toolbar__badge" style={{ background: getStatusColor(u.status) }}>
                  {getStatusIcon(u.status)} {u.status}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Submission guidelines ── */}
        <section className="cp-guidelines-section" aria-labelledby="cp-guidelines-heading">
          <h2 id="cp-guidelines-heading" className="cp-guidelines-section__heading">Submission Guidelines</h2>
          <div className="cp-guidelines">
            <div className="cp-guideline">
              <span className="cp-guideline__icon" aria-hidden="true">🔬</span>
              <h3 className="cp-guideline__title">Image Quality</h3>
              <p className="cp-guideline__text">
                Submit images captured at 1000× magnification with consistent lighting and focus.
                Accepted formats: TIFF, NDPI, SVS, PNG, JPEG.
              </p>
            </div>
            <div className="cp-guideline">
              <span className="cp-guideline__icon" aria-hidden="true">📋</span>
              <h3 className="cp-guideline__title">Metadata Accuracy</h3>
              <p className="cp-guideline__text">
                Provide accurate taxonomy and specimen details. Scientific names must follow
                standard binomial nomenclature. All required fields must be completed.
              </p>
            </div>
            <div className="cp-guideline">
              <span className="cp-guideline__icon" aria-hidden="true">⚖️</span>
              <h3 className="cp-guideline__title">Ethical Standards</h3>
              <p className="cp-guideline__text">
                Specimens must have been collected in compliance with all applicable regulations.
                By submitting you confirm proper authorization for data sharing.
              </p>
            </div>
          </div>
        </section>

        {/* ── Upload type selector ── */}
        <section className="cp-type-section" aria-labelledby="cp-type-heading">
          <h2 id="cp-type-heading" className="cp-type-section__heading">Select Upload Type</h2>
          <div className="cp-type-grid">
            <button
              type="button"
              className={`cp-type-card${uploadType === 'fullSlide' ? ' cp-type-card--selected' : ''}`}
              aria-pressed={uploadType === 'fullSlide'}
              onClick={() => setUploadType('fullSlide')}
            >
              {uploadType === 'fullSlide' && <span className="cp-type-card__check" aria-hidden="true">✓</span>}
              <span className="cp-type-card__icon" aria-hidden="true">🔬</span>
              <span className="cp-type-card__label">Full Slide Image</span>
              <span className="cp-type-card__desc">
                Single whole-slide image file (TIFF, NDPI, SVS). Best for high-resolution scans
                from digital slide scanners.
              </span>
            </button>
            <button
              type="button"
              className={`cp-type-card${uploadType === 'cellavision' ? ' cp-type-card--selected' : ''}`}
              aria-pressed={uploadType === 'cellavision'}
              onClick={() => setUploadType('cellavision')}
            >
              {uploadType === 'cellavision' && <span className="cp-type-card__check" aria-hidden="true">✓</span>}
              <span className="cp-type-card__icon" aria-hidden="true">🧫</span>
              <span className="cp-type-card__label">Cellavision Images</span>
              <span className="cp-type-card__desc">
                Multiple cell images organized by cell type from a Cellavision analyzer or
                manual microscopy with individual cell captures.
              </span>
            </button>
          </div>
        </section>

        {/* ── Main form ── */}
        <div className="cp-form-card">
          {errors.submit && (
            <div className="cp-form-error" role="alert">{errors.submit}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>

            {/* Section 1 — Basic Information */}
            <fieldset className="cp-fsec">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num">1</span>
                <div>
                  <span className="cp-fsec__title">Basic Information</span>
                  <span className="cp-fsec__sub">Identify the specimen by name</span>
                </div>
              </legend>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="common_name">
                    Common Name <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="common_name"
                    name="common_name"
                    className={`cp-input${errors.common_name ? ' cp-input--error' : ''}`}
                    type="text"
                    value={formData.common_name}
                    onChange={handleInputChange}
                    placeholder="e.g. African Elephant"
                  />
                  <span className="cp-hint">The common or vernacular species name</span>
                  {errors.common_name && <span className="cp-error" role="alert">{errors.common_name}</span>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="scientific_name">
                    Scientific Name <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="scientific_name"
                    name="scientific_name"
                    className={`cp-input${errors.scientific_name ? ' cp-input--error' : ''}`}
                    type="text"
                    value={formData.scientific_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Loxodonta africana"
                  />
                  <span className="cp-hint">Binomial nomenclature (Genus species)</span>
                  {errors.scientific_name && <span className="cp-error" role="alert">{errors.scientific_name}</span>}
                </div>
              </div>
            </fieldset>

            {/* Section 2 — Taxonomy */}
            <fieldset className="cp-fsec">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num">2</span>
                <div>
                  <span className="cp-fsec__title">Taxonomy</span>
                  <span className="cp-fsec__sub">Taxonomic classification of the specimen</span>
                </div>
              </legend>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="phylum">
                    Phylum <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="phylum"
                    name="phylum"
                    className={`cp-select${errors.phylum ? ' cp-input--error' : ''}`}
                    value={formData.phylum}
                    onChange={handleInputChange}
                  >
                    <option value="">Select phylum…</option>
                    {Object.keys(phylumClassMapping).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.phylum && <span className="cp-error" role="alert">{errors.phylum}</span>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="class">
                    Class <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="class"
                    name="class"
                    className={`cp-select${errors.class ? ' cp-input--error' : ''}`}
                    value={formData.class}
                    onChange={handleInputChange}
                    disabled={!formData.phylum}
                  >
                    <option value="">Select class…</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.class && <span className="cp-error" role="alert">{errors.class}</span>}
                </div>
              </div>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="order">Order</label>
                  <input
                    id="order"
                    name="order"
                    className="cp-input"
                    type="text"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="e.g. Proboscidea"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="family">Family</label>
                  <input
                    id="family"
                    name="family"
                    className="cp-input"
                    type="text"
                    value={formData.family}
                    onChange={handleInputChange}
                    placeholder="e.g. Elephantidae"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="genus">Genus</label>
                  <input
                    id="genus"
                    name="genus"
                    className="cp-input"
                    type="text"
                    value={formData.genus}
                    onChange={handleInputChange}
                    placeholder="e.g. Loxodonta"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="species">Species</label>
                  <input
                    id="species"
                    name="species"
                    className="cp-input"
                    type="text"
                    value={formData.species}
                    onChange={handleInputChange}
                    placeholder="e.g. africana"
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 3 — Specimen Details */}
            <fieldset className="cp-fsec">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num">3</span>
                <div>
                  <span className="cp-fsec__title">Specimen Details</span>
                  <span className="cp-fsec__sub">Health, sex, and age at time of collection</span>
                </div>
              </legend>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="health_status">
                    Health Status <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="health_status"
                    name="health_status"
                    className={`cp-select${errors.health_status ? ' cp-input--error' : ''}`}
                    value={formData.health_status}
                    onChange={handleInputChange}
                  >
                    <option value="">Select status…</option>
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="deceased">Deceased</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  {errors.health_status && <span className="cp-error" role="alert">{errors.health_status}</span>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="sex">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    className="cp-select"
                    value={formData.sex}
                    onChange={handleInputChange}
                  >
                    <option value="">Select sex…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div className="cp-frow cp-frow--narrow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="age_value">Age</label>
                  <div className="cp-age">
                    <input
                      id="age_value"
                      name="age_value"
                      className="cp-input cp-age__field"
                      type="number"
                      min="0"
                      value={formData.age_value}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <select
                      name="age_unit"
                      className="cp-select cp-age__unit"
                      value={formData.age_unit}
                      onChange={handleInputChange}
                    >
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                      <option value="years">years</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Section 4 — Collection & Attribution */}
            <fieldset className="cp-fsec">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num">4</span>
                <div>
                  <span className="cp-fsec__title">Collection &amp; Attribution</span>
                  <span className="cp-fsec__sub">When, where, and by whom</span>
                </div>
              </legend>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="uploaded_by">
                    Your Name <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="uploaded_by"
                    name="uploaded_by"
                    className={`cp-input${errors.uploaded_by ? ' cp-input--error' : ''}`}
                    type="text"
                    value={formData.uploaded_by}
                    onChange={handleInputChange}
                    placeholder="Dr. Jane Smith"
                  />
                  {errors.uploaded_by && <span className="cp-error" role="alert">{errors.uploaded_by}</span>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="institution">Institution</label>
                  <input
                    id="institution"
                    name="institution"
                    className="cp-input"
                    type="text"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="UC Davis School of Veterinary Medicine"
                  />
                </div>
              </div>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="collection_date">Collection Date</label>
                  <input
                    id="collection_date"
                    name="collection_date"
                    className="cp-input"
                    type="date"
                    value={formData.collection_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="location">Collection Location</label>
                  <input
                    id="location"
                    name="location"
                    className="cp-input"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Davis, CA, USA"
                  />
                </div>
              </div>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="stain_type">
                    Stain Type <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="stain_type"
                    name="stain_type"
                    className={`cp-input${errors.stain_type ? ' cp-input--error' : ''}`}
                    type="text"
                    value={formData.stain_type}
                    onChange={handleInputChange}
                    placeholder="e.g. Wright-Giemsa"
                  />
                  {errors.stain_type && <span className="cp-error" role="alert">{errors.stain_type}</span>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="magnification">Magnification</label>
                  <input
                    id="magnification"
                    name="magnification"
                    className="cp-input"
                    type="text"
                    value={formData.magnification}
                    onChange={handleInputChange}
                    placeholder="e.g. 1000×"
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 5 — Additional Details (optional) */}
            <fieldset className="cp-fsec cp-fsec--optional">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num cp-fsec__num--opt">5</span>
                <div>
                  <span className="cp-fsec__title">
                    Additional Details
                    <span className="cp-optional-badge">Optional</span>
                  </span>
                  <span className="cp-fsec__sub">Imaging system, animal ID, clinical measurements</span>
                </div>
              </legend>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="imaging_system">Imaging System</label>
                  <input
                    id="imaging_system"
                    name="imaging_system"
                    className="cp-input"
                    type="text"
                    value={formData.imaging_system}
                    onChange={handleInputChange}
                    placeholder="e.g. Hamamatsu NanoZoomer"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="animal_id">Animal ID</label>
                  <input
                    id="animal_id"
                    name="animal_id"
                    className="cp-input"
                    type="text"
                    value={formData.animal_id}
                    onChange={handleInputChange}
                    placeholder="Internal ID or tag number"
                  />
                </div>
              </div>
              <div className="cp-frow">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    name="weight"
                    className="cp-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="body_condition_score">Body Condition Score</label>
                  <input
                    id="body_condition_score"
                    name="body_condition_score"
                    className="cp-input"
                    type="number"
                    min="1"
                    max="9"
                    value={formData.body_condition_score}
                    onChange={handleInputChange}
                    placeholder="1–9"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="hematocrit">Hematocrit (%)</label>
                  <input
                    id="hematocrit"
                    name="hematocrit"
                    className="cp-input"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.hematocrit}
                    onChange={handleInputChange}
                    placeholder="e.g. 42"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="total_protein">Total Protein (g/dL)</label>
                  <input
                    id="total_protein"
                    name="total_protein"
                    className="cp-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.total_protein}
                    onChange={handleInputChange}
                    placeholder="e.g. 6.5"
                  />
                </div>
              </div>
              <div className="cp-frow">
                <div className="cp-field cp-field--full">
                  <label className="cp-label" htmlFor="additional_notes">Additional Notes</label>
                  <textarea
                    id="additional_notes"
                    name="additional_notes"
                    className="cp-input cp-textarea"
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    placeholder="Any additional clinical context, observations, or relevant history…"
                    rows={4}
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 6 — Upload */}
            <fieldset className="cp-fsec cp-fsec--last">
              <legend className="cp-fsec__legend">
                <span className="cp-fsec__num">6</span>
                <div>
                  <span className="cp-fsec__title">
                    {uploadType === 'fullSlide' ? 'Full Slide Image' : 'Cell Images'}
                  </span>
                  <span className="cp-fsec__sub">
                    {uploadType === 'fullSlide'
                      ? 'Upload a single whole-slide image file'
                      : 'Upload images organized by cell type'}
                  </span>
                </div>
              </legend>

              {uploadType === 'fullSlide' ? (
                <div className="cp-frow">
                  <div className="cp-field cp-field--full">
                    <label className="cp-label" htmlFor="full_slide_image">
                      Slide Image File <span className="cp-req" aria-hidden="true">*</span>
                    </label>
                    <label className="cp-file" htmlFor="full_slide_image">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>{fullSlideImage ? fullSlideImage.name : 'Click to select or drag and drop'}</span>
                      <span className="cp-file__hint">TIFF, NDPI, SVS, PNG, JPEG · max 4 GB</span>
                      <input
                        id="full_slide_image"
                        type="file"
                        accept=".tiff,.tif,.ndpi,.svs,.png,.jpg,.jpeg"
                        onChange={handleFullSlideImageChange}
                        className="cp-file__input"
                      />
                    </label>
                    {fullSlideImage && (
                      <p className="cp-file-selected">
                        Selected: <strong>{fullSlideImage.name}</strong> ({(fullSlideImage.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    )}
                    {errors.fullSlideImage && <span className="cp-error" role="alert">{errors.fullSlideImage}</span>}
                  </div>
                </div>
              ) : (
                <div>
                  {errors.cellTypeImages && <span className="cp-error" role="alert">{errors.cellTypeImages}</span>}
                  {cellTypeImages.map((ct, i) => (
                    <div key={i} className="cp-celltype">
                      <div className="cp-celltype__head">
                        <span className="cp-celltype__name">{ct.cellType}</span>
                        <span className="cp-celltype__count">{ct.images.length} image{ct.images.length !== 1 ? 's' : ''}</span>
                        <button
                          type="button"
                          className="cp-celltype__remove"
                          onClick={() => removeCellType(i)}
                          aria-label={`Remove ${ct.cellType}`}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="cp-add-images">
                        <label className="cp-add-images__btn" htmlFor={`cell-file-${i}`}>
                          + Add images
                          <input
                            id={`cell-file-${i}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleCellTypeImageChange(i, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                      {ct.images.length > 0 && (
                        <ul className="cp-image-list">
                          {ct.images.map((img, j) => (
                            <li key={j} className="cp-image-item">
                              <span className="cp-image-item__name">{img.name}</span>
                              <button
                                type="button"
                                className="cp-image-item__remove"
                                onClick={() => removeImage(i, j)}
                                aria-label={`Remove ${img.name}`}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <button type="button" className="cp-add-celltype-btn" onClick={addCustomCellType}>
                    + Add custom cell type
                  </button>
                </div>
              )}
            </fieldset>

            {/* Submit */}
            <div className="cp-submit-wrap">
              <button
                type="submit"
                className="cp-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="cp-submit-btn__spinner" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  'Submit Specimen'
                )}
              </button>
              <p className="cp-submit-note">
                Submissions are reviewed before being added to the public database. You will receive
                confirmation once your specimen has been processed.
              </p>
            </div>

          </form>
        </div>

        {/* ── Physical slide ── */}
        <div className="cp-physical">
          <div className="cp-physical__divider">
            <span>OR</span>
          </div>
          <div className="cp-physical__card">
            <span className="cp-physical__icon" aria-hidden="true">📬</span>
            <h3 className="cp-physical__title">Send Physical Slides</h3>
            <p className="cp-physical__sub">
              Unable to digitize specimens? Mail physical slides directly to the laboratory.
            </p>
            <address className="cp-address">
              <strong>UC Davis Blood Smear Database</strong><br />
              Attn: Dr. Melanie Audrey Ammersbach<br />
              School of Veterinary Medicine<br />
              One Shields Avenue<br />
              Davis, CA 95616, USA
            </address>
            <p className="cp-physical__note">
              Please include a completed specimen information sheet with each submission.
              Contact <a href="mailto:mammersbach@ucdavis.edu">mammersbach@ucdavis.edu</a> before mailing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContributePage;
