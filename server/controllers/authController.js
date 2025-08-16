const User = require('../models/User');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/jwt');

// Sanitize incoming preferences to prevent prototype pollution and only allow whitelisted fields
const sanitizePreferences = (incoming) => {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return {};
  }

  const safe = {};

  if (typeof incoming.language === 'string') {
    safe.language = incoming.language;
  }

  if (typeof incoming.theme === 'string') {
    safe.theme = incoming.theme;
  }

  if (
    incoming.notifications &&
    typeof incoming.notifications === 'object' &&
    !Array.isArray(incoming.notifications)
  ) {
    const notif = {};
    if (typeof incoming.notifications.email === 'boolean') {
      notif.email = incoming.notifications.email;
    }
    if (typeof incoming.notifications.push === 'boolean') {
      notif.push = incoming.notifications.push;
    }

    // Only set notifications if we actually whitelisted something
    if (Object.keys(notif).length > 0) {
      safe.notifications = notif;
    }
  }

  return safe;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      department, 
      phone 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      department,
      phone,
      role: 'external' // Default role for new registrations
    });

    await user.save();

    // Generate access and refresh tokens
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user._id.toString() });
    setAuthCookies(res, { accessToken, refreshToken });

    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      refreshToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Fast-bypass login in development when AUTH_DISABLE is true
    const authDisabled = String(process.env.AUTH_DISABLE || '').toLowerCase() === 'true';
    if (authDisabled && process.env.NODE_ENV === 'development') {
      const mockUser = new User({
        _id: '000000000000000000000000',
        username: 'dev',
        email: 'dev@local',
        firstName: 'Dev',
        lastName: 'Mode',
        role: 'admin',
        department: 'IT',
        phone: '+49 0000 000000',
        isActive: true,
        password: 'ignored'
      });
      const payload = { id: mockUser._id.toString(), email: mockUser.email, role: mockUser.role };
      const token = signAccessToken(payload);
      const refreshToken = signRefreshToken({ id: mockUser._id.toString() });
      setAuthCookies(res, { accessToken: token, refreshToken });
      return res.json({
        success: true,
        data: {
          token,
          refreshToken,
          user: mockUser.getPublicProfile ? mockUser.getPublicProfile() : {
            id: mockUser._id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: mockUser.role,
          }
        },
        message: 'Login successful (Auth disabled in development)'
      });
    }

    // Development mode: Allow login without MongoDB, gated by explicit flag
    const devLoginEnabled = (
      process.env.NODE_ENV === 'development' &&
      String(process.env.ENABLE_DEV_LOGIN || '').toLowerCase() === 'true'
    );
    if (devLoginEnabled && !mongoose.connection.readyState) {
      // Mock login for development
      if (email === 'admin@example.com' && password === 'password123') {
        const mockUser = {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          department: 'IT',
          phone: '+49 123 456789'
        };

        const mockToken = 'dev-jwt-token-' + Date.now();

        return res.json({
          success: true,
          data: {
            token: mockToken,
            user: mockUser
          },
          message: 'Login successful (Development Mode)'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Production mode: Use MongoDB
    const user = await User.findByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate access and refresh tokens
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user._id.toString() });
    setAuthCookies(res, { accessToken: token, refreshToken });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: user.getPublicProfile()
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching profile' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      firstName, 
      lastName, 
      department, 
      phone,
      preferences 
    } = req.body;

    const user = req.user;

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (preferences) {
      const safePrefs = sanitizePreferences(preferences);
      user.preferences = {
        ...user.preferences,
        ...safePrefs,
        notifications: {
          ...(user.preferences?.notifications || {}),
          ...(safePrefs.notifications || {}),
        },
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error while updating profile' 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Server error while changing password' 
    });
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (uses refresh token)
const refreshToken = async (req, res) => {
  try {
    const provided = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!provided) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(provided);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    // Optionally rotate refresh token (can be added later with blacklist support)
    setAuthCookies(res, { accessToken, refreshToken: provided });

    res.json({
      message: 'Token refreshed successfully',
      token: accessToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      message: 'Server error while refreshing token' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear auth cookies if used
    clearAuthCookies(res);
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Server error during logout' 
    });
  }
};

// @desc    Forgot password (send reset email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store hashed token and expiry in DB
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send email with reset link
    // For now, just return the token (in production, send via email)
    res.json({
      message: 'Password reset email sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error while processing password reset' 
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Hash the provided token to compare with stored hash
    const providedTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: providedTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Server error while resetting password' 
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
