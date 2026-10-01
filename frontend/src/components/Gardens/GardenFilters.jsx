import React from 'react';
import './GardenFilters.css';

const GardenFilters = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalGardens,
}) => {
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'balcony', label: '🏠 Balcony' },
    { value: 'rooftop', label: '🏢 Rooftop' },
    { value: 'terrace', label: '🏡 Terrace' },
    { value: 'indoor', label: '🪴 Indoor' },
    { value: 'backyard', label: '🌳 Backyard' },
    { value: 'community', label: '👥 Community' },
  ];

  return (
    <div className="garden-filters">
      <div className="filters-top">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search gardens by name or location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')}>
              ✕
            </button>
          )}
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            ▦
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="filters-bottom">
        <div className="filter-pills">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-pill ${filterType === option.value ? 'active' : ''}`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="result-count">{totalGardens} gardens</span>
      </div>
    </div>
  );
};

export default GardenFilters;