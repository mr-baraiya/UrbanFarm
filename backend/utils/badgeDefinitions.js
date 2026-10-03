/**
 * UrbanFarm Badge Definitions
 * Synchronized with frontend criteria and icons.
 */

const BADGES = [
  {
    id: 'first_sprout',
    rank: 7,
    name: 'First Sprout',
    tier: 'Bronze Milestone',
    themeColor: '#2d6a4f',
    description: 'Planted and registered your first seed or seedling into UrbanFarm.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056828/urbanfarm_badges/first_sprout.png',
    svgFilename: 'first_sprout.svg',
    check: (s) => (s.totalPlants || 0) >= 1,
  },
  {
    id: 'hydration_master',
    rank: 4,
    name: 'Hydration Master',
    tier: 'Water Master',
    themeColor: '#0284c7',
    description: 'Completed 10 regular watering sessions to keep plants thriving.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056830/urbanfarm_badges/hydration_master.png',
    svgFilename: 'hydration_master.svg',
    check: (s) => (s.totalWateringEvents || 0) >= 10,
  },
  {
    id: 'plant_doctor',
    rank: 5,
    name: 'Plant Doctor',
    tier: 'Plant Health Specialist',
    themeColor: '#7c3aed',
    description: 'Diagnosed plant diseases and health conditions with the AI scanner.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056832/urbanfarm_badges/plant_doctor.png',
    svgFilename: 'plant_doctor.svg',
    check: (s) => (s.totalDiagnoses || 0) >= 1,
  },
  {
    id: 'first_harvest',
    rank: 6,
    name: 'First Harvest',
    tier: 'Harvest Glory',
    themeColor: '#ea580c',
    description: 'Reaped the fresh fruits of your urban garden labour.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056833/urbanfarm_badges/first_harvest.png',
    svgFilename: 'first_harvest.svg',
    check: (s) => (s.totalHarvests || 0) >= 1,
  },
  {
    id: 'green_thumb',
    rank: 2,
    name: 'Green Thumb',
    tier: 'Emerald Mastery',
    themeColor: '#059669',
    description: 'Cultivated 5 or more active healthy urban plants simultaneously.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056836/urbanfarm_badges/green_thumb.png',
    svgFilename: 'green_thumb.svg',
    check: (s) => (s.totalPlants || 0) >= 5,
  },
  {
    id: 'community_gardener',
    rank: 3,
    name: 'Community Gardener',
    tier: 'Community Champion',
    themeColor: '#4f46e5',
    description: 'Shared knowledge, tips, and achievements with other city growers.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056838/urbanfarm_badges/community_gardener.png',
    svgFilename: 'community_gardener.svg',
    check: (s) => (s.totalCommunityPosts || 0) >= 5,
  },
  {
    id: 'gardening_guru',
    rank: 1,
    name: 'Gardening Guru',
    tier: 'Master Seal',
    themeColor: '#d97706',
    description: 'Attained supreme gardening knowledge and master experience.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056840/urbanfarm_badges/gardening_guru.png',
    svgFilename: 'gardening_guru.svg',
    check: (s) => ((s.totalPlants || 0) * 10 + (s.totalCommunityPosts || 0) * 10 + (s.totalHarvests || 0) * 15) >= 100 || (s.totalPlants || 0) >= 10,
  },
  {
    id: 'weather_watcher',
    rank: 8,
    name: 'Weather Watcher',
    tier: 'Microclimate Expert',
    themeColor: '#0891b2',
    description: 'Utilised hyper-local weather alerts and irrigation intelligence.',
    imageUrl: 'https://res.cloudinary.com/af0rejiv/image/upload/v1791056842/urbanfarm_badges/weather_watcher.png',
    svgFilename: 'weather_watcher.svg',
    check: (s) => (s.totalGardens || 0) >= 1,
  },
];

const BADGE_MAP = BADGES.reduce((acc, b) => {
  acc[b.id] = b;
  return acc;
}, {});

module.exports = {
  BADGES,
  BADGE_MAP,
  getBadgeById: (id) => BADGE_MAP[id] || null,
};
