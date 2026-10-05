const { fetchMarketPrices } = require('../services/marketService');

// @desc    Get Latest Available Market Prices from Data.gov.in (AGMARKNET API)
// @route   GET /api/market/prices
// @access  Public
exports.getMarketPrices = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const result = await fetchMarketPrices(forceRefresh);
    res.status(200).json(result);
  } catch (error) {
    console.error('Market Controller Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve market prices from Data.gov.in',
      records: [],
    });
  }
};
