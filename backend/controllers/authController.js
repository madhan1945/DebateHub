const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendTokenResponse } = require('../config/jwt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} already in use.` });
    }

    const user = await User.create({ username, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user from Google data
      const baseUsername = name.replace(/\s+/g, '').toLowerCase().slice(0, 20);
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await User.create({
        username,
        email,
        googleId,
        avatar: picture,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        avatar: user.getAvatarUrl(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, avatar, philosophicalStance, socialLinks, settings } = req.body;
    
    const user = await User.findById(req.user._id);

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username already taken.' });
      }
      user.username = username;
    }
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (philosophicalStance !== undefined) user.philosophicalStance = philosophicalStance;
    
    if (socialLinks !== undefined) {
      if (!user.socialLinks) user.socialLinks = {};
      if (socialLinks.twitter !== undefined) user.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.github !== undefined) user.socialLinks.github = socialLinks.github;
      if (socialLinks.website !== undefined) user.socialLinks.website = socialLinks.website;
      if (socialLinks.instagram !== undefined) user.socialLinks.instagram = socialLinks.instagram;
      if (socialLinks.discord !== undefined) user.socialLinks.discord = socialLinks.discord;
      user.markModified('socialLinks');
    }

    if (settings !== undefined) {
      if (!user.settings) user.settings = {};
      if (settings.autoDestruct !== undefined) user.settings.autoDestruct = settings.autoDestruct;
      if (settings.hardcoreToxicity !== undefined) user.settings.hardcoreToxicity = settings.hardcoreToxicity;
      if (settings.incognitoVote !== undefined) user.settings.incognitoVote = settings.incognitoVote;
      if (settings.hapticFeedback !== undefined) user.settings.hapticFeedback = settings.hapticFeedback;
      user.markModified('settings');
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: { ...user.toJSON(), avatar: user.getAvatarUrl() },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'No password set. Use Google login.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/profile/:username
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-googleId -isBanned -followedCategories -bookmarkedDebates -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: { ...user.toJSON(), avatar: user.getAvatarUrl() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleAuth, getMe, updateProfile, changePassword, getPublicProfile };
