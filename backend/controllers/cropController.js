const CropRecommendation = require('../models/CropRecommendation');
const { getRecommendations } = require('../services/aiCropRecommendationService');

// @desc    Get crop recommendations
// @route   POST /api/crops/recommend
exports.getCropRecommendations = async (req, res, next) => {
  try {
    const { soilType, ph, temperature, humidity, rainfall, season, region } = req.body;

    console.log('🌾 Getting crop recommendations for:', { soilType, ph, temperature });

    // Call Gemini service
    const recommendations = await getRecommendations({
      soilType,
      ph,
      temperature,
      humidity,
      rainfall,
      season,
      region,
    });

    // Save to database (for history)
    const cropRec = await CropRecommendation.create({
      userId: req.user.id,
      inputData: { soilType, ph, temperature, humidity, rainfall, season, region },
      recommendations,
    });

    console.log('✅ Crop recommendations saved');

    res.status(200).json({
      success: true,
      recommendations,
      historyId: cropRec._id,
    });
  } catch (error) {
    console.error('❌ Crop recommendation error:', error);
    next(error);
  }
};

// @desc    Get recommendation history
// @route   GET /api/crops/history
exports.getRecommendationHistory = async (req, res, next) => {
  try {
    const history = await CropRecommendation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a recommendation (bookmark)
// @route   PUT /api/crops/save/:id
exports.saveRecommendation = async (req, res, next) => {
  try {
    const rec = await CropRecommendation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { saved: true },
      { new: true }
    );
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    res.status(200).json({ success: true, rec });
  } catch (error) {
    next(error);
  }
};