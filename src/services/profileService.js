// ===== src/services/profileService.js =====
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const logger = require('../config/logger');

class ProfileService {
    async getUserProfile(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user;
    }

    async updateUserProfile(userId, updateData) {
        // Check if email is being updated
        if (updateData.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                throw new ApiError(400, 'Email already in use');
            }
        }

        // Check if phone is being updated
        if (updateData.phone) {
            const existingUser = await User.findOne({
                phone: updateData.phone,
                _id: { $ne: userId }
            });

            if (existingUser) {
                throw new ApiError(400, 'Phone number already in use');
            }
        }

        // Update profile completion status
        const user = await User.findById(userId);
        if (!user.isProfileComplete) {
            updateData.isProfileComplete = this.checkProfileCompletion({
                ...user.toObject(),
                ...updateData
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        logger.info(`Profile updated for user: ${userId}`);

        return updatedUser;
    }

    async removeDeviceToken(userId, deviceId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        user.deviceTokens = user.deviceTokens.filter(
            device => device.deviceId !== deviceId
        );

        await user.save();

        logger.info(`Device removed for user: ${userId}, deviceId: ${deviceId}`);
    }

    async deactivateAccount(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                isActive: false,
                deviceTokens: []
            },
            { new: true }
        );

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        logger.info(`Account deactivated for user: ${userId}`);

        return user;
    }

    async getUserDevices(userId) {
        const user = await User.findById(userId).select('deviceTokens');

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.deviceTokens.map(device => ({
            deviceId: device.deviceId,
            platform: device.platform,
            lastUsed: device.lastUsed
        }));
    }

    checkProfileCompletion(userData) {
        const requiredFields = ['email', 'fullName', 'phone'];
        return requiredFields.every(field => userData[field]);
    }
}

module.exports = new ProfileService();