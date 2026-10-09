const crypto = require('crypto');
const Diagnosis = require('../models/Diagnosis');
const Plant = require('../models/Plant');
const cloudinary = require('../config/cloudinary');
const { 
  identifyDiseaseWithGroq,
  identifyDisease, 
  getGroqDiseaseTips, 
  translateDiagnosisWithGroq 
} = require('../services/aiPlantDiseaseService');
const badgeService = require('../services/badgeService');

// @desc    Diagnose plant disease from image with 9 clinical agricultural sections using Groq / Gemini API
// @route   POST /api/disease/diagnose and POST /api/analyze
exports.diagnosePlant = async (req, res, next) => {
  try {
    const { plantId, imageUrl: bodyImageUrl, image, imageBase64, mimeType, language } = req.body;
    const file = req.file;

    console.log('📸 Diagnose request received');
    console.log('  Plant ID:', plantId || 'None');
    console.log('  Language:', language || 'English');
    console.log('  User:', req.user ? req.user.id : 'Guest / Mobile');
    console.log('  File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');
    console.log('  Image URL/Base64:', bodyImageUrl ? 'URL provided' : (image || imageBase64 ? 'Base64 provided' : 'None'));

    let rawImage = bodyImageUrl || image || imageBase64;

    if (!rawImage && file) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      rawImage = `data:${file.mimetype || 'image/jpeg'};base64,${b64}`;
    }

    if (rawImage && typeof rawImage === 'string' && !rawImage.startsWith('http://') && !rawImage.startsWith('https://') && !rawImage.startsWith('data:')) {
      rawImage = `data:${mimeType || 'image/jpeg'};base64,${rawImage}`;
    }

    if (!rawImage) {
      return res.status(400).json({ success: false, message: 'Please provide or upload an image' });
    }

    let finalImageUrl = rawImage;

    // Optional: upload to Cloudinary if available and image is dataURI
    if (finalImageUrl.startsWith('data:')) {
      try {
        if (cloudinary.config().cloud_name && cloudinary.config().api_key) {
          console.log('☁️ Uploading to Cloudinary...');
          const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
            folder: 'diagnoses',
            resource_type: 'image',
          });
          if (uploadResult && uploadResult.secure_url) {
            finalImageUrl = uploadResult.secure_url;
            console.log('✅ Cloudinary upload successful:', finalImageUrl);
          }
        }
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload skipped/failed, using direct image data:', cloudErr.message);
      }
    }

    let diagnosisResult = null;
    let tipsError = null;

    // 1. Primary AI Diagnosis via Groq Vision Pathology (with Gemini fallback inside aiPlantDiseaseService)
    try {
      console.log('🔬 Performing AI Vision Pathology analysis with 9-section schema...');
      diagnosisResult = await identifyDiseaseWithGroq({
        imageInput: finalImageUrl,
        fileBuffer: file ? file.buffer : null,
        fileMime: file ? file.mimetype : (mimeType || 'image/jpeg'),
        language: language || 'English'
      });
      console.log('✅ AI Diagnosis complete:', diagnosisResult.diseaseName, `(isPlant: ${diagnosisResult.isPlant})`);
    } catch (groqErr) {
      console.warn('⚠️ Primary Groq Vision failed, attempting secondary fallback:', groqErr.message);
      try {
        const legacyResult = await identifyDisease(finalImageUrl);
        let cause = '';
        let treatmentSteps = [];
        let preventionTips = [];
        try {
          const tips = await getGroqDiseaseTips(legacyResult.disease, legacyResult.description, language);
          cause = tips.cause || '';
          treatmentSteps = tips.treatmentSteps || [];
          preventionTips = tips.preventionTips || [];
        } catch (tErr) {
          tipsError = tErr.message;
        }

        diagnosisResult = {
          isPlant: legacyResult.isPlant !== false,
          isHealthy: legacyResult.isHealthy || false,
          plantName: '',
          scientificName: legacyResult.scientificName || '',
          diseaseName: legacyResult.disease,
          shortExplanation: legacyResult.description || '',
          description: legacyResult.description || '',
          observedSymptoms: [],
          symptoms: [],
          possibleCauses: cause ? [cause] : [],
          causes: cause ? [cause] : [],
          cause: cause,
          severityLevel: legacyResult.confidence > 0.7 ? 'Severe' : 'Moderate',
          severityPercentage: Math.round((legacyResult.confidence || 0.7) * 100),
          severityDescription: 'Assessed from primary sensor inspection.',
          immediateActions: treatmentSteps.length ? treatmentSteps : (legacyResult.treatment ? [legacyResult.treatment] : []),
          treatmentSteps: treatmentSteps.length ? treatmentSteps : (legacyResult.treatment ? [legacyResult.treatment] : []),
          modernSolutions: [],
          medicalSolutions: [],
          naturalSolutions: [],
          desiSolutions: [],
          recoveryTips: [],
          preventionTips: preventionTips,
          whenToContactExpert: '',
          whenToSeekExpertHelp: '',
          confidence: legacyResult.confidence > 0.7 ? 'high' : 'medium',
          confidenceScore: legacyResult.confidence || 0.7,
          noteIfUnsure: ''
        };
      } catch (fallbackErr) {
        console.error('❌ All diagnosis engines failed:', fallbackErr);
        throw new Error(groqErr.message || fallbackErr.message || 'Diagnosis service failed. Please retry.');
      }
    }

    // Generate unique, unguessable public share token
    const shareId = crypto.randomBytes(8).toString('hex');
    const userId = req.user ? req.user.id : null;

    // 2. Save diagnosis to database with all 9 structured sections (optional if DB is connected)
    let savedDoc = null;
    try {
      const diagnosis = new Diagnosis({
        userId: userId,
        plantId: plantId || null,
        imageUrl: finalImageUrl.length > 5000 ? finalImageUrl.slice(0, 100) + '...' : finalImageUrl,
        isPlant: diagnosisResult.isPlant !== false,
        plantName: diagnosisResult.plantName || '',
        scientificName: diagnosisResult.scientificName || '',
        isHealthy: Boolean(diagnosisResult.isHealthy),
        diseaseName: diagnosisResult.diseaseName || (diagnosisResult.isHealthy ? 'Healthy Plant' : 'Condition Detected'),
        shortExplanation: diagnosisResult.shortExplanation || diagnosisResult.description || '',
        description: diagnosisResult.description || diagnosisResult.shortExplanation || '',
        observedSymptoms: diagnosisResult.observedSymptoms || diagnosisResult.symptoms || [],
        symptoms: diagnosisResult.symptoms || diagnosisResult.observedSymptoms || [],
        possibleCauses: diagnosisResult.possibleCauses || diagnosisResult.causes || [],
        causes: diagnosisResult.causes || diagnosisResult.possibleCauses || [],
        cause: diagnosisResult.cause || '',
        severityLevel: diagnosisResult.severityLevel || 'Moderate',
        severityPercentage: typeof diagnosisResult.severityPercentage === 'number' ? diagnosisResult.severityPercentage : 50,
        severityDescription: diagnosisResult.severityDescription || '',
        immediateActions: diagnosisResult.immediateActions || diagnosisResult.treatmentSteps || [],
        treatmentSteps: diagnosisResult.treatmentSteps || diagnosisResult.immediateActions || [],
        modernSolutions: diagnosisResult.modernSolutions || diagnosisResult.medicalSolutions || [],
        medicalSolutions: diagnosisResult.medicalSolutions || diagnosisResult.modernSolutions || [],
        naturalSolutions: diagnosisResult.naturalSolutions || diagnosisResult.desiSolutions || [],
        desiSolutions: diagnosisResult.desiSolutions || diagnosisResult.naturalSolutions || [],
        preventionTips: diagnosisResult.preventionTips || [],
        whenToContactExpert: diagnosisResult.whenToContactExpert || diagnosisResult.whenToSeekExpertHelp || '',
        whenToSeekExpertHelp: diagnosisResult.whenToSeekExpertHelp || diagnosisResult.whenToContactExpert || '',
        confidence: typeof diagnosisResult.confidenceScore === 'number' ? diagnosisResult.confidenceScore : 0.85,
        confidenceLevel: diagnosisResult.confidenceLevel || diagnosisResult.confidence || 'medium',
        treatment: diagnosisResult.treatment || (diagnosisResult.immediateActions ? diagnosisResult.immediateActions.join('\n') : ''),
        recoveryTips: diagnosisResult.recoveryTips || [],
        noteIfUnsure: diagnosisResult.noteIfUnsure || '',
        shareId: shareId,
        isPublic: true,
        translations: {},
      });

      savedDoc = await diagnosis.save();
      console.log('💾 Diagnosis saved to database with shareId:', shareId);

      if (userId) {
        // Trigger badge evaluation
        badgeService.checkAndAwardBadges(userId).catch(err => console.error('Badge check error:', err));
      }
    } catch (saveErr) {
      console.warn('⚠️ Could not save diagnosis record to DB (proceeding with result):', saveErr.message);
    }

    // 3. Update plant health status if plantId is provided and user is authenticated
    if (plantId && userId && diagnosisResult.isPlant !== false) {
      try {
        const plant = await Plant.findOne({ _id: plantId, userId: userId });
        if (plant) {
          plant.health = diagnosisResult.isHealthy
            ? 'healthy'
            : (diagnosisResult.severityLevel === 'Severe' || diagnosisResult.confidenceScore > 0.7)
            ? 'unhealthy'
            : 'warning';
          await plant.save();
          console.log('🌱 Plant health updated:', plant.health);
        }
      } catch (plantErr) {
        console.warn('⚠️ Could not update plant health:', plantErr.message);
      }
    }

    const resPayload = {
      id: savedDoc ? savedDoc._id : null,
      _id: savedDoc ? savedDoc._id : null,
      shareId: savedDoc ? savedDoc.shareId : shareId,
      is_plant: diagnosisResult.isPlant !== false,
      isPlant: diagnosisResult.isPlant !== false,
      // Section 1: Diagnosis
      plant_name: diagnosisResult.plantName || '',
      plantName: diagnosisResult.plantName || '',
      scientific_name: diagnosisResult.scientificName || '',
      scientificName: diagnosisResult.scientificName || '',
      is_healthy: Boolean(diagnosisResult.isHealthy),
      isHealthy: Boolean(diagnosisResult.isHealthy),
      disease: diagnosisResult.diseaseName || (diagnosisResult.isHealthy ? 'Healthy Plant' : 'Condition Detected'),
      diseaseName: diagnosisResult.diseaseName || (diagnosisResult.isHealthy ? 'Healthy Plant' : 'Condition Detected'),
      condition_name: diagnosisResult.diseaseName || (diagnosisResult.isHealthy ? 'Healthy Plant' : 'Condition Detected'),
      short_explanation: diagnosisResult.shortExplanation || diagnosisResult.description || '',
      shortExplanation: diagnosisResult.shortExplanation || diagnosisResult.description || '',
      description: diagnosisResult.description || diagnosisResult.shortExplanation || '',
      // Section 2: Observed Symptoms
      observed_symptoms: diagnosisResult.observedSymptoms || diagnosisResult.symptoms || [],
      observedSymptoms: diagnosisResult.observedSymptoms || diagnosisResult.symptoms || [],
      symptoms: diagnosisResult.symptoms || diagnosisResult.observedSymptoms || [],
      // Section 3: Possible Cause
      possible_causes: diagnosisResult.possibleCauses || diagnosisResult.causes || [],
      possibleCauses: diagnosisResult.possibleCauses || diagnosisResult.causes || [],
      causes: diagnosisResult.causes || diagnosisResult.possibleCauses || [],
      cause: diagnosisResult.cause || '',
      // Section 4: Severity
      severity_level: diagnosisResult.severityLevel || 'Moderate',
      severityLevel: diagnosisResult.severityLevel || 'Moderate',
      severity_percentage: typeof diagnosisResult.severityPercentage === 'number' ? diagnosisResult.severityPercentage : 50,
      severityPercentage: typeof diagnosisResult.severityPercentage === 'number' ? diagnosisResult.severityPercentage : 50,
      severity_description: diagnosisResult.severityDescription || '',
      severityDescription: diagnosisResult.severityDescription || '',
      // Section 5: Immediate Action
      immediate_actions: diagnosisResult.immediateActions || diagnosisResult.treatmentSteps || [],
      immediateActions: diagnosisResult.immediateActions || diagnosisResult.treatmentSteps || [],
      treatment_steps: diagnosisResult.treatmentSteps || diagnosisResult.immediateActions || [],
      treatmentSteps: diagnosisResult.treatmentSteps || diagnosisResult.immediateActions || [],
      treatment: diagnosisResult.treatment || (diagnosisResult.immediateActions ? diagnosisResult.immediateActions.join('\n') : ''),
      // Section 6: Modern Solution
      modern_solutions: diagnosisResult.modernSolutions || diagnosisResult.medicalSolutions || [],
      modernSolutions: diagnosisResult.modernSolutions || diagnosisResult.medicalSolutions || [],
      medical_solutions: diagnosisResult.medicalSolutions || diagnosisResult.modernSolutions || [],
      medicalSolutions: diagnosisResult.medicalSolutions || diagnosisResult.modernSolutions || [],
      // Section 7: Natural Solution
      natural_solutions: diagnosisResult.naturalSolutions || diagnosisResult.desiSolutions || [],
      naturalSolutions: diagnosisResult.naturalSolutions || diagnosisResult.desiSolutions || [],
      desi_solutions: diagnosisResult.desiSolutions || diagnosisResult.naturalSolutions || [],
      desiSolutions: diagnosisResult.desiSolutions || diagnosisResult.naturalSolutions || [],
      // Section 8: Prevention
      prevention_tips: diagnosisResult.preventionTips || [],
      preventionTips: diagnosisResult.preventionTips || [],
      // Section 9: When to Contact Expert
      when_to_seek_expert_help: diagnosisResult.whenToSeekExpertHelp || diagnosisResult.whenToContactExpert || '',
      whenToSeekExpertHelp: diagnosisResult.whenToSeekExpertHelp || diagnosisResult.whenToContactExpert || '',
      whenToContactExpert: diagnosisResult.whenToContactExpert || diagnosisResult.whenToSeekExpertHelp || '',
      // Metadata
      confidence: diagnosisResult.confidenceLevel || diagnosisResult.confidence || 'medium',
      confidenceLevel: diagnosisResult.confidenceLevel || diagnosisResult.confidence || 'medium',
      confidenceScore: diagnosisResult.confidenceScore || 0.85,
      recovery_tips: diagnosisResult.recoveryTips || [],
      recoveryTips: diagnosisResult.recoveryTips || [],
      note_if_unsure: diagnosisResult.noteIfUnsure || '',
      noteIfUnsure: diagnosisResult.noteIfUnsure || '',
      imageUrl: finalImageUrl.length > 5000 ? '' : finalImageUrl,
      isPublic: true,
      tipsError: tipsError,
    };

    res.status(200).json({
      success: true,
      diagnosis: resPayload,
      ...resPayload
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
      .populate('plantId', 'name variety')
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

    console.log(`🤖 Generating Groq 9-section tips for diagnosis: ${diagnosis.diseaseName}`);
    const groqTips = await getGroqDiseaseTips(diagnosis.diseaseName, diagnosis.description);

    diagnosis.shortExplanation = groqTips.shortExplanation || diagnosis.shortExplanation;
    diagnosis.observedSymptoms = groqTips.observedSymptoms || diagnosis.observedSymptoms;
    diagnosis.symptoms = groqTips.symptoms || diagnosis.symptoms;
    diagnosis.possibleCauses = groqTips.possibleCauses || diagnosis.possibleCauses;
    diagnosis.causes = groqTips.causes || diagnosis.causes;
    diagnosis.cause = groqTips.cause || diagnosis.cause;
    diagnosis.severityLevel = groqTips.severityLevel || diagnosis.severityLevel;
    diagnosis.severityPercentage = groqTips.severityPercentage || diagnosis.severityPercentage;
    diagnosis.severityDescription = groqTips.severityDescription || diagnosis.severityDescription;
    diagnosis.immediateActions = groqTips.immediateActions || diagnosis.immediateActions;
    diagnosis.treatmentSteps = groqTips.treatmentSteps || diagnosis.treatmentSteps;
    diagnosis.modernSolutions = groqTips.modernSolutions || diagnosis.modernSolutions;
    diagnosis.medicalSolutions = groqTips.medicalSolutions || diagnosis.medicalSolutions;
    diagnosis.naturalSolutions = groqTips.naturalSolutions || diagnosis.naturalSolutions;
    diagnosis.desiSolutions = groqTips.desiSolutions || diagnosis.desiSolutions;
    diagnosis.preventionTips = groqTips.preventionTips || diagnosis.preventionTips;
    diagnosis.whenToContactExpert = groqTips.whenToContactExpert || diagnosis.whenToContactExpert;
    diagnosis.whenToSeekExpertHelp = groqTips.whenToSeekExpertHelp || diagnosis.whenToSeekExpertHelp;
    diagnosis.noteIfUnsure = groqTips.noteIfUnsure || diagnosis.noteIfUnsure;
    await diagnosis.save();

    res.status(200).json({
      success: true,
      shortExplanation: diagnosis.shortExplanation,
      observedSymptoms: diagnosis.observedSymptoms,
      symptoms: diagnosis.symptoms,
      possibleCauses: diagnosis.possibleCauses,
      causes: diagnosis.causes,
      cause: diagnosis.cause,
      severityLevel: diagnosis.severityLevel,
      severityPercentage: diagnosis.severityPercentage,
      severityDescription: diagnosis.severityDescription,
      immediateActions: diagnosis.immediateActions,
      treatmentSteps: diagnosis.treatmentSteps,
      modernSolutions: diagnosis.modernSolutions,
      medicalSolutions: diagnosis.medicalSolutions,
      naturalSolutions: diagnosis.naturalSolutions,
      desiSolutions: diagnosis.desiSolutions,
      preventionTips: diagnosis.preventionTips,
      whenToContactExpert: diagnosis.whenToContactExpert,
      whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp,
      noteIfUnsure: diagnosis.noteIfUnsure,
    });
  } catch (error) {
    console.error('❌ Groq tips retry error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate tips with Groq' });
  }
};

