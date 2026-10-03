import React from 'react';
import { 
  RiApps2Line, 
  RiUser3Line,
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
  posts = [],
  user = null,
}) => {
  const getCount = (cat) => {
    if (!Array.isArray(posts)) return 0;
    if (cat === 'all') return posts.length;
    if (cat === 'my_posts') {
      const currentUserId = (user?._id || user?.id)?.toString();
      if (!currentUserId) return 0;
      return posts.filter(p => {
        const pUserId = (p.userId?._id || p.userId)?.toString();
        return pUserId === currentUserId;
      }).length;
    }
    return posts.filter(p => p.category === cat).length;
  };

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: <RiApps2Line /> },
    { value: 'my_posts', label: 'My Posts', icon: <RiUser3Line /> },
    { value: 'showcase', label: 'Harvests', icon: <RiShoppingBasketLine /> },
    { value: 'question', label: 'Plant Help', icon: <RiQuestionLine /> },
    { value: 'tip', label: 'Tips', icon: <RiLightbulbLine /> },
    { value: 'event', label: 'Events', icon: <RiCalendarEventLine /> },
    { value: 'general', label: 'General', icon: <RiChat3Line /> },
  ];

  // Get unique regions from posts
  const regions = Array.isArray(posts) 
    ? [...new Set(posts.map(p => p.userId?.location?.city).filter(Boolean))]
    : [];

  return (
    <div className="community-filters">
      <div className="filters-top">
        <div className="filter-tabs">
          {filterOptions.map((option) => {
            const count = getCount(option.value);
            return (
              <button
                key={option.value}
                className={`filter-tab ${filterType === option.value ? 'active' : ''}`}
                onClick={() => onFilterTypeChange(option.value)}
              >
                <span className="filter-tab-icon">{option.icon}</span>
                <span>{option.label}</span>
                <span className="filter-count-badge">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="search-bar">
          <span className="search-icon"><RiSearchLine /></span>
          <input
            type="text"
            placeholder="Search community posts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-bottom">
        {regions.length > 0 && (
          <div className="region-filter">
            <span className="region-label">
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
        <span className="post-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'} total</span>
      </div>
    </div>
  );
};

export default CommunityFilters;