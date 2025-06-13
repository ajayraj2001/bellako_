// ===== src/controllers/user/auth.controller.js =====
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const authService = require('../../services/authService');
const emailService = require('../../services/emailService');
const ApiError = require('../../utils/apiError');

const sendOtp = catchAsync(async (req, res) => {
    const { email } = req.body;

    // Generate OTP and save to user/create temp record
    const { otp, isNewUser } = await authService.generateOTP(email);

    // Send OTP email
    await emailService.sendOTPEmail(email, otp);

    ResponseHandler.success(res, {
        isNewUser,
        message: `OTP sent to ${email}`
    }, 'OTP sent successfully');
});

const verifyOtp = catchAsync(async (req, res) => {
    const { email, otp, fullName, phone, deviceToken, deviceId, platform } = req.body;

    // Verify OTP and create/update user
    const result = await authService.verifyOTPAndAuthenticate({
        email,
        otp,
        fullName,
        phone,
        deviceInfo: { deviceToken, deviceId, platform }
    });

    ResponseHandler.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: result.isNewUser,
        isProfileComplete: result.user.isProfileComplete
    }, 'Login successful');
});

const googleLogin = catchAsync(async (req, res) => {
    const { idToken, deviceToken, deviceId, platform } = req.body;

    const result = await authService.googleAuthenticate({
        idToken,
        deviceInfo: { deviceToken, deviceId, platform }
    });

    ResponseHandler.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: result.isNewUser,
        isProfileComplete: result.user.isProfileComplete
    }, 'Login successful');
});

const facebookLogin = catchAsync(async (req, res) => {
    const { accessToken: fbToken, deviceToken, deviceId, platform } = req.body;

    const result = await authService.facebookAuthenticate({
        fbToken,
        deviceInfo: { deviceToken, deviceId, platform }
    });

    ResponseHandler.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: result.isNewUser,
        isProfileComplete: result.user.isProfileComplete
    }, 'Login successful');
});

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    ResponseHandler.success(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
    }, 'Token refreshed successfully');
});

module.exports = {
    sendOtp,
    verifyOtp,
    googleLogin,
    facebookLogin,
    refreshToken
};