const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please add a city'],
        trim: true,
      },
      country: String,
    },
    gardeningLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    badges: {
      type: [String],
      default: [],
    },
    badgeSettings: {
      displayedBadges: {
        type: [String],
        default: [],
      },
      pinnedBadge: {
        type: String,
        default: '',
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
    profilePicture: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    climateZone: String,
    urbanSpaceType: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferences: {
      showAdvancedTips: {
        type: Boolean,
        default: false,
      },
      unitSystem: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      notificationPreferences: {
        wateringReminders: { type: Boolean, default: true },
        diagnosisAlerts: { type: Boolean, default: true },
        communityUpdates: { type: Boolean, default: true },
        weatherAlerts: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIX: Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    console.log('🔐 Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// ✅ FIX: Compare password method with better error handling
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log('🔐 Comparing passwords for:', this.email);
    console.log('📝 Entered password length:', enteredPassword?.length || 0);
    console.log('🔑 Stored hash exists:', !!this.password);
    
    if (!this.password) {
      console.error('❌ No password stored for user');
      return false;
    }
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('✅ Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);