import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaSync,
  FaSearch,
  FaThLarge,
  FaList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLandmark,
  FaTimes,
  FaFilter,
  FaStore,
  FaArrowRight,
  FaCompass,
  FaChevronLeft,
  FaChevronRight,
  FaLeaf,
  FaAppleAlt,
  FaSeedling,
  FaGlobeAsia,
  FaLocationArrow
} from 'react-icons/fa';
import SEO from '../../components/SEO/SEO';
import { getMarketPrices } from '../../services/marketService';
import './MarketPricesPage.css';

// Haversine distance calculator in KM
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const MarketPricesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language && ['en', 'hi', 'gu'].includes(i18n.language) ? i18n.language : 'en';
  const L = t('marketPricesPage', { returnObjects: true }) || {};
  const API_TRANSLATIONS = L.apiTranslations || {
  };

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('');

  // Location detection state
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'prompt' | 'requesting' | 'granted' | 'denied'
  const [nearbyFirst, setNearbyFirst] = useState(true);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // View mode
  const [userOverriddenView, setUserOverriddenView] = useState(false);
  const [viewMode, setViewMode] = useState(() => (
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table'
  )); // 'table' (desktop default) | 'grid' (mobile default)

  const resultsTopRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!userOverriddenView && typeof window !== 'undefined') {
        setViewMode(window.innerWidth < 768 ? 'grid' : 'table');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userOverriddenView]);

  const fetchPricesData = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await getMarketPrices(forceRefresh);
      if (response && response.records) {
        setRecords(response.records);
        setLastUpdated(response.lastUpdated || new Date().toISOString());
        setDataSource(response.source || 'Data.gov.in (AGMARKNET)');
      }
    } catch (err) {
      console.error('Failed to load market prices:', err);
      setError(L.errorText);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPricesData(false);
  }, []);

  // Request user location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        setNearbyFirst(true);
        setCurrentPage(1);
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationStatus('idle');
    setNearbyFirst(false);
    setCurrentPage(1);
  };

  const getLocText = (type, key, currentLang) => {
    if (!key) return '';
    if (currentLang === 'en') return key;
    return API_TRANSLATIONS[type]?.[key]?.[currentLang] || key;
  };

  // Compute unique states and districts
  const availableStates = useMemo(() => {
    const statesSet = new Set();
    records.forEach((r) => {
      if (r.state) statesSet.add(r.state);
    });
    return Array.from(statesSet).sort();
  }, [records]);

  const availableDistricts = useMemo(() => {
    const districtsSet = new Set();
    records.forEach((r) => {
      if (selectedState === 'all' || r.state === selectedState) {
        if (r.district) districtsSet.add(r.district);
      }
    });
    return Array.from(districtsSet).sort();
  }, [records, selectedState]);

  // Filter, Distance calculation & Sorting
  const filteredAndSortedRecords = useMemo(() => {
    let result = records.map((rec) => {
      const distance = userLocation && rec.lat && rec.lng
        ? getDistanceKm(userLocation.lat, userLocation.lng, rec.lat, rec.lng)
        : null;
      return {
        ...rec,
        distance
      };
    });

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // 2. State Filter
    if (selectedState !== 'all') {
      result = result.filter((r) => r.state === selectedState);
    }

    // 3. District Filter
    if (selectedDistrict !== 'all') {
      result = result.filter((r) => r.district === selectedDistrict);
    }

    // 4. Search Filter (Commodity, Market, District, State)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const commEn = (r.commodity || '').toLowerCase();
        const commHi = (API_TRANSLATIONS.commodities[r.commodity]?.hi || '').toLowerCase();
        const commGu = (API_TRANSLATIONS.commodities[r.commodity]?.gu || '').toLowerCase();

        const mktEn = (r.market || '').toLowerCase();
        const mktHi = (API_TRANSLATIONS.markets[r.market]?.hi || '').toLowerCase();
        const mktGu = (API_TRANSLATIONS.markets[r.market]?.gu || '').toLowerCase();

        const stEn = (r.state || '').toLowerCase();
        const distEn = (r.district || '').toLowerCase();
        const varEn = (r.variety || '').toLowerCase();

        return (
          commEn.includes(q) ||
          commHi.includes(q) ||
          commGu.includes(q) ||
          mktEn.includes(q) ||
          mktHi.includes(q) ||
          mktGu.includes(q) ||
          stEn.includes(q) ||
          distEn.includes(q) ||
          varEn.includes(q)
        );
      });
    }

    // 5. Proximity / Nearby sorting
    if (userLocation && nearbyFirst) {
      result.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return 0;
      });
    }

    return result;
  }, [records, selectedCategory, selectedState, selectedDistrict, searchQuery, userLocation, nearbyFirst]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedState, selectedDistrict, searchQuery, userLocation, nearbyFirst]);

  // Pagination calculation
  const totalRecords = filteredAndSortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedRecords = useMemo(() => {
    return filteredAndSortedRecords.slice(startIndex, endIndex);
  }, [filteredAndSortedRecords, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (resultsTopRef.current) {
        resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (filteredAndSortedRecords.length === 0) {
      return { count: 0, avgModal: 0, minRate: 0, maxRate: 0 };
    }
    const count = filteredAndSortedRecords.length;
    const sumModal = filteredAndSortedRecords.reduce((acc, r) => acc + (r.modal_price || 0), 0);
    const minRate = Math.min(...filteredAndSortedRecords.map((r) => r.min_price || Infinity));
    const maxRate = Math.max(...filteredAndSortedRecords.map((r) => r.max_price || 0));

    return {
      count,
      avgModal: Math.round(sumModal / count),
      minRate: minRate === Infinity ? 0 : minRate,
      maxRate
    };
  }, [filteredAndSortedRecords]);

  // Page numbers for pagination with ellipsis
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="market-prices-page">
      <SEO
        title="Live AGMARKNET Mandi Market Prices - All India APMC Rates | UrbanFarm"
        description="Check real-time APMC mandi prices for crops, grains, vegetables, fruits, and flowers across India. Sourced directly from Data.gov.in."
      />

      {/* Hero Header Section */}
      <section className="market-hero">
        <div className="market-hero-container text-center">
          <div className="market-section-tag">
            <FaLandmark /> {L.heroTag}
          </div>
          
          <h1 className="market-hero-title">
            {L.heroTitle} <span className="market-gradient-text">{L.heroTitleGrad}</span>
          </h1>
          
          <p className="market-hero-subtitle">{L.heroSub}</p>

          {/* Live Data Source Badge & Refresh Bar */}
          <div className="market-source-bar">
            <span className="source-name">
              <FaCheckCircle className="source-ic" /> {L.dataSourceLabel}
            </span>
            {lastUpdated && (
              <span className="source-time">
                {L.lastUpdated} {new Date(lastUpdated).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              className="refresh-pill-btn"
              onClick={() => fetchPricesData(true)}
              disabled={loading || refreshing}
            >
              <FaSync className={refreshing ? 'spin-ic' : ''} />
              {refreshing ? L.refreshingBtn : L.refreshBtn}
            </button>
          </div>
        </div>
      </section>

      {/* Location Proximity Banner */}
      {!userLocation && !promptDismissed && (
        <section className="market-location-banner-wrap">
          <div className="market-container">
            <div className="market-location-banner">
              <div className="mlb-icon-box">
                <FaCompass className="compass-ic" />
              </div>
              <div className="mlb-text">
                <h3>{L.locationPromptTitle}</h3>
                <p>{L.locationPromptSub}</p>
              </div>
              <div className="mlb-actions">
                <button
                  className="location-btn location-btn-primary"
                  onClick={handleDetectLocation}
                  disabled={locationStatus === 'requesting'}
                >
                  <FaLocationArrow />
                  {locationStatus === 'requesting' ? L.detectingLocation : L.detectLocationBtn}
                </button>
                <button
                  className="location-btn location-btn-secondary"
                  onClick={() => setPromptDismissed(true)}
                >
                  {L.showAllIndiaBtn}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Section */}
      <section className="market-content-section" ref={resultsTopRef}>
        <div className="market-container">
          
          {/* Controls Card */}
          <div className="market-controls-card">
            
            {/* Category Tabs Bar */}
            <div className="category-tabs-bar">
              <button
                className={`cat-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <FaGlobeAsia /> {L.allCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'crops' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('crops')}
              >
                <FaSeedling /> {L.cropsCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'vegetables' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('vegetables')}
              >
                <FaLeaf /> {L.vegCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'fruits' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('fruits')}
              >
                <FaAppleAlt /> {L.fruitsCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'flowers' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('flowers')}
              >
                🌸 {L.flowersCat}
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="filter-controls-row">
              {/* Search Bar */}
              <div className="search-input-box">
                <FaSearch className="search-ic" />
                <input
                  type="text"
                  placeholder={L.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search Mandi Prices"
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* State Dropdown */}
              <div className="select-box-wrap">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('all');
                  }}
                >
                  <option value="all">{L.allStates}</option>
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {getLocText('states', st, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="select-box-wrap">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={availableDistricts.length === 0}
                >
                  <option value="all">{L.allDistricts}</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {getLocText('districts', dist, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Quick Toggle Button */}
              <button
                className={`location-pill-btn ${userLocation ? 'active' : ''}`}
                onClick={userLocation ? handleClearLocation : handleDetectLocation}
                title={userLocation ? L.showAllIndiaBtn : L.detectLocationBtn}
              >
                <FaMapMarkerAlt />
                <span>{userLocation ? L.locationDetected : L.detectLocationBtn}</span>
                {userLocation && <FaTimes className="clear-loc-ic" />}
              </button>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('grid');
                    setUserOverriddenView(true);
                  }}
                  title={L.cardView}
                  aria-label={L.cardView}
                >
                  <FaThLarge />
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('table');
                    setUserOverriddenView(true);
                  }}
                  title={L.tableView}
                  aria-label={L.tableView}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {/* Location Active Status Notification */}
          {userLocation && (
            <div className="market-location-status-badge">
              <span className="loc-status-text">
                <FaCheckCircle className="check-ic" /> {L.locationDetected} — {L.heroTag}
              </span>
              <button className="loc-reset-link" onClick={handleClearLocation}>
                {L.showAllIndiaBtn}
              </button>
            </div>
          )}

          {/* Stats Metric Cards Bar */}
          <div className="market-metrics-bar">
            <div className="market-metric-card">
              <span className="mm-label">{L.statTotal}</span>
              <strong className="mm-val">{stats.count}</strong>
            </div>
            <div className="market-metric-card">
              <span className="mm-label">{L.statAvgModal}</span>
              <strong className="mm-val accent">₹{stats.avgModal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="market-metric-card">
              <span className="mm-label">{L.statLowest}</span>
              <strong className="mm-val healthy">₹{stats.minRate.toLocaleString('en-IN')}</strong>
            </div>
            <div className="market-metric-card">
              <span className="mm-label">{L.statHighest}</span>
              <strong className="mm-val">₹{stats.maxRate.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="market-status-box">
              <div className="spinner-loader" />
              <p>{L.loadingText}</p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="market-status-box error">
              <FaExclamationTriangle className="status-err-ic" />
              <p>{error}</p>
              <button
                className="guest-btn guest-btn-primary"
                onClick={() => fetchPricesData(true)}
              >
                <FaSync /> {L.refreshBtn}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAndSortedRecords.length === 0 && (
            <div className="market-empty-card">
              <div className="empty-ic-box">
                <FaStore />
              </div>
              <h3>{L.noDataTitle}</h3>
              <p>{L.noDataSub}</p>
              <button
                className="guest-btn guest-btn-outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedState('all');
                  setSelectedDistrict('all');
                  setSearchQuery('');
                  handleClearLocation();
                }}
              >
                {L.clearFilters}
              </button>
            </div>
          )}

          {/* Data Presentation: Card Grid View */}
          {!loading && !error && filteredAndSortedRecords.length > 0 && viewMode === 'grid' && (
            <div className="market-cards-grid">
              {paginatedRecords.map((r) => {
                const commName = getLocText('commodities', r.commodity, lang);
                const stName = getLocText('states', r.state, lang);
                const distName = getLocText('districts', r.district, lang);
                const mktName = getLocText('markets', r.market, lang);
                const varName = getLocText('varieties', r.variety, lang);
                const unitName = API_TRANSLATIONS.units[r.unit]?.[lang] || r.unit;
                const isNearby = r.distance !== null && r.distance <= 160;

                return (
                  <div key={r.id} className={`mandi-price-card ${isNearby ? 'nearby-card' : ''}`}>
                    <div className="mandi-card-top">
                      <span className={`mandi-cat-tag ${r.category}`}>
                        {r.category === 'crops' ? L.cropsCat : r.category === 'vegetables' ? L.vegCat : r.category === 'fruits' ? L.fruitsCat : L.flowersCat}
                      </span>
                      {isNearby ? (
                        <span className="nearby-tag">
                          <FaLocationArrow /> {L.nearYouBadge} {r.distance ? `(${r.distance} ${L.distanceKm})` : ''}
                        </span>
                      ) : (
                        <span className="arrival-date">
                          <FaCalendarAlt /> {r.arrival_date}
                        </span>
                      )}
                    </div>

                    <h3 className="commodity-name">{commName}</h3>
                    <div className="variety-info">
                      <span>{L.varietyLabel}</span> <strong>{varName || r.variety}</strong>
                    </div>

                    <div className="location-row">
                      <FaMapMarkerAlt className="loc-ic" />
                      <span>
                        <strong>{mktName}</strong> • {distName}, {stName}
                      </span>
                    </div>

                    {/* Price Matrix */}
                    <div className="price-matrix-grid">
                      <div className="price-box">
                        <span className="pbox-lbl">{L.minPrice}</span>
                        <span className="pbox-val">₹{r.min_price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="price-box modal-box">
                        <span className="pbox-lbl">{L.modalPrice}</span>
                        <span className="pbox-val modal-val">₹{r.modal_price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="price-box">
                        <span className="pbox-lbl">{L.maxPrice}</span>
                        <span className="pbox-val">₹{r.max_price?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="card-unit-footer">
                      <span>{L.unitLabel}: <strong>{unitName}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Data Presentation: Table View */}
          {!loading && !error && filteredAndSortedRecords.length > 0 && viewMode === 'table' && (
            <div className="mandi-table-wrapper">
              <table className="mandi-table">
                <thead>
                  <tr>
                    <th>{L.commodity}</th>
                    <th>{L.category}</th>
                    <th>{L.marketLabel}</th>
                    <th>{L.location}</th>
                    <th>{L.minPrice}</th>
                    <th className="modal-th">{L.modalPrice}</th>
                    <th>{L.maxPrice}</th>
                    <th>{L.dateLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((r) => {
                    const commName = getLocText('commodities', r.commodity, lang);
                    const stName = getLocText('states', r.state, lang);
                    const distName = getLocText('districts', r.district, lang);
                    const mktName = getLocText('markets', r.market, lang);
                    const varName = getLocText('varieties', r.variety, lang);
                    const isNearby = r.distance !== null && r.distance <= 160;

                    return (
                      <tr key={r.id} className={isNearby ? 'nearby-row' : ''}>
                        <td>
                          <div className="tbl-comm-block">
                            <strong>{commName}</strong>
                            <span className="tbl-variety">{varName || r.variety}</span>
                            {isNearby && (
                              <span className="tbl-nearby-badge">
                                <FaLocationArrow /> {L.nearYouBadge} {r.distance ? `(${r.distance} ${L.distanceKm})` : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`mandi-cat-tag ${r.category}`}>
                            {r.category === 'crops' ? L.cropsCat : r.category === 'vegetables' ? L.vegCat : r.category === 'fruits' ? L.fruitsCat : L.flowersCat}
                          </span>
                        </td>
                        <td>
                          <div className="tbl-market">
                            <FaStore className="tbl-ic" />
                            <span>{mktName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="tbl-loc">{distName}, {stName}</span>
                        </td>
                        <td className="rate-td">₹{r.min_price?.toLocaleString('en-IN')}</td>
                        <td className="rate-td modal-td">₹{r.modal_price?.toLocaleString('en-IN')}</td>
                        <td className="rate-td">₹{r.max_price?.toLocaleString('en-IN')}</td>
                        <td className="date-td">{r.arrival_date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls Bar */}
          {!loading && !error && filteredAndSortedRecords.length > 0 && (
            <div className="market-pagination-bar">
              <div className="pagination-info">
                <span>
                  {L.showing} <strong>{startIndex + 1}</strong> {L.to} <strong>{endIndex}</strong> {L.of} <strong>{totalRecords}</strong> {L.records}
                </span>
                <div className="per-page-select-wrap">
                  <label htmlFor="perPageSelect">{L.perPage}:</label>
                  <select
                    id="perPageSelect"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="pagination-nav">
                  <button
                    className="page-btn page-nav-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <FaChevronLeft /> {L.prevPage}
                  </button>

                  <div className="page-numbers">
                    {pageNumbers.map((p, pIdx) => {
                      if (p === '...') {
                        return <span key={`dots-${pIdx}`} className="page-dots">...</span>;
                      }
                      return (
                        <button
                          key={p}
                          className={`page-btn page-num-btn ${currentPage === p ? 'active' : ''}`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="page-btn page-nav-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    {L.nextPage} <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Card */}
          <div className="market-disclaimer-card">
            <div className="disclaimer-content">
              <div className="disclaimer-badge">
                <FaLandmark /> {L.disclaimerTitle}
              </div>
              <p>{L.disclaimerNotice}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Above Footer Impact CTA Banner */}
      <section className="about-impact-banner">
        <div className="landing-container text-center">
          <h2>{t('about.impactBannerTitle')}</h2>
          <p>{t('about.impactBannerSubtitle')}</p>
          <div className="about-cta-group">
            <Link to="/register" className="landing-btn landing-btn-primary">
              {t('about.joinToday')} <FaArrowRight />
            </Link>
            <Link to="/contact" className="landing-btn landing-btn-secondary">
              {t('about.getInTouch')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketPricesPage;
