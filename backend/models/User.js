const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    philosophicalStance: {
      type: String,
      maxlength: [50, 'Stance cannot exceed 50 characters'],
      default: 'Neutral',
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      discord: { type: String, default: '' },
    },
    settings: {
      autoDestruct: { type: Boolean, default: false },
      hardcoreToxicity: { type: Boolean, default: false },
      incognitoVote: { type: Boolean, default: false },
      hapticFeedback: { type: Boolean, default: true }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    reputationPoints: {
      type: Number,
      default: 0,
    },
    debatesParticipated: {
      type: Number,
      default: 0,
    },
    totalVotesReceived: {
      type: Number,
      default: 0,
    },
    argumentsPosted: {
      type: Number,
      default: 0,
    },
    debateWins: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    followedCategories: [
      {
        type: String,
      },
    ],
    bookmarkedDebates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Debate',
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method: generate avatar fallback URL
userSchema.methods.getAvatarUrl = function () {
  if (this.avatar) return this.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=random&length=1&color=fff&bold=true`;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
