import React, { useState, useEffect } from 'react';
import './TaxonomySidebar.css';

const CLASS_META = {
  Aves:           { label: 'Birds',      scientific: 'Aves',           icon: '🐦', color: '#1a6b3c' },
  Mammalia:       { label: 'Mammals',    scientific: 'Mammalia',       icon: '🦁', color: '#7b3514' },
  Reptilia:       { label: 'Reptiles',   scientific: 'Reptilia',       icon: '🦎', color: '#4a6120' },
  Amphibia:       { label: 'Amphibians', scientific: 'Amphibia',       icon: '🐸', color: '#1a5a6b' },
  Actinopterygii: { label: 'Fishes',     scientific: 'Actinopterygii', icon: '🐟', color: '#1a3a7b' },
};

const PREFERRED_ORDER = ['Aves', 'Mammalia', 'Reptilia', 'Amphibia', 'Actinopterygii'];

const TaxonomySidebar = ({
  species = [],
  selectedClass,
  selectedOrder,
  onSelectClass,
  onSelectOrder,
  isOpen,
  onClose,
}) => {
  const allClasses = [...new Set(species.map(s => s.class))];
  const orderedClasses = [
    ...PREFERRED_ORDER.filter(c => allClasses.includes(c)),
    ...allClasses.filter(c => !PREFERRED_ORDER.includes(c)),
  ];

  const [expandedClasses, setExpandedClasses] = useState(() =>
    new Set(orderedClasses.slice(0, 2))
  );

  useEffect(() => {
    if (selectedClass && selectedClass !== 'all') {
      setExpandedClasses(prev => new Set([...prev, selectedClass]));
    }
  }, [selectedClass]);

  const toggleExpand = (cls) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  const handleClassClick = (cls) => {
    if (selectedClass === cls) {
      onSelectClass('all');
    } else {
      onSelectClass(cls);
      setExpandedClasses(prev => new Set([...prev, cls]));
    }
  };

  const handleOrderClick = (cls, order) => {
    if (selectedClass === cls && selectedOrder === order) {
      onSelectOrder('all');
    } else {
      onSelectClass(cls);
      onSelectOrder(order);
    }
  };

  const getOrdersForClass = (cls) =>
    [...new Set(species.filter(s => s.class === cls).map(s => s.order))].sort();

  const countForClass = (cls) => species.filter(s => s.class === cls).length;
  const countForOrder = (order) => species.filter(s => s.order === order).length;

  const totalSpecies  = species.length;
  const totalClasses  = orderedClasses.length;
  const totalOrders   = new Set(species.map(s => s.order)).size;
  const totalFamilies = new Set(species.map(s => s.family)).size;

  return (
    <>
      {isOpen && <div className="tsb-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`tsb-sidebar${isOpen ? ' tsb-sidebar--open' : ''}`} aria-label="Taxonomy navigation">
        <div className="tsb-header">
          <h2 className="tsb-header__title">Taxonomy Explorer</h2>
          <button className="tsb-header__close" onClick={onClose} aria-label="Close taxonomy panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="tsb-section">
          <button
            className={`tsb-all-btn${selectedClass === 'all' ? ' tsb-all-btn--active' : ''}`}
            onClick={() => onSelectClass('all')}
          >
            <span className="tsb-all-btn__icon" aria-hidden="true">◎</span>
            <span className="tsb-all-btn__label">All Specimens</span>
            <span className="tsb-count">{totalSpecies}</span>
          </button>
        </div>

        <nav className="tsb-section tsb-nav" aria-label="Browse by class">
          <p className="tsb-nav__heading">Browse by Class</p>

          {orderedClasses.map(cls => {
            const meta = CLASS_META[cls] || { label: cls, scientific: cls, icon: '○', color: '#022851' };
            const orders = getOrdersForClass(cls);
            const isExpanded = expandedClasses.has(cls);
            const isClassActive = selectedClass === cls;

            return (
              <div key={cls} className="tsb-group">
                <div className="tsb-group__row">
                  <button
                    className={`tsb-class-btn${isClassActive ? ' tsb-class-btn--active' : ''}`}
                    onClick={() => handleClassClick(cls)}
                    style={{ '--cls-color': meta.color }}
                    aria-pressed={isClassActive}
                  >
                    <span className="tsb-class-btn__icon" aria-hidden="true">{meta.icon}</span>
                    <span className="tsb-class-btn__text">
                      <span className="tsb-class-btn__label">{meta.label}</span>
                      <span className="tsb-class-btn__sci">({meta.scientific})</span>
                    </span>
                    <span className="tsb-count">{countForClass(cls)}</span>
                  </button>

                  {orders.length > 0 && (
                    <button
                      className={`tsb-expand-btn${isExpanded ? ' tsb-expand-btn--open' : ''}`}
                      onClick={() => toggleExpand(cls)}
                      aria-label={isExpanded ? `Collapse ${meta.label}` : `Expand ${meta.label}`}
                      aria-expanded={isExpanded}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {isExpanded && orders.length > 0 && (
                  <ul className="tsb-orders" role="list">
                    {orders.map(order => {
                      const isOrderActive = isClassActive && selectedOrder === order;
                      return (
                        <li key={order} role="listitem">
                          <button
                            className={`tsb-order-btn${isOrderActive ? ' tsb-order-btn--active' : ''}`}
                            onClick={() => handleOrderClick(cls, order)}
                            aria-pressed={isOrderActive}
                          >
                            <span className="tsb-order-btn__name">{order}</span>
                            <span className="tsb-count tsb-count--sm">{countForOrder(order)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="tsb-section tsb-stats">
          <p className="tsb-stats__heading">Collection Summary</p>
          <div className="tsb-stats__grid">
            <div className="tsb-stat">
              <span className="tsb-stat__num">{totalSpecies}</span>
              <span className="tsb-stat__label">Species</span>
            </div>
            <div className="tsb-stat">
              <span className="tsb-stat__num">{totalClasses}</span>
              <span className="tsb-stat__label">Classes</span>
            </div>
            <div className="tsb-stat">
              <span className="tsb-stat__num">{totalOrders}</span>
              <span className="tsb-stat__label">Orders</span>
            </div>
            <div className="tsb-stat">
              <span className="tsb-stat__num">{totalFamilies}</span>
              <span className="tsb-stat__label">Families</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TaxonomySidebar;
