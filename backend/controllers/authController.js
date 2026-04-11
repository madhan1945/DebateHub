const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendTokenResponse } = require('../config/jwt');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function isMissingEnv(value) {
  const normalized = normalizeString(value).toLowerCase();
  return (
    !normalized ||
    [
      'value',
      'undefined',
      'null',
      'your_google_client_id',
      'your_google_client_id.apps.googleusercontent.com',
    ].includes(normalized)
  );
}

function getGoogleAudiences() {
  const values = [process.env.GOOGLE_CLIENT_IDS, process.env.GOOGLE_CLIENT_ID]
    .filter((entry) => typeof entry === 'string')
    .flatMap((entry) => entry.split(','))
    .map((entry) => normalizeString(entry))
    .filter((entry) => !isMissingEnv(entry));

  return [...new Set(values)];
}

function sanitizeUsernameSeed(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');
}

async function generateUniqueGoogleUsername({ name, email, googleId }) {
  const emailLocalPart = normalizeEmail(email).split('@')[0] || '';
  let base = sanitizeUsernameSeed(name) || sanitizeUsernameSeed(emailLocalPart);

  if (!base || base.length < 3) {
    const suffix = sanitizeUsernameSeed(String(googleId || '').slice(-8));
    base = suffix ? `user_${suffix}` : 'user';
  }

  base = base.slice(0, 24);
  if (!base) base = 'user';

  let username = base;
  let counter = 1;

  while (await User.exists({ username })) {
    const suffix = String(counter++);
    username = `${base.slice(0, 30 - suffix.length)}${suffix}`;
  }

  return username;
}

function isGoogleTokenValidationError(error) {
  const message = String(error?.message || '');
  return (
    error?.name === 'OAuth2ClientError' ||
    /audience|recipient|issuer|signature|expired|id token|jwt|malformed|token used too early/i.test(
      message
    )
  );
}

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const username = normalizeString(req.body?.username);
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

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
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

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
    const audiences = getGoogleAudiences();
    if (!audiences.length) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID.',
      });
    }

    const credential = normalizeString(req.body?.credential);

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    const googleClient = new OAuth2Client(audiences[0]);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: audiences.length === 1 ? audiences[0] : audiences,
    });

    const payload = ticket.getPayload();
    const googleId = normalizeString(payload?.sub);
    const email = normalizeEmail(payload?.email);
    const name = normalizeString(payload?.name);
    const picture = normalizeString(payload?.picture);

    if (!googleId || !email) {
      return res.status(401).json({
        success: false,
        message: 'Google token did not include a usable account email.',
      });
    }

    if (payload?.email_verified === false) {
      return res.status(401).json({
        success: false,
        message: 'Google account email is not verified.',
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user?.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    }

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture || '';
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user from Google data
      const username = await generateUniqueGoogleUsername({ name, email, googleId });

      user = await User.create({
        username,
        email,
        googleId,
        avatar: picture || '',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (isGoogleTokenValidationError(error)) {
      return res.status(401).json({
        success: false,
        message:
          'Google login failed. Make sure this domain is added to Google OAuth authorised JavaScript origins.',
      });
    }

    return next(error);
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
