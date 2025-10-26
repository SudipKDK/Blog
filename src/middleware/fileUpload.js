import multer from 'multer';
import path from 'path';
import { config } from '../config/config.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads/'));  
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${config.ALLOWED_FILE_TYPES.join(', ')} are allowed.`), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        error: 'Unexpected field name.' 
      });
    }
  }
  
  if (error && error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
  
  next(error);
};

export const uploadSingle = upload.single('coverImage');
