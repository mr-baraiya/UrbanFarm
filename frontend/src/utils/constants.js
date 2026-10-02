export const PLANT_STATUSES = [
  { value: 'seedling', label: 'Seedling' },
  { value: 'growing', label: 'Growing' },
  { value: 'mature', label: 'Mature' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'dead', label: 'Dead' },
];

export const TASK_TYPES = [
  { value: 'watering', label: 'Watering' },
  { value: 'fertilizing', label: 'Fertilizing' },
  { value: 'planting', label: 'Planting' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'pest_check', label: 'Pest Check' },
  { value: 'other', label: 'Other' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const SUNLIGHT_OPTIONS = [
  { value: 'full', label: 'Full Sun' },
  { value: 'partial', label: 'Partial Sun' },
  { value: 'shade', label: 'Shade' },
];

export const GARDENING_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const URBAN_SPACE_TYPES = [
  { value: 'balcony', label: 'Balcony' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'indoor', label: 'Indoor Window Sill' },
  { value: 'backyard', label: 'Backyard' },
  { value: 'community', label: 'Community Garden' },
  { value: 'windowsill', label: 'Window Sill' },
];

export const CLIMATE_ZONES = [
  { value: 'tropical', label: 'Tropical (Zone 10-11)' },
  { value: 'subtropical', label: 'Subtropical (Zone 9-10)' },
  { value: 'temperate', label: 'Temperate (Zone 7-8)' },
  { value: 'mediterranean', label: 'Mediterranean (Zone 9)' },
  { value: 'continental', label: 'Continental (Zone 5-6)' },
  { value: 'arctic', label: 'Arctic (Zone 1-4)' },
];

export const ALL_BADGES = [
  {
    id: 'first_sprout',
    name: 'First Sprout',
    description: 'Added your first plant',
    requirement: 'Add your first plant to any garden',
  },
  {
    id: 'hydration_master',
    name: 'Hydration Master',
    description: 'Completed 10 watering sessions',
    requirement: 'Complete 10 watering sessions',
  },
  {
    id: 'plant_doctor',
    name: 'Plant Doctor',
    description: 'Ran your first disease diagnosis',
    requirement: 'Run your first disease diagnosis',
  },
  {
    id: 'first_harvest',
    name: 'First Harvest',
    description: 'Marked a crop as harvested',
    requirement: 'Harvest your first crop',
  },
  {
    id: 'green_thumb',
    name: 'Green Thumb',
    description: 'Grew 5+ plants successfully',
    requirement: 'Grow 5+ plants',
  },
  {
    id: 'community_gardener',
    name: 'Community Gardener',
    description: 'Shared 5 posts in the community',
    requirement: 'Share 5 community posts',
  },
  {
    id: 'gardening_guru',
    name: 'Gardening Guru',
    description: 'Reached Master Gardener level',
    requirement: 'Earn 100+ gardening points',
  },
  {
    id: 'weather_watcher',
    name: 'Weather Watcher',
    description: 'Used weather features 10 times',
    requirement: 'Check weather 10 times',
  },
];