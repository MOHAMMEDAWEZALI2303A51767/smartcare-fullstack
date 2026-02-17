const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorMiddleware');
const { ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE } = require('../config/constants');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG) are allowed!', 400), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and image files are allowed!', 400), false);
  }
};

// File filter for any allowed file
const anyFileFilter = (req, file, cb) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type!', 400), false);
  }
};

// Create upload middleware for images
const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: imageFileFilter,
});

// Create upload middleware for documents
const uploadDocument = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: documentFileFilter,
});

// Create upload middleware for any file
const uploadAny = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: anyFileFilter,
});

// Upload to memory (for Cloudinary)
const storageMemory = multer.memoryStorage();

const uploadImageMemory = multer({
  storage: storageMemory,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: imageFileFilter,
});

const uploadDocumentMemory = multer({
  storage: storageMemory,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: documentFileFilter,
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
};

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAny,
  uploadImageMemory,
  uploadDocumentMemory,
  handleMulterError,
};
