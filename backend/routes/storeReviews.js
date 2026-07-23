
const express          = require('express');
const router           = express.Router();
const {
  protect,
  admin,
} = require("../middleware/authMiddleware");
const reviewController = require('../controllers/reviewController');



router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.post('/products/:productId/reviews', protect, reviewController.submitReview);


router.put('/reviews/:id', protect, reviewController.editReview);
router.get('/reviews/reports', reviewController.getReportedReviews);


router.post('/reviews/:id/like', protect, reviewController.likeReview);

router.post('/reviews/:id/dislike', protect, reviewController.dislikeReview);

router.post('/reviews/:id/report', protect, reviewController.reportReview);
router.get('/reviews/:id', protect, admin,reviewController.getReviewById); 

module.exports = router;