// ===== src/middlewares/fileUpload.js =====
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

const getFileUploader = (fieldName, uploadDir, options = {}) => {
  // Create upload directory if it doesn't exist
  const fullUploadPath = path.join('public', uploadDir);
  if (!fs.existsSync(fullUploadPath)) {
    fs.mkdirSync(fullUploadPath, { recursive: true });
  }

  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullUploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  });

  // File filter
  const fileFilter = (req, file, cb) => {
    if (options.allowedTypes) {
      if (options.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`), false);
      }
    } else {
      cb(null, true);
    }
  };

  // Configure multer
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: options.maxSize || 10 * 1024 * 1024 // Default 10MB
    }
  });

  return upload.single(fieldName);
};

const getMultipleFileUploader = (fieldName, uploadDir, maxCount, options = {}) => {
  // Create upload directory if it doesn't exist
  const fullUploadPath = path.join('public', uploadDir);
  if (!fs.existsSync(fullUploadPath)) {
    fs.mkdirSync(fullUploadPath, { recursive: true });
  }

  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullUploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  });

  // File filter
  const fileFilter = (req, file, cb) => {
    if (options.allowedTypes) {
      if (options.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`), false);
      }
    } else {
      cb(null, true);
    }
  };

  // Configure multer
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: options.maxSize || 10 * 1024 * 1024 // Default 10MB
    }
  });

  return upload.array(fieldName, maxCount);
};

module.exports = {
  getFileUploader,
  getMultipleFileUploader
};