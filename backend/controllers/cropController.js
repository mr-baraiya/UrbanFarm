const CropRecommendation = require('../models/CropRecommendation');
const { getRecommendations } = require('../services/aiCropRecommendationService');

// @desc    Get crop recommendations
// @route   POST /api/crops/recommend
exports.getCropRecommendations = async (req, res, next) => {
  try {
    const { 
      soilType, 
      ph, 
      temperature, 
      humidity, 
      rainfall, 
      season, 
      region, 
      spaceAvailable, 
      gardenType,
      targetCrop,
      language 
    } = req.body;

    const userLang = ['gu', 'hi'].includes(language) ? language : (req.headers['accept-language']?.includes('gu') ? 'gu' : (req.headers['accept-language']?.includes('hi') ? 'hi' : 'en'));

    console.log('🌾 Getting crop recommendations for:', { soilType, ph, temperature, targetCrop, language: userLang });

    // Call Gemini AI service
    const aiResult = await getRecommendations({
      soilType,
      ph,
      temperature,
      humidity,
      rainfall,
      season,
      region,
      spaceAvailable,
      gardenType,
      targetCrop,
      language: userLang
    });

    const recommendations = aiResult.recommendations || [];

    // Save to database (for user history)
    const cropRec = await CropRecommendation.create({
      userId: req.user.id,
      inputData: { 
        soilType, 
        ph, 
        temperature, 
        humidity, 
        rainfall, 
        season, 
        region, 
        spaceAvailable,
        targetCrop 
      },
      recommendations,
    });

    console.log('✅ Real Gemini crop recommendations saved:', cropRec._id);

    res.status(200).json({
      success: true,
      soilAnalysis: aiResult.soilAnalysis,
      targetCropCheck: aiResult.targetCropCheck,
      recommendations,
      historyId: cropRec._id,
    });
  } catch (error) {
    console.error('❌ Crop recommendation error:', error.message);
    if (error.validationErrors) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.validationErrors
      });
    }
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to generate crop recommendations. Please check inputs and retry.'
    });
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