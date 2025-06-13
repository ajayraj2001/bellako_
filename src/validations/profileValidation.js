// ===== src/validations/profileValidation.js =====
const Joi = require('joi');

const updateProfile = {
    body: Joi.object().keys({
        fullName: Joi.string().min(2).max(50).trim().optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
        dateOfBirth: Joi.date().max('now').optional(),
        gender: Joi.string().valid('male', 'female', 'other').optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            zipCode: Joi.string().optional()
        }).optional()
    })
};

const changePassword = {
    body: Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    })
};

module.exports = {
    updateProfile,
    changePassword
};