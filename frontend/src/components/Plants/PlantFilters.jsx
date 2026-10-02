import React from 'react';
import { RiSearchLine, RiCloseLine, RiCheckboxMultipleLine } from 'react-icons/ri';
import './PlantFilters.css';

const PlantFilters = ({
  searchTerm,
  onSearchChange,
  selectedGarden,
  onGardenChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  sortBy,
  onSortChange,
  gardens,
  selectMode,
  onSelectModeToggle,
  totalPlants,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'seedling', label: 'Seedling' },
    { value: 'growing', label: 'Growing' },
    { value: 'mature', label: 'Mature' },
    { value: 'harvested', label: 'Harvesting' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'health', label: 'Health Status' },
    { value: 'status', label: 'Growth Stage' },
  ];

  return (
    <div className="plant-filters">
      <div className="filters-top">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
          <input
            type="text"
            placeholder="Search plants by name or variety..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')} aria-label="Clear search">
              <RiCloseLine />
            </button>
          )}
        </div>
        <div className="filters-actions">
          <button 
            className={`select-mode-btn ${selectMode ? 'active' : ''}`}
            onClick={onSelectModeToggle}
          >
            {selectMode ? (
              <><RiCloseLine /> Cancel</>
            ) : (
              <><RiCheckboxMultipleLine /> Select</>
            )}
          </button>
        </div>
      </div>

      <div className="filters-bottom">
        <div className="filter-group">
          <select 
            value={selectedGarden} 
            onChange={(e) => onGardenChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Gardens</option>
            {gardens.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="result-count">{totalPlants} plants</span>
      </div>
    </div>
  );
};

export default PlantFilters;