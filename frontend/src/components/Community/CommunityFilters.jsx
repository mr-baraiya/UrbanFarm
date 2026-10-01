import React from 'react';
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
    { value: 'all', label: '🔥 All Posts' },
    { value: 'showcase', label: '🍅 Harvests' },
    { value: 'question', label: '🆘 Plant Help' },
    { value: 'tip', label: '💡 Tips' },
    { value: 'event', label: '📅 Events' },
    { value: 'general', label: '💬 General' },
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
              {option.label}
            </button>
          ))}
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
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
            <span className="region-label">📍 Filter by Region:</span>
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