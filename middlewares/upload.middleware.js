const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { errorResponse } = require('../helpers/response.helper');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  }
});

exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return errorResponse(res, `Multer error: ${err.message}`, 400);
      } else if (err) {
        return errorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

exports.uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return errorResponse(res, `Multer error: ${err.message}`, 400);
      } else if (err) {
        return errorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

exports.uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return errorResponse(res, `Multer error: ${err.message}`, 400);
      } else if (err) {
        return errorResponse(res, err.message, 400);
      }
      next();
    });
  };
};