// @desc    Translate diagnosis using Groq with persistent cache
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

    // 1. Check persistent database cache
    const existingCache = diagnosis.translations?.get?.(targetLang) || diagnosis.translations?.[targetLang];
    if (existingCache && (existingCache.diseaseName || existingCache.plantName)) {
      console.log(`⚡ Returning cached translation for ${targetLang}`);
      return res.status(200).json({
        success: true,
        translation: existingCache,
        cached: true,
      });
    }

    // 2. If target is 'en' and original document is already in English (ASCII), return original
    const isOriginalAscii = /^[\x00-\x7F\s.,\-–()0-9%/]+$/.test(diagnosis.diseaseName || '') && 
                            /^[\x00-\x7F\s.,\-–()0-9%/\n\r]+$/.test(diagnosis.shortExplanation || diagnosis.description || '');
    if (targetLang === 'en' && isOriginalAscii) {
      return res.status(200).json({
        success: true,
        translation: {
          plantName: diagnosis.plantName || '',
          diseaseName: diagnosis.diseaseName,
          shortExplanation: diagnosis.shortExplanation || diagnosis.description || '',
          description: diagnosis.description || diagnosis.shortExplanation || '',
          observedSymptoms: diagnosis.observedSymptoms || diagnosis.symptoms || [],
          symptoms: diagnosis.symptoms || diagnosis.observedSymptoms || [],
          possibleCauses: diagnosis.possibleCauses || diagnosis.causes || [],
          causes: diagnosis.causes || diagnosis.possibleCauses || [],
          cause: diagnosis.cause || '',
          severityLevel: diagnosis.severityLevel || 'Moderate',
          severityPercentage: diagnosis.severityPercentage || 50,
          severityDescription: diagnosis.severityDescription || '',
          immediateActions: diagnosis.immediateActions || diagnosis.treatmentSteps || [],
          treatmentSteps: diagnosis.treatmentSteps || diagnosis.immediateActions || [],
          modernSolutions: diagnosis.modernSolutions || diagnosis.medicalSolutions || [],
          medicalSolutions: diagnosis.medicalSolutions || diagnosis.modernSolutions || [],
          naturalSolutions: diagnosis.naturalSolutions || diagnosis.desiSolutions || [],
          desiSolutions: diagnosis.desiSolutions || diagnosis.naturalSolutions || [],
          preventionTips: diagnosis.preventionTips || [],
          whenToContactExpert: diagnosis.whenToContactExpert || diagnosis.whenToSeekExpertHelp || '',
          whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp || diagnosis.whenToContactExpert || '',
          noteIfUnsure: diagnosis.noteIfUnsure || ''
        },
        cached: true,
      });
    }

    // 3. Request fresh 9-section translation from Groq
    console.log(`🌐 Calling Groq 9-section translation into ${targetLang}...`);
    try {
      const translated = await translateDiagnosisWithGroq({
        plantName: diagnosis.plantName,
        diseaseName: diagnosis.diseaseName,
        shortExplanation: diagnosis.shortExplanation || diagnosis.description,
        description: diagnosis.description || diagnosis.shortExplanation,
        observedSymptoms: diagnosis.observedSymptoms || diagnosis.symptoms,
        symptoms: diagnosis.symptoms || diagnosis.observedSymptoms,
        possibleCauses: diagnosis.possibleCauses || diagnosis.causes,
        causes: diagnosis.causes || diagnosis.possibleCauses,
        cause: diagnosis.cause,
        severityLevel: diagnosis.severityLevel,
        severityPercentage: diagnosis.severityPercentage,
        severityDescription: diagnosis.severityDescription,
        immediateActions: diagnosis.immediateActions || diagnosis.treatmentSteps,
        treatmentSteps: diagnosis.treatmentSteps || diagnosis.immediateActions,
        modernSolutions: diagnosis.modernSolutions || diagnosis.medicalSolutions,
        medicalSolutions: diagnosis.medicalSolutions || diagnosis.modernSolutions,
        naturalSolutions: diagnosis.naturalSolutions || diagnosis.desiSolutions,
        desiSolutions: diagnosis.desiSolutions || diagnosis.naturalSolutions,
        preventionTips: diagnosis.preventionTips,
        whenToContactExpert: diagnosis.whenToContactExpert || diagnosis.whenToSeekExpertHelp,
        whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp || diagnosis.whenToContactExpert,
        noteIfUnsure: diagnosis.noteIfUnsure
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

      return res.status(200).json({
        success: true,
        translation: translated,
        cached: false,
      });
    } catch (aiErr) {
      console.warn(`⚠️ Groq translation into ${targetLang} failed:`, aiErr.message);
      return res.status(200).json({
        success: true,
        translation: {
          plantName: diagnosis.plantName || '',
          diseaseName: diagnosis.diseaseName,
          shortExplanation: diagnosis.shortExplanation || diagnosis.description || '',
          description: diagnosis.description || '',
          observedSymptoms: diagnosis.observedSymptoms || diagnosis.symptoms || [],
          symptoms: diagnosis.symptoms || [],
          possibleCauses: diagnosis.possibleCauses || diagnosis.causes || [],
          causes: diagnosis.causes || [],
          cause: diagnosis.cause || '',
          severityLevel: diagnosis.severityLevel || 'Moderate',
          severityPercentage: diagnosis.severityPercentage || 50,
          severityDescription: diagnosis.severityDescription || '',
          immediateActions: diagnosis.immediateActions || diagnosis.treatmentSteps || [],
          treatmentSteps: diagnosis.treatmentSteps || [],
          modernSolutions: diagnosis.modernSolutions || diagnosis.medicalSolutions || [],
          medicalSolutions: diagnosis.medicalSolutions || [],
          naturalSolutions: diagnosis.naturalSolutions || diagnosis.desiSolutions || [],
          desiSolutions: diagnosis.desiSolutions || [],
          preventionTips: diagnosis.preventionTips || [],
          whenToContactExpert: diagnosis.whenToContactExpert || diagnosis.whenToSeekExpertHelp || '',
          whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp || '',
          noteIfUnsure: diagnosis.noteIfUnsure || ''
        },
        warning: aiErr.message,
        cached: false,
      });
    }
  } catch (error) {
    console.error('❌ Translation controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process translation' });
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
        isPlant: diagnosis.isPlant,
        // Section 1: Diagnosis
        plantName: diagnosis.plantName || diagnosis.plantId?.name || null,
        scientificName: diagnosis.scientificName || null,
        isHealthy: diagnosis.isHealthy,
        diseaseName: diagnosis.diseaseName,
        shortExplanation: diagnosis.shortExplanation || diagnosis.description,
        description: diagnosis.description || diagnosis.shortExplanation,
        // Section 2: Observed Symptoms
        observedSymptoms: diagnosis.observedSymptoms || diagnosis.symptoms || [],
        symptoms: diagnosis.symptoms || diagnosis.observedSymptoms || [],
        // Section 3: Possible Cause
        possibleCauses: diagnosis.possibleCauses || diagnosis.causes || [],
        causes: diagnosis.causes || diagnosis.possibleCauses || [],
        cause: diagnosis.cause,
        // Section 4: Severity
        severityLevel: diagnosis.severityLevel || 'Moderate',
        severityPercentage: diagnosis.severityPercentage || 50,
        severityDescription: diagnosis.severityDescription || '',
        // Section 5: Immediate Action
        immediateActions: diagnosis.immediateActions || diagnosis.treatmentSteps || [],
        treatmentSteps: diagnosis.treatmentSteps || diagnosis.immediateActions || [],
        treatment: diagnosis.treatment,
        // Section 6: Modern Solution
        modernSolutions: diagnosis.modernSolutions || diagnosis.medicalSolutions || [],
        medicalSolutions: diagnosis.medicalSolutions || diagnosis.modernSolutions || [],
        // Section 7: Natural Solution
        naturalSolutions: diagnosis.naturalSolutions || diagnosis.desiSolutions || [],
        desiSolutions: diagnosis.desiSolutions || diagnosis.naturalSolutions || [],
        // Section 8: Prevention
        preventionTips: diagnosis.preventionTips || [],
        // Section 9: When to Contact Expert
        whenToContactExpert: diagnosis.whenToContactExpert || diagnosis.whenToSeekExpertHelp || '',
        whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp || diagnosis.whenToContactExpert || '',
        // Metadata
        confidence: diagnosis.confidence,
        confidenceLevel: diagnosis.confidenceLevel,
        recoveryTips: diagnosis.recoveryTips,
        noteIfUnsure: diagnosis.noteIfUnsure,
        createdAt: diagnosis.createdAt,
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

// @desc    Delete diagnosis record
// @route   DELETE /api/disease/:id
exports.deleteDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findById(id);

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis record not found' });
    }

    const isOwner = req.user && String(req.user.id) === String(diagnosis.userId);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this diagnosis record' });
    }

    await diagnosis.deleteOne();
    res.status(200).json({ success: true, message: 'Diagnosis record deleted successfully', id });
  } catch (error) {
    next(error);
  }
};