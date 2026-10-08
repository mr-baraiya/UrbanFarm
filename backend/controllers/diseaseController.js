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

// @desc    Diagnose plant disease from image with 9 clinical agricultural sections using Groq API
// @route   POST /api/disease/diagnose
exports.diagnosePlant = async (req, res, next) => {
  try {
    const { plantId, imageUrl: bodyImageUrl, language } = req.body;
    const file = req.file;

    console.log('📸 Diagnose request received');
    console.log('  Plant ID:', plantId);
    console.log('  Language:', language || 'English');
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

    let diagnosisResult = null;
    let tipsError = null;

    // 1. Primary AI Diagnosis via Groq Vision Pathology
    try {
      console.log('🔬 Performing Groq Vision Pathology analysis with 9-section schema...');
      diagnosisResult = await identifyDiseaseWithGroq({
        imageInput: finalImageUrl,
        fileBuffer: file ? file.buffer : null,
        fileMime: file ? file.mimetype : 'image/jpeg',
        language: language || 'English'
      });
      console.log('✅ Groq Diagnosis complete:', diagnosisResult.diseaseName, `(isPlant: ${diagnosisResult.isPlant})`);
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

    // 2. Save diagnosis to database with all 9 structured sections
    const diagnosis = new Diagnosis({
      userId: req.user.id,
      plantId: plantId || null,
      imageUrl: finalImageUrl,
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

    await diagnosis.save();
    console.log('💾 Diagnosis saved to database with shareId:', shareId);

    // Trigger badge evaluation
    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));

    // 3. Update plant health status if plantId is provided
    if (plantId && diagnosisResult.isPlant !== false) {
      const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
      if (plant) {
        plant.health = diagnosisResult.isHealthy
          ? 'healthy'
          : (diagnosisResult.severityLevel === 'Severe' || diagnosisResult.confidenceScore > 0.7)
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
        isPlant: diagnosis.isPlant,
        // Section 1: Diagnosis
        plantName: diagnosis.plantName,
        scientificName: diagnosis.scientificName,
        isHealthy: diagnosis.isHealthy,
        disease: diagnosis.diseaseName,
        diseaseName: diagnosis.diseaseName,
        condition_name: diagnosis.diseaseName,
        shortExplanation: diagnosis.shortExplanation || diagnosis.description,
        description: diagnosis.description || diagnosis.shortExplanation,
        // Section 2: Observed Symptoms
        observedSymptoms: diagnosis.observedSymptoms,
        symptoms: diagnosis.symptoms,
        // Section 3: Possible Cause
        possibleCauses: diagnosis.possibleCauses,
        causes: diagnosis.causes,
        cause: diagnosis.cause,
        // Section 4: Severity
        severityLevel: diagnosis.severityLevel,
        severityPercentage: diagnosis.severityPercentage,
        severityDescription: diagnosis.severityDescription,
        // Section 5: Immediate Action
        immediateActions: diagnosis.immediateActions,
        treatmentSteps: diagnosis.treatmentSteps,
        treatment_steps: diagnosis.treatmentSteps,
        treatment: diagnosis.treatment,
        // Section 6: Modern Solution
        modernSolutions: diagnosis.modernSolutions,
        medicalSolutions: diagnosis.medicalSolutions,
        medical_solutions: diagnosis.medicalSolutions,
        // Section 7: Natural Solution
        naturalSolutions: diagnosis.naturalSolutions,
        desiSolutions: diagnosis.desiSolutions,
        desi_solutions: diagnosis.desiSolutions,
        // Section 8: Prevention
        preventionTips: diagnosis.preventionTips,
        prevention_tips: diagnosis.preventionTips,
        // Section 9: When to Contact Expert
        whenToContactExpert: diagnosis.whenToContactExpert,
        whenToSeekExpertHelp: diagnosis.whenToSeekExpertHelp,
        when_to_seek_expert_help: diagnosis.whenToSeekExpertHelp,
        // Metadata
        confidence: diagnosis.confidence,
        confidenceLevel: diagnosis.confidenceLevel,
        recoveryTips: diagnosis.recoveryTips,
        noteIfUnsure: diagnosis.noteIfUnsure,
        note_if_unsure: diagnosis.noteIfUnsure,
        imageUrl: diagnosis.imageUrl,
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