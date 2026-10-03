import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const filterOptions = [
    { value: 'all', labelKey: 'common.all', icon: null },
    { value: 'balcony', labelKey: 'gardens.balcony', icon: <RiBuilding4Line className="pill-icon" /> },
    { value: 'rooftop', labelKey: 'gardens.rooftop', icon: <RiBuilding2Line className="pill-icon" /> },
    { value: 'terrace', labelKey: 'gardens.terrace', icon: <RiHome4Line className="pill-icon" /> },
    { value: 'indoor', labelKey: 'gardens.indoor', icon: <TbPlant2 className="pill-icon" /> },
    { value: 'backyard', labelKey: 'gardens.backyard', icon: <RiTreeLine className="pill-icon" /> },
    { value: 'community', labelKey: 'gardens.community', icon: <RiTeamLine className="pill-icon" /> },
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
            placeholder={t('gardens.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => onSearchChange('')} aria-label={t('common.clear')}>
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
              <span>{t(option.labelKey)}</span>
            </button>
          ))}
        </div>
        <span className="result-count">{totalGardens} {t('gardens.gardensCount', { count: totalGardens })}</span>
      </div>
    </div>
  );
};

export default GardenFilters;