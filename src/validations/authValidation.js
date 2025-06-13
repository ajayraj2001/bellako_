// ===== src/validations/auth.validation.js =====
const Joi = require('joi');

const sendOtp = {
    body: Joi.object().keys({
        email: Joi.string().email().required().lowercase().trim()
    })
};

const verifyOtp = {
    body: Joi.object().keys({
        email: Joi.string().email().required().lowercase().trim(),
        otp: Joi.string().length(6).required(),
        fullName: Joi.string().min(2).max(50).trim().optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
        deviceToken: Joi.string().optional(),
        deviceId: Joi.string().optional(),
        platform: Joi.string().valid('ios', 'android', 'web').optional()
    })
};

const socialLogin = {
    body: Joi.object().keys({
        idToken: Joi.string().when('$path', {
            is: Joi.string().pattern(/google/),
            then: Joi.required()
        }),
        accessToken: Joi.string().when('$path', {
            is: Joi.string().pattern(/facebook/),
            then: Joi.required()
        }),
        deviceToken: Joi.string().optional(),
        deviceId: Joi.string().optional(),
        platform: Joi.string().valid('ios', 'android', 'web').optional()
    })
};

const refreshToken = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required()
    })
};

module.exports = {
    sendOtp,
    verifyOtp,
    socialLogin,
    refreshToken
};
