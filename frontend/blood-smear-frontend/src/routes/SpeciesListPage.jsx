import React, { useState, useEffect } from 'react';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import TaxonomySidebar from '../Component/TaxonomySidebar';
import SpecimenCard from '../Component/SpecimenCard';
import './SpeciesListPage.css';

const ITEMS_PER_PAGE = 12;

// ── Skeleton loader ────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="slp-skeleton" aria-hidden="true">
    <span className="slp-skeleton__accent" />
    <div className="slp-skeleton__body">
      <div className="slp-skeleton__line slp-skeleton__line--title" />
      <div className="slp-skeleton__line slp-skeleton__line--sub" />
      <div className="slp-skeleton__chips">
        <span className="slp-skeleton__chip" />
        <span className="slp-skeleton__chip" />
        <span className="slp-skeleton__chip" />
      </div>
      <div className="slp-skeleton__line slp-skeleton__line--body" />
      <div className="slp-skeleton__line slp-skeleton__line--body slp-skeleton__line--short" />
    </div>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear }) => (
  <div className="slp-empty">
    <svg className="slp-empty__icon" width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="17" stroke="#9caebf" strokeWidth="2" />
      <line x1="38.5" y1="38.5" x2="52" y2="52" stroke="#9caebf" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="26" x2="33" y2="26" stroke="#c8d5df" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
    <h3 className="slp-empty__title">No specimens found</h3>
    <p className="slp-empty__body">
      {hasFilters
        ? 'No records match your current filters. Try broadening your search or removing some criteria.'
        : 'No specimens are available at this time.'}
    </p>
    {hasFilters && (
      <button className="slp-empty__cta" onClick={onClear}>Clear all filters</button>
    )}
  </div>
);

// ── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + 4);
      if (start > 1) { pages.push(1); if (start > 2) pages.push('…'); }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) { if (end < totalPages - 1) pages.push('…'); pages.push(totalPages); }
    }
    return pages;
  };

  return (
    <nav className="slp-pag" aria-label="Pagination">
      <button
        className="slp-pag__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>
      <div className="slp-pag__nums">
        {getPages().map((pg, i) => (
          <button
            key={i}
            className={`slp-pag__num${pg === currentPage ? ' slp-pag__num--active' : ''}${pg === '…' ? ' slp-pag__num--dot' : ''}`}
            onClick={() => typeof pg === 'number' && onPageChange(pg)}
            disabled={pg === '…'}
            aria-current={pg === currentPage ? 'page' : undefined}
          >
            {pg}
          </button>
        ))}
      </div>
      <button
        className="slp-pag__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const SpeciesListPage = () => {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedGenus, setSelectedGenus] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mockSpecies = [
      { scientificName: "Passer domesticus", commonName: "House Sparrow", class: "Aves", order: "Passeriformes", family: "Passeridae", description: "A small bird found in urban areas worldwide. House sparrows are highly adaptable and have colonized nearly every corner of the globe." },
      { scientificName: "Canis lupus", commonName: "Gray Wolf", class: "Mammalia", order: "Carnivora", family: "Canidae", description: "A large carnivorous mammal native to wilderness areas. Gray wolves are apex predators and live in complex social structures called packs." },
      { scientificName: "Felis catus", commonName: "Domestic Cat", class: "Mammalia", order: "Carnivora", family: "Felidae", description: "A small domesticated carnivorous mammal. Cats have been associated with humans for at least 9,500 years." },
      { scientificName: "Tyto alba", commonName: "Barn Owl", class: "Aves", order: "Strigiformes", family: "Tytonidae", description: "A pale-colored owl found on every continent except Antarctica. Barn owls are known for their heart-shaped facial disk." },
      { scientificName: "Panthera leo", commonName: "Lion", class: "Mammalia", order: "Carnivora", family: "Felidae", description: "A large cat species native to Africa and India. Lions are the only cats that live in groups called prides." },
      { scientificName: "Aquila chrysaetos", commonName: "Golden Eagle", class: "Aves", order: "Accipitriformes", family: "Accipitridae", description: "A large bird of prey found across the Northern Hemisphere. Golden eagles are among the largest and most formidable raptors." },
      { scientificName: "Vulpes vulpes", commonName: "Red Fox", class: "Mammalia", order: "Carnivora", family: "Canidae", description: "The largest of the true foxes and most widespread carnivore in the world. Red foxes are highly adaptable to various environments." },
      { scientificName: "Corvus corax", commonName: "Common Raven", class: "Aves", order: "Passeriformes", family: "Corvidae", description: "One of the largest and most intelligent bird species. Ravens are known for their problem-solving abilities and complex vocalizations." },
      { scientificName: "Ursus arctos", commonName: "Brown Bear", class: "Mammalia", order: "Carnivora", family: "Ursidae", description: "A large bear species found across Eurasia and North America. Brown bears are omnivores with a varied diet." },
      { scientificName: "Falco peregrinus", commonName: "Peregrine Falcon", class: "Aves", order: "Falconiformes", family: "Falconidae", description: "The fastest animal on Earth when diving. Peregrine falcons can reach speeds over 240 mph during their hunting stoop." },
      { scientificName: "Equus ferus", commonName: "Domestic Horse", class: "Mammalia", order: "Perissodactyla", family: "Equidae", description: "A domesticated odd-toed ungulate. Horses have been companions and workers for humans for thousands of years." },
      { scientificName: "Bubo bubo", commonName: "Eurasian Eagle-Owl", class: "Aves", order: "Strigiformes", family: "Strigidae", description: "One of the largest species of owl. These powerful predators can take prey as large as foxes and young deer." }
    ];
    setTimeout(() => {
      setSpecies(mockSpecies);
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    filterSpecies();
    setCurrentPage(1);
  }, [species, searchQuery, selectedClass, selectedOrder, selectedFamily, selectedGenus, selectedSpecies]);

  const filterSpecies = () => {
    let filtered = species;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.commonName.toLowerCase().includes(query) ||
        s.scientificName.toLowerCase().includes(query) ||
        s.family.toLowerCase().includes(query) ||
        s.order.toLowerCase().includes(query) ||
        s.class.toLowerCase().includes(query)
      );
    }

    if (selectedClass !== 'all')   filtered = filtered.filter(s => s.class === selectedClass);
    if (selectedOrder !== 'all')   filtered = filtered.filter(s => s.order === selectedOrder);
    if (selectedFamily !== 'all')  filtered = filtered.filter(s => s.family === selectedFamily);
    if (selectedGenus !== 'all')   filtered = filtered.filter(s => s.scientificName.split(' ')[0] === selectedGenus);
    if (selectedSpecies !== 'all') filtered = filtered.filter(s => s.scientificName.split(' ')[1] === selectedSpecies);

    setFilteredSpecies(filtered);
  };

  const getUniqueClasses  = () => [...new Set(species.map(s => s.class))];
  const getUniqueOrders   = () => [...new Set(species.map(s => s.order))];
  const getUniqueFamilies = () => [...new Set(species.map(s => s.family))];
  const getUniqueGenera   = () => [...new Set(species.map(s => s.scientificName.split(' ')[0]))];
  const getUniqueSpecies  = () => [...new Set(species.map(s => s.scientificName.split(' ')[1]))];

  const countByClass   = (v) => species.filter(s => s.class === v).length;
  const countByOrder   = (v) => species.filter(s => s.order === v).length;
  const countByFamily  = (v) => species.filter(s => s.family === v).length;
  const countByGenus   = (v) => species.filter(s => s.scientificName.split(' ')[0] === v).length;
  const countBySpecies = (v) => species.filter(s => s.scientificName.split(' ')[1] === v).length;

  // Pagination
  const indexOfLastItem  = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentSpecies   = filteredSpecies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filteredSpecies.length / ITEMS_PER_PAGE);

  // Active filters
  const hasActiveFilters = !!(
    searchQuery || selectedClass !== 'all' || selectedOrder !== 'all' ||
    selectedFamily !== 'all' || selectedGenus !== 'all' || selectedSpecies !== 'all'
  );

  const activeFilters = [
    searchQuery       && { key: 'q',       label: `"${searchQuery}"`,             onRemove: () => setSearchQuery('') },
    selectedClass   !== 'all' && { key: 'cls',  label: `Class: ${selectedClass}`,   onRemove: () => { setSelectedClass('all'); setSelectedOrder('all'); setSelectedFamily('all'); } },
    selectedOrder   !== 'all' && { key: 'ord',  label: `Order: ${selectedOrder}`,   onRemove: () => setSelectedOrder('all') },
    selectedFamily  !== 'all' && { key: 'fam',  label: `Family: ${selectedFamily}`, onRemove: () => setSelectedFamily('all') },
    selectedGenus   !== 'all' && { key: 'gen',  label: `Genus: ${selectedGenus}`,   onRemove: () => setSelectedGenus('all') },
    selectedSpecies !== 'all' && { key: 'sp',   label: `Species: ${selectedSpecies}`, onRemove: () => setSelectedSpecies('all') },
  ].filter(Boolean);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedOrder('all');
    setSelectedFamily('all');
    setSelectedGenus('all');
    setSelectedSpecies('all');
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedOrder('all');
    setSelectedFamily('all');
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setSelectedFamily('all');
  };

  if (error) {
    return (
      <div className="slp-page">
        <UCDavisNavbar />
        <div className="slp-error-state">
          <h2>Unable to load specimens</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="slp-error-state__btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="slp-page">
      <UCDavisNavbar />

      {/* ── Hero / Search ───────────────────────────────────────────── */}
      <section className="slp-hero" aria-labelledby="slp-hero-heading">
        <div className="slp-hero__inner">
          <p className="slp-hero__eyebrow">UC Davis School of Veterinary Medicine</p>
          <h1 id="slp-hero-heading" className="slp-hero__title">
            Explore Blood Smear Specimens
          </h1>
          <p className="slp-hero__subtitle">
            Search and browse our curated archive of exotic and zoo animal hematology
            specimens. Filter by taxonomy, class, or specimen metadata.
          </p>

          <div className="slp-hero__search" role="search">
            <svg className="slp-hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="slp-hero__search-input"
              placeholder="Search by common name, scientific name, class, order, or family…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search specimens"
            />
            {searchQuery && (
              <button
                className="slp-hero__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Body Layout ─────────────────────────────────────────────── */}
      <div className="slp-body">

        {/* Mobile taxonomy toggle */}
        <button
          className="slp-mobile-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open taxonomy browser"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="3" cy="6" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="3" cy="18" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          Browse Taxonomy
        </button>

        <TaxonomySidebar
          species={species}
          selectedClass={selectedClass}
          selectedOrder={selectedOrder}
          onSelectClass={handleClassSelect}
          onSelectOrder={handleOrderSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="slp-main" id="main-content" aria-label="Specimen search and results">

          {/* ── Filter panel ── */}
          <section className="slp-filters" aria-label="Filter options">
            <div className="slp-filters__grid">
              <div className="slp-filters__group">
                <label htmlFor="f-class" className="slp-filters__label">Class</label>
                <select id="f-class" className="slp-filters__select" value={selectedClass} onChange={(e) => handleClassSelect(e.target.value)}>
                  <option value="all">All Classes</option>
                  {getUniqueClasses().map(v => (
                    <option key={v} value={v}>{v} ({countByClass(v)})</option>
                  ))}
                </select>
              </div>

              <div className="slp-filters__group">
                <label htmlFor="f-order" className="slp-filters__label">Order</label>
                <select id="f-order" className="slp-filters__select" value={selectedOrder} onChange={(e) => handleOrderSelect(e.target.value)}>
                  <option value="all">All Orders</option>
                  {getUniqueOrders().map(v => (
                    <option key={v} value={v}>{v} ({countByOrder(v)})</option>
                  ))}
                </select>
              </div>

              <div className="slp-filters__group">
                <label htmlFor="f-family" className="slp-filters__label">Family</label>
                <select id="f-family" className="slp-filters__select" value={selectedFamily} onChange={(e) => setSelectedFamily(e.target.value)}>
                  <option value="all">All Families</option>
                  {getUniqueFamilies().map(v => (
                    <option key={v} value={v}>{v} ({countByFamily(v)})</option>
                  ))}
                </select>
              </div>

              <div className="slp-filters__group">
                <label htmlFor="f-genus" className="slp-filters__label">Genus</label>
                <select id="f-genus" className="slp-filters__select" value={selectedGenus} onChange={(e) => setSelectedGenus(e.target.value)}>
                  <option value="all">All Genera</option>
                  {getUniqueGenera().map(v => (
                    <option key={v} value={v}>{v} ({countByGenus(v)})</option>
                  ))}
                </select>
              </div>

              <div className="slp-filters__group">
                <label htmlFor="f-species" className="slp-filters__label">Species Epithet</label>
                <select id="f-species" className="slp-filters__select" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
                  <option value="all">All Species</option>
                  {getUniqueSpecies().map(v => (
                    <option key={v} value={v}>{v} ({countBySpecies(v)})</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="slp-filters__footer">
                <button className="slp-filters__reset" onClick={clearAllFilters}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Reset all filters
                </button>
              </div>
            )}
          </section>

          {/* ── Active filter chips ── */}
          {activeFilters.length > 0 && (
            <div className="slp-chips" role="list" aria-label="Active filters">
              <span className="slp-chips__label">Active:</span>
              {activeFilters.map((f) => (
                <span key={f.key} className="slp-chip" role="listitem">
                  {f.label}
                  <button
                    className="slp-chip__remove"
                    onClick={f.onRemove}
                    aria-label={`Remove filter: ${f.label}`}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* ── Results header ── */}
          <div className="slp-results-bar" aria-live="polite" aria-atomic="true">
            <span className="slp-results-bar__count">
              {loading
                ? 'Loading specimens…'
                : filteredSpecies.length === 0
                  ? 'No specimens found'
                  : `Showing ${indexOfFirstItem + 1}–${Math.min(indexOfLastItem, filteredSpecies.length)} of ${filteredSpecies.length} specimen${filteredSpecies.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {/* ── Results ── */}
          <div className="slp-results" role="list">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : currentSpecies.length === 0
                ? <EmptyState hasFilters={hasActiveFilters} onClear={clearAllFilters} />
                : currentSpecies.map((item) => (
                    <div key={item.scientificName} role="listitem">
                      <SpecimenCard specimen={item} />
                    </div>
                  ))
            }
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(pg) => setCurrentPage(pg)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default SpeciesListPage;
