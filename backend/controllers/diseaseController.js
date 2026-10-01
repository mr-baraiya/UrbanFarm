const Diagnosis = require('../models/Diagnosis');
const Plant = require('../models/Plant');
const cloudinary = require('../config/cloudinary');
const { identifyDisease } = require('../services/aiPlantDiseaseService');

// @desc    Diagnose plant disease from image
// @route   POST /api/disease/diagnose
exports.diagnosePlant = async (req, res, next) => {
  try {
    const { plantId } = req.body;
    const file = req.file;

    console.log('📸 Diagnose request received');
    console.log('  Plant ID:', plantId);
    console.log('  File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // 1. Upload image to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'diagnoses',
      resource_type: 'image',
    });
    console.log('✅ Cloudinary upload successful:', uploadResult.secure_url);

    // 2. Call Plant.id API for diagnosis
    console.log('🔬 Calling Plant.id API...');
    const diagnosisResult = await identifyDisease(uploadResult.secure_url);
    console.log('✅ Diagnosis complete:', diagnosisResult);

    // 3. Save diagnosis to database
    const diagnosis = new Diagnosis({
      userId: req.user.id,
      plantId: plantId || null,
      imageUrl: uploadResult.secure_url,
      diseaseName: diagnosisResult.disease,
      confidence: diagnosisResult.confidence,
      treatment: diagnosisResult.treatment,
      description: diagnosisResult.description,
    });
    await diagnosis.save();
    console.log('💾 Diagnosis saved to database');

    // 4. Update plant health status if plantId is provided
    if (plantId) {
      const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
      if (plant) {
        plant.health = diagnosisResult.confidence > 0.7 ? 'unhealthy' : 'warning';
        await plant.save();
        console.log('🌱 Plant health updated:', plant.health);
      }
    }

    // In backend/controllers/diseaseController.js - update the response

  res.status(201).json({
    success: true,
    diagnosis: {
      id: diagnosis._id,
      disease: diagnosis.diseaseName,
      confidence: diagnosis.confidence,
      treatment: diagnosis.treatment,
      description: diagnosis.description,
      imageUrl: diagnosis.imageUrl,
      isHealthy: diagnosisResult.isHealthy || false,
      allDiseases: diagnosisResult.allDiseases || [],
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

// @desc    Get single diagnosis
// @route   GET /api/disease/:id
exports.getDiagnosisById = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }
    res.status(200).json({ success: true, diagnosis });
  } catch (error) {
    next(error);
  }
};