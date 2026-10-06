const crypto = require('crypto');
const Diagnosis = require('../models/Diagnosis');
const Plant = require('../models/Plant');
const cloudinary = require('../config/cloudinary');
const { 
  identifyDisease, 
  getGeminiDiseaseTips, 
  translateDiagnosisWithGemini 
} = require('../services/aiPlantDiseaseService');
const badgeService = require('../services/badgeService');

// @desc    Diagnose plant disease from image
// @route   POST /api/disease/diagnose
exports.diagnosePlant = async (req, res, next) => {
  try {
    const { plantId, imageUrl: bodyImageUrl } = req.body;
    const file = req.file;

    console.log('📸 Diagnose request received');
    console.log('  Plant ID:', plantId);
    console.log('  File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');
    console.log('  Image URL:', bodyImageUrl || 'None');

    let finalImageUrl = bodyImageUrl;

    if (file) {
      try {
        console.log('☁️ Uploading to Cloudinary...');
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'diagnoses',
          resource_type: 'image',
        });
        finalImageUrl = uploadResult.secure_url;
        console.log('✅ Cloudinary upload successful:', finalImageUrl);
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload failed, falling back to dataURI/local buffer:', cloudErr.message);
        const b64 = Buffer.from(file.buffer).toString('base64');
        finalImageUrl = `data:${file.mimetype};base64,${b64}`;
      }
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide or upload an image' });
    }

    // 1. Call Plant.id API for primary diagnosis
    console.log('🔬 Calling Plant.id API...');
    const diagnosisResult = await identifyDisease(finalImageUrl);
    console.log('✅ Diagnosis complete:', diagnosisResult.disease);

    // 2. Fetch real treatment & prevention tips via Google Gemini API
    let cause = '';
    let treatmentSteps = [];
    let preventionTips = [];
    let tipsError = null;

    try {
      console.log('🤖 Fetching real treatment & prevention tips from Gemini...');
      const geminiTips = await getGeminiDiseaseTips(diagnosisResult.disease, diagnosisResult.description);
      cause = geminiTips.cause || '';
      treatmentSteps = geminiTips.treatmentSteps || [];
      preventionTips = geminiTips.preventionTips || [];
    } catch (tipErr) {
      console.warn('⚠️ Gemini tips generation failed:', tipErr.message);
      tipsError = tipErr.message;
    }

    // Generate unique, unguessable public share token
    const shareId = crypto.randomBytes(8).toString('hex');

    // 3. Save diagnosis to database
    const diagnosis = new Diagnosis({
      userId: req.user.id,
      plantId: plantId || null,
      imageUrl: finalImageUrl,
      diseaseName: diagnosisResult.disease,
      confidence: diagnosisResult.confidence,
      treatment: diagnosisResult.treatment,
      description: diagnosisResult.description,
      cause: cause,
      treatmentSteps: treatmentSteps,
      preventionTips: preventionTips,
      shareId: shareId,
      isPublic: true,
      translations: {},
    });
    await diagnosis.save();
    console.log('💾 Diagnosis saved to database with shareId:', shareId);

    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));

    // 4. Update plant health status if plantId is provided
    if (plantId) {
      const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
      if (plant) {
        plant.health = diagnosisResult.isHealthy
          ? 'healthy'
          : diagnosisResult.confidence > 0.7
          ? 'unhealthy'
          : 'warning';
        await plant.save();
        console.log('🌱 Plant health updated:', plant.health);
      }
    }

    res.status(201).json({
      success: true,
      diagnosis: {
        id: diagnosis._id,
        _id: diagnosis._id,
        shareId: diagnosis.shareId,
        disease: diagnosis.diseaseName,
        diseaseName: diagnosis.diseaseName,
        confidence: diagnosis.confidence,
        treatment: diagnosis.treatment,
        description: diagnosis.description,
        cause: diagnosis.cause,
        treatmentSteps: diagnosis.treatmentSteps,
        preventionTips: diagnosis.preventionTips,
        imageUrl: diagnosis.imageUrl,
        isHealthy: diagnosisResult.isHealthy || false,
        allDiseases: diagnosisResult.allDiseases || [],
        isPublic: diagnosis.isPublic,
        tipsError: tipsError,
      },
    });
  } catch (error) {
    console.error('❌ Diagnosis error:', error);
    next(error);
  }
};

// @desc    Get diagnosis history for user
// @route   GET /api/disease/history
exports.getDiagnosisHistory = async (req, res, next) => {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user.id })
      .populate('plantId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, diagnoses });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh/retry real Gemini tips for an existing diagnosis
// @route   POST /api/disease/:id/tips
exports.getGeminiTipsForDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { shareId: id }],
      userId: req.user.id,
    });

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis record not found' });
    }

    console.log(`🤖 Generating Gemini tips for diagnosis: ${diagnosis.diseaseName}`);
    const geminiTips = await getGeminiDiseaseTips(diagnosis.diseaseName, diagnosis.description);

    diagnosis.cause = geminiTips.cause;
    diagnosis.treatmentSteps = geminiTips.treatmentSteps;
    diagnosis.preventionTips = geminiTips.preventionTips;
    await diagnosis.save();

    res.status(200).json({
      success: true,
      cause: diagnosis.cause,
      treatmentSteps: diagnosis.treatmentSteps,
      preventionTips: diagnosis.preventionTips,
    });
  } catch (error) {
    console.error('❌ Gemini tips retry error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate tips with Gemini' });
  }
};

