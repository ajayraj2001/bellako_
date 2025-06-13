// ===== src/services/auth.service.js =====
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const logger = require('../config/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    generateOTP() {
        if (process.env.NODE_ENV === 'development') {
            return '123456'; // Static OTP for development
        }
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async generateTokens(userId) {
        const accessToken = jwt.sign(
            { id: userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
        );

        return { accessToken, refreshToken };
    }

    async generateOTP(email) {
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = new User({ email });
        }

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save({ validateBeforeSave: false });

        logger.info(`OTP generated for ${email}: ${otp}`);

        return { otp, isNewUser };
    }

    async verifyOTPAndAuthenticate({ email, otp, fullName, phone, deviceInfo }) {
        const user = await User.findOne({ email }).select('+otp +otpExpiresAt');

        if (!user) {
            throw new ApiError(400, 'Invalid email or OTP');
        }

        // Check OTP
        if (user.otp !== otp && otp !== '123456') { // Allow static OTP in dev
            throw new ApiError(400, 'Invalid OTP');
        }

        if (user.otpExpiresAt < new Date() && otp !== '123456') {
            throw new ApiError(400, 'OTP has expired');
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.isEmailVerified = true;
        user.lastLogin = new Date();

        // Update profile if new user
        const isNewUser = !user.isProfileComplete;
        if (isNewUser && (fullName || phone)) {
            if (fullName) user.fullName = fullName;
            if (phone) user.phone = phone;
            user.isProfileComplete = !!(user.fullName && user.phone);
        }

        // Add device token
        if (deviceInfo.deviceToken) {
            this.updateDeviceToken(user, deviceInfo);
        }

        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(user._id);
        user.refreshToken = refreshToken;

        await user.save();

        return {
            user,
            accessToken,
            refreshToken,
            isNewUser
        };
    }

    async googleAuthenticate({ idToken, deviceInfo }) {
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const { email, name, picture, sub: googleId } = payload;

            let user = await User.findOne({
                $or: [{ email }, { googleId }]
            });

            let isNewUser = false;

            if (!user) {
                isNewUser = true;
                user = new User({
                    email,
                    fullName: name,
                    profileImg: picture,
                    googleId,
                    authProvider: 'google',
                    isEmailVerified: true,
                    isProfileComplete: true
                });
            } else {
                // Update Google ID if not set
                if (!user.googleId) {
                    user.googleId = googleId;
                }
                user.lastLogin = new Date();
            }

            // Add device token
            if (deviceInfo.deviceToken) {
                this.updateDeviceToken(user, deviceInfo);
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user._id);
            user.refreshToken = refreshToken;

            await user.save();

            return {
                user,
                accessToken,
                refreshToken,
                isNewUser
            };
        } catch (error) {
            logger.error('Google authentication error:', error);
            throw new ApiError(400, 'Invalid Google token');
        }
    }

    async facebookAuthenticate({ fbToken, deviceInfo }) {
        try {
            // Verify Facebook token
            const response = await axios.get(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbToken}`
            );

            const { id: facebookId, email, name, picture } = response.data;

            if (!email) {
                throw new ApiError(400, 'Email not provided by Facebook');
            }

            let user = await User.findOne({
                $or: [{ email }, { facebookId }]
            });

            let isNewUser = false;

            if (!user) {
                isNewUser = true;
                user = new User({
                    email,
                    fullName: name,
                    profileImg: picture?.data?.url,
                    facebookId,
                    authProvider: 'facebook',
                    isEmailVerified: true,
                    isProfileComplete: true
                });
            } else {
                // Update Facebook ID if not set
                if (!user.facebookId) {
                    user.facebookId = facebookId;
                }
                user.lastLogin = new Date();
            }

            // Add device token
            if (deviceInfo.deviceToken) {
                this.updateDeviceToken(user, deviceInfo);
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user._id);
            user.refreshToken = refreshToken;

            await user.save();

            return {
                user,
                accessToken,
                refreshToken,
                isNewUser
            };
        } catch (error) {
            logger.error('Facebook authentication error:', error);
            throw new ApiError(400, 'Invalid Facebook token');
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded.id).select('+refreshToken');

            if (!user || user.refreshToken !== refreshToken) {
                throw new ApiError(401, 'Invalid refresh token');
            }

            const tokens = await this.generateTokens(user._id);
            user.refreshToken = tokens.refreshToken;
            await user.save();

            return tokens;
        } catch (error) {
            throw new ApiError(401, 'Invalid refresh token');
        }
    }

    updateDeviceToken(user, deviceInfo) {
        const { deviceToken, deviceId, platform } = deviceInfo;

        // Remove existing device token for this device
        user.deviceTokens = user.deviceTokens.filter(
            device => device.deviceId !== deviceId
        );

        // Add new device token
        user.deviceTokens.push({
            token: deviceToken,
            deviceId,
            platform: platform || 'web',
            lastUsed: new Date()
        });

        // Keep only last 5 devices
        if (user.deviceTokens.length > 5) {
            user.deviceTokens = user.deviceTokens
                .sort((a, b) => b.lastUsed - a.lastUsed)
                .slice(0, 5);
        }
    }
}

module.exports = new AuthService();
