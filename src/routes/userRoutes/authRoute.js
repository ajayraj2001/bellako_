const express = require('express');
const router = express.Router();
const { authLimiter } = require('../../middlewares/rateLimiter');
const { validate } = require('../../middlewares/validation');
const authValidation = require('../../validations/authValidation');
const authController = require('../../controllers/user/authController');

// Authentication routes with rate limiting
router.post('/send-otp',
  authLimiter,
  validate(authValidation.sendOtp),
  authController.sendOtp
);

router.post('/verify-otp',
  authLimiter,
  validate(authValidation.verifyOtp),
  authController.verifyOtp
);

router.post('/google',
  authLimiter,
  validate(authValidation.socialLogin),
  authController.googleLogin
);

router.post('/facebook',
  authLimiter,
  validate(authValidation.socialLogin),
  authController.facebookLogin
);

router.post('/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshToken
);

module.exports = router;
