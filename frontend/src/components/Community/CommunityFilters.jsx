import React from 'react';
import { 
  RiApps2Line, 
  RiShoppingBasketLine, 
  RiQuestionLine, 
  RiLightbulbLine, 
  RiCalendarEventLine, 
  RiChat3Line, 
  RiSearchLine, 
  RiMapPinLine 
} from 'react-icons/ri';
import './CommunityFilters.css';

const CommunityFilters = ({
  filterType,
  onFilterTypeChange,
  filterRegion,
  onFilterRegionChange,
  searchTerm,
  onSearchChange,
  posts,
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: <RiApps2Line /> },
    { value: 'showcase', label: 'Harvests', icon: <RiShoppingBasketLine /> },
    { value: 'question', label: 'Plant Help', icon: <RiQuestionLine /> },
    { value: 'tip', label: 'Tips', icon: <RiLightbulbLine /> },
    { value: 'event', label: 'Events', icon: <RiCalendarEventLine /> },
    { value: 'general', label: 'General', icon: <RiChat3Line /> },
  ];

  // Get unique regions from posts
  const regions = [...new Set(posts.map(p => p.userId?.location?.city).filter(Boolean))];

  return (
    <div className="community-filters">
      <div className="filters-top">
        <div className="filter-tabs">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-tab ${filterType === option.value ? 'active' : ''}`}
              onClick={() => onFilterTypeChange(option.value)}
            >
              <span className="filter-tab-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <div className="search-bar">
          <span className="search-icon"><RiSearchLine /></span>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-bottom">
        {regions.length > 0 && (
          <div className="region-filter">
            <span className="region-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiMapPinLine /> Filter by Region:
            </span>
            <select 
              value={filterRegion} 
              onChange={(e) => onFilterRegionChange(e.target.value)}
              className="region-select"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        )}
        <span className="post-count">{posts.length} posts</span>
      </div>
    </div>
  );
};

export default CommunityFilters;