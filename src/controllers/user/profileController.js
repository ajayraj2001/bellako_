// ===== src/controllers/user/profileController.js =====
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const profileService = require('../../services/profileService');
const { deleteFile } = require('../../utils/fileHelper');
const ApiError = require('../../utils/apiError');

const getProfile = catchAsync(async (req, res) => {
    const user = await profileService.getUserProfile(req.user._id);

    ResponseHandler.success(res, {
        user,
        profileCompletionPercentage: user.profileCompletionPercentage
    }, 'Profile fetched successfully');
});

const updateProfile = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const updateData = req.body;

    // If file is uploaded, add to updateData
    if (req.file) {
        updateData.profileImg = `/profile_images/${req.file.filename}`;

        // Delete old image if exists
        if (req.user.profileImg) {
            await deleteFile(req.user.profileImg);
        }
    }

    const updatedUser = await profileService.updateUserProfile(userId, updateData);

    ResponseHandler.success(res, {
        user: updatedUser,
        profileCompletionPercentage: updatedUser.profileCompletionPercentage
    }, 'Profile updated successfully');
});

const logout = catchAsync(async (req, res) => {
    const { deviceId } = req.body;

    await profileService.removeDeviceToken(req.user._id, deviceId);

    ResponseHandler.success(res, null, 'Logged out successfully');
});

const deleteAccount = catchAsync(async (req, res) => {
    await profileService.deactivateAccount(req.user._id);

    ResponseHandler.success(res, null, 'Account deactivated successfully');
});

const getDevices = catchAsync(async (req, res) => {
    const devices = await profileService.getUserDevices(req.user._id);

    ResponseHandler.success(res, devices, 'Devices fetched successfully');
});

const removeDevice = catchAsync(async (req, res) => {
    const { deviceId } = req.params;

    await profileService.removeDeviceToken(req.user._id, deviceId);

    ResponseHandler.success(res, null, 'Device removed successfully');
});

module.exports = {
    getProfile,
    updateProfile,
    logout,
    deleteAccount,
    getDevices,
    removeDevice
};
