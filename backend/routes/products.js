// products.js route
const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAvailableColors,
  uploadProductImages,
  deleteProductImage,
  addProductReview,
  getFeaturedProducts,
  getPopularProducts,
  deleteColorImage,
  addColorImages
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/popular', getPopularProducts);
router.get("/colors/available", getAvailableColors);
router.get('/:id', getProductById);



router.post('/:id/colors/images', protect, admin, upload.array('images', 5), addColorImages);
router.delete('/:id/colors/:colorName/images/:imageIndex', protect, admin, deleteColorImage);

router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/upload', protect, admin, upload.array('images', 5), uploadProductImages);
router.delete('/:id/images/:imageId', protect, admin, deleteProductImage);

module.exports = router; 