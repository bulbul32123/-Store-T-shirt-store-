
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const { deleteProductImage } = require('../controllers/productController');
const cloudinary = require('cloudinary').v2;

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `video-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const videoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = [
    'video/mp4',
    'video/quicktime', 
    'video/webm',
    'video/3gpp',      
  ];
  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Accepted formats: MP4, MOV, WEBM'), false);
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: videoFileFilter
});

router.post('/video', protect, (req, res, next) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Video too large. Max size is 50MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No video file provided' });

  const localPath = req.file.path;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'video',
      folder: 'reviews/videos',
      chunk_size: 6 * 1024 * 1024
    });

    fs.unlink(localPath, (err) => {
      if (err) console.error('Failed to delete local video file:', err);
    });

    res.status(200).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    fs.unlink(localPath, () => {});
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Video upload failed', error: error.message });
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];


  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext)) {
      console.log(`Accepting file based on extension: ${ext}`);
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Accepted formats: JPEG, JPG, PNG, WEBP, GIF`), false);
    }
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
router.post('/', protect, admin, (req, res, next) => {
  const isWebp = req.headers['content-type'] &&
    req.headers['content-type'].includes('webp');

  console.log('Upload request received:', {
    contentType: req.headers['content-type'],
    isWebp: isWebp
  });

  if (isWebp) {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer error (disk):', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  } else {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer error (disk):', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }
}, uploadImage);
router.post('/review-image', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  const localPath = req.file.path;
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'reviews/images',
      transformation: [{ width: 1000, crop: 'limit' }]
    });
    fs.unlink(localPath, () => {});
    res.status(200).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    fs.unlink(localPath, () => {});
    console.error('Review image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

router.delete('/:public_id', protect, admin, deleteProductImage);
router.get('/test-cloudinary', async (req, res) => {
  try {
    const testConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };
    const sanitizedConfig = { ...testConfig };
    delete sanitizedConfig.api_secret;

    cloudinary.config(testConfig);

    const result = await cloudinary.api.ping();

    res.status(200).json({
      message: 'Cloudinary connection successful',
      status: result.status
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});
router.get('/health', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    let dirStatus = 'missing';

    if (fs.existsSync(uploadsDir)) {
      dirStatus = 'exists';
      const testFile = path.join(uploadsDir, `test-${Date.now()}.txt`);
      try {
        fs.writeFileSync(testFile, 'Test file');
        fs.unlinkSync(testFile);
        dirStatus = 'writable';
      } catch (fsError) {
        dirStatus = 'not writable';
      }
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    let cloudinaryStatus = 'unchecked';
    try {
      const result = await cloudinary.api.ping();
      cloudinaryStatus = 'connected';
    } catch (cloudinaryError) {
      cloudinaryStatus = 'error: ' + cloudinaryError.message;
    }

    res.status(200).json({
      service: 'Upload service',
      status: 'online',
      uploads_directory: {
        path: uploadsDir,
        status: dirStatus
      },
      cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        status: cloudinaryStatus
      },
      supported_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    });
  } catch (error) {
    res.status(500).json({
      service: 'Upload service',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router; 