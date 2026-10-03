import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiSearchLine, RiCloseLine, RiCheckboxMultipleLine } from 'react-icons/ri';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
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
  const { t, i18n } = useTranslation();

  const statusOptions = [
    { value: 'all', label: t('plants.allStatuses', 'All Statuses') },
    { value: 'seedling', label: t('plants.seedling', 'Seedling') },
    { value: 'growing', label: t('plants.statusGrowing', 'Growing') },
    { value: 'mature', label: t('plants.statusMature', 'Mature') },
    { value: 'harvested', label: t('plants.harvested', 'Harvesting') },
  ];

  const sortOptions = [
    { value: 'recent', label: t('plants.recentlyAdded', 'Recently Added') },
    { value: 'name', label: t('plants.sortName', 'Name (A-Z)') },
    { value: 'health', label: t('plants.sortHealth', 'Health Status') },
    { value: 'status', label: t('plants.sortStage', 'Growth Stage') },
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
            placeholder={t('plants.searchPlaceholder', 'Search plants by name or variety...')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')} aria-label={t('common.clear', 'Clear search')}>
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
              <><RiCloseLine /> {t('common.cancel', 'Cancel')}</>
            ) : (
              <><RiCheckboxMultipleLine /> {t('common.select', 'Select')}</>
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
            <option value="">{t('plants.allGardens', 'All Gardens')}</option>
            {gardens.map(g => (
              <option key={g._id} value={g._id}>
                {getLocalizedDynamicText(g.name, i18n.language)}
              </option>
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
        <span className="result-count">
          {t('plants.plantsCount', '{{count}} plants', { count: totalPlants })}
        </span>
      </div>
    </div>
  );
};

export default PlantFilters;