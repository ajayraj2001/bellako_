// ===== src/routes/userRoutes/profile.route.js =====
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validation');
const profileValidation = require('../../validations/profileValidation');
const profileController = require('../../controllers/user/profileController');
const { getFileUploader } = require('../../middlewares/fileUpload');

const uploadProfileImage = getFileUploader('profile_img', 'profile_images', {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
});

router.get('/',
    authenticateUser,
    profileController.getProfile
);

router.put('/',
    authenticateUser,
    uploadProfileImage,
    validate(profileValidation.updateProfile),
    profileController.updateProfile
);

router.post('/logout',
    authenticateUser,
    profileController.logout
);

// ===== Additional Routes for Profile =====
router.get('/devices',
    authenticateUser,
    profileController.getDevices
);

router.delete('/devices/:deviceId',
    authenticateUser,
    profileController.removeDevice
);

router.delete('/deactivate',
    authenticateUser,
    profileController.deleteAccount
);

module.exports = router;