// @desc    Translate diagnosis using Gemini with persistent cache
// @route   POST /api/disease/:id/translate
exports.translateDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetLang } = req.body;

    if (!targetLang || !['en', 'gu', 'hi'].includes(targetLang)) {
      return res.status(400).json({ success: false, message: 'Invalid target language. Supported: en, gu, hi' });
    }

    const diagnosis = await Diagnosis.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { shareId: id }],
    });

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis record not found' });
    }

    // If English requested and original is in English, return original
    if (targetLang === 'en') {
      return res.status(200).json({
        success: true,
        translation: {
          diseaseName: diagnosis.diseaseName,
          description: diagnosis.description,
          cause: diagnosis.cause || '',
          treatmentSteps: diagnosis.treatmentSteps || [],
          preventionTips: diagnosis.preventionTips || [],
        },
        cached: true,
      });
    }

    // Check persistent database cache
    const existingCache = diagnosis.translations?.get?.(targetLang) || diagnosis.translations?.[targetLang];
    if (existingCache && existingCache.diseaseName) {
      console.log(`⚡ Returning cached translation for ${targetLang}`);
      return res.status(200).json({
        success: true,
        translation: existingCache,
        cached: true,
      });
    }

    // Request fresh translation from Gemini
    console.log(`🌐 Calling Gemini translation into ${targetLang}...`);
    const translated = await translateDiagnosisWithGemini({
      diseaseName: diagnosis.diseaseName,
      description: diagnosis.description,
      cause: diagnosis.cause,
      treatmentSteps: diagnosis.treatmentSteps,
      preventionTips: diagnosis.preventionTips,
    }, targetLang);

    // Save to cache
    if (!diagnosis.translations) {
      diagnosis.translations = new Map();
    }
    if (typeof diagnosis.translations.set === 'function') {
      diagnosis.translations.set(targetLang, translated);
    } else {
      diagnosis.translations[targetLang] = translated;
    }
    diagnosis.markModified('translations');
    await diagnosis.save();

    res.status(200).json({
      success: true,
      translation: translated,
      cached: false,
    });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to translate diagnosis' });
  }
};

// @desc    Toggle public share link (share / revoke)
// @route   PUT /api/disease/:id/share
exports.toggleShareStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    const diagnosis = await Diagnosis.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { shareId: id }],
      userId: req.user.id,
    });

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found or unauthorized' });
    }

    if (!diagnosis.shareId) {
      diagnosis.shareId = crypto.randomBytes(8).toString('hex');
    }

    diagnosis.isPublic = typeof isPublic === 'boolean' ? isPublic : !diagnosis.isPublic;
    await diagnosis.save();

    res.status(200).json({
      success: true,
      isPublic: diagnosis.isPublic,
      shareId: diagnosis.shareId,
      shareUrl: `/d/${diagnosis.shareId}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public diagnosis by shareId (Strictly NO private user info)
// @route   GET /api/disease/public/:shareId
exports.getPublicDiagnosis = async (req, res, next) => {
  try {
    const { shareId } = req.params;

    const diagnosis = await Diagnosis.findOne({
      $or: [{ shareId: shareId }, { _id: shareId.match(/^[0-9a-fA-F]{24}$/) ? shareId : null }],
    }).populate('plantId', 'name variety');

    if (!diagnosis || diagnosis.isPublic === false) {
      return res.status(404).json({
        success: false,
        message: 'This plant diagnosis link is either invalid, deleted, or has been revoked by the gardener.',
      });
    }

    // Strictly sanitize and exclude all private user fields (no email, address, userId, account details)
    res.status(200).json({
      success: true,
      diagnosis: {
        shareId: diagnosis.shareId || diagnosis._id,
        imageUrl: diagnosis.imageUrl,
        diseaseName: diagnosis.diseaseName,
        confidence: diagnosis.confidence,
        description: diagnosis.description,
        treatment: diagnosis.treatment,
        cause: diagnosis.cause,
        treatmentSteps: diagnosis.treatmentSteps,
        preventionTips: diagnosis.preventionTips,
        createdAt: diagnosis.createdAt,
        plantName: diagnosis.plantId?.name || null,
        plantVariety: diagnosis.plantId?.variety || null,
        translations: diagnosis.translations || {},
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single diagnosis
// @route   GET /api/disease/:id
exports.getDiagnosisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { shareId: id }],
    }).populate('plantId', 'name variety health');

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    // Check privacy if unshared and not requested by owner
    const isOwner = req.user && String(req.user.id) === String(diagnosis.userId);
    if (!diagnosis.isPublic && !isOwner) {
      return res.status(404).json({
        success: false,
        message: 'This diagnosis is private or link has been revoked.',
      });
    }

    res.status(200).json({ success: true, diagnosis });
  } catch (error) {
    next(error);
  }
};