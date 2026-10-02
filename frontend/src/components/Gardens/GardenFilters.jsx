import React from 'react';
import { 
  RiSearchLine, 
  RiCloseLine, 
  RiGridLine, 
  RiListUnordered,
  RiBuilding4Line,
  RiBuilding2Line,
  RiHome4Line,
  RiTreeLine,
  RiTeamLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
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
    { value: 'all', label: 'All', icon: null },
    { value: 'balcony', label: 'Balcony', icon: <RiBuilding4Line className="pill-icon" /> },
    { value: 'rooftop', label: 'Rooftop', icon: <RiBuilding2Line className="pill-icon" /> },
    { value: 'terrace', label: 'Terrace', icon: <RiHome4Line className="pill-icon" /> },
    { value: 'indoor', label: 'Indoor', icon: <TbPlant2 className="pill-icon" /> },
    { value: 'backyard', label: 'Backyard', icon: <RiTreeLine className="pill-icon" /> },
    { value: 'community', label: 'Community', icon: <RiTeamLine className="pill-icon" /> },
  ];

  return (
    <div className="garden-filters">
      <div className="filters-top">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
          <input
            type="text"
            placeholder="Search gardens by name or location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')} aria-label="Clear search">
              <RiCloseLine />
            </button>
          )}
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            aria-label="Grid View"
          >
            <RiGridLine />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
            aria-label="List View"
          >
            <RiListUnordered />
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
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <span className="result-count">{totalGardens} gardens</span>
      </div>
    </div>
  );
};

export default GardenFilters;