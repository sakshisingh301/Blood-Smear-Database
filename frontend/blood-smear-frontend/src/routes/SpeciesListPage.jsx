import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import TaxonomySidebar from '../Component/TaxonomySidebar';
import SpecimenCard from '../Component/SpecimenCard';
import './SpeciesListPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
  const [searchParams] = useSearchParams();

  // Results state (paginated, filtered)
  const [results, setResults]           = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Sidebar state (all unfiltered specimens, fetched once)
  const [allSpecies, setAllSpecies] = useState([]);

  // Filter state
  const [searchQuery, setSearchQuery]       = useState(() => searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') || '');
  const [selectedClass, setSelectedClass]   = useState('all');
  const [selectedOrder, setSelectedOrder]   = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedGenus, setSelectedGenus]   = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  // Debounce search input (400 ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedClass, selectedOrder, selectedFamily, selectedGenus, selectedSpecies]);

  // Fetch sidebar taxonomy once on mount (unfiltered, high limit)
  useEffect(() => {
    fetch(`${API_BASE}/api/species/browse?limit=100`)
      .then(r => r.json())
      .then(json => { if (json.success) setAllSpecies(json.data || []); })
      .catch(() => {}); // non-critical — sidebar degrades gracefully
  }, []);

  // Fetch filtered + paginated results
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: ITEMS_PER_PAGE });
      if (debouncedQuery)           params.set('q',      debouncedQuery);
      if (selectedClass  !== 'all') params.set('class',  selectedClass);
      if (selectedOrder  !== 'all') params.set('order',  selectedOrder);
      if (selectedFamily !== 'all') params.set('family', selectedFamily);
      if (selectedGenus  !== 'all') params.set('genus',  selectedGenus);
      if (selectedSpecies !== 'all') params.set('species', selectedSpecies);

      const res  = await fetch(`${API_BASE}/api/species/browse?${params}`);
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load specimens');

      setResults(json.data || []);
      setTotalResults(json.pagination?.total  ?? 0);
      setTotalPages(json.pagination?.pages ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedClass, selectedOrder, selectedFamily, selectedGenus, selectedSpecies, currentPage]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  // ── Derive filter dropdown options from allSpecies (unfiltered totals) ──
  const getUniqueClasses  = () => [...new Set(allSpecies.map(s => s.class).filter(Boolean))];
  const getUniqueOrders   = () => [...new Set(allSpecies.map(s => s.order).filter(Boolean))];
  const getUniqueFamilies = () => [...new Set(allSpecies.map(s => s.family).filter(Boolean))];
  const getUniqueGenera   = () => [...new Set(allSpecies.map(s => s.genus).filter(Boolean))];
  const getUniqueSpecies  = () => [...new Set(allSpecies.map(s => s.speciesEpithet).filter(Boolean))];

  const countByClass   = (v) => allSpecies.filter(s => s.class === v).length;
  const countByOrder   = (v) => allSpecies.filter(s => s.order === v).length;
  const countByFamily  = (v) => allSpecies.filter(s => s.family === v).length;
  const countByGenus   = (v) => allSpecies.filter(s => s.genus === v).length;
  const countBySpecies = (v) => allSpecies.filter(s => s.speciesEpithet === v).length;

  // Active filters
  const hasActiveFilters = !!(
    searchQuery || selectedClass !== 'all' || selectedOrder !== 'all' ||
    selectedFamily !== 'all' || selectedGenus !== 'all' || selectedSpecies !== 'all'
  );

  const activeFilters = [
    searchQuery         && { key: 'q',   label: `"${searchQuery}"`,              onRemove: () => setSearchQuery('') },
    selectedClass  !== 'all' && { key: 'cls', label: `Class: ${selectedClass}`,   onRemove: () => { setSelectedClass('all'); setSelectedOrder('all'); setSelectedFamily('all'); } },
    selectedOrder  !== 'all' && { key: 'ord', label: `Order: ${selectedOrder}`,   onRemove: () => setSelectedOrder('all') },
    selectedFamily !== 'all' && { key: 'fam', label: `Family: ${selectedFamily}`, onRemove: () => setSelectedFamily('all') },
    selectedGenus  !== 'all' && { key: 'gen', label: `Genus: ${selectedGenus}`,   onRemove: () => setSelectedGenus('all') },
    selectedSpecies !== 'all' && { key: 'sp', label: `Species: ${selectedSpecies}`, onRemove: () => setSelectedSpecies('all') },
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

  // ── Index labels (server-side pagination) ──
  const indexOfFirstItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const indexOfLastItem  = Math.min(currentPage * ITEMS_PER_PAGE, totalResults);

  if (error) {
    return (
      <div className="slp-page">
        <UCDavisNavbar />
        <div className="slp-error-state">
          <h2>Unable to load specimens</h2>
          <p>{error}</p>
          <button onClick={fetchResults} className="slp-error-state__btn">
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
          species={allSpecies}
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
                : totalResults === 0
                  ? 'No specimens found'
                  : `Showing ${indexOfFirstItem}–${indexOfLastItem} of ${totalResults} specimen${totalResults !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {/* ── Results ── */}
          <div className="slp-results" role="list">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : results.length === 0
                ? <EmptyState hasFilters={hasActiveFilters} onClear={clearAllFilters} />
                : results.map((item) => (
                    <div key={item.jobId} role="listitem">
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
