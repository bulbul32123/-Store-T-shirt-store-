// /**
//  * backend/scripts/seedReviews.js
//  * Run: node backend/scripts/seedReviews.js
//  */

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config({ path: path.join(__dirname, '../.env') });

// const Review = require('../models/Review');
// const User = require('../models/User');
// const Product = require('../models/Product');

// const REVIEWS = {
//   5: [
//     'Amazing quality. The print came out exactly as expected and the fabric feels premium.',
//     'Love this t-shirt. Colors are vibrant and the fit is perfect.',
//     'Exceeded my expectations. Will definitely order again.',
//     'Fast delivery and excellent material quality.',
//     'The custom design printed perfectly. Very impressed.'
//   ],
//   4: [
//     'Good quality overall. Delivery took a little longer than expected.',
//     'Comfortable fabric and nice print quality.',
//     'Very satisfied with the purchase.',
//     'Looks great after multiple washes.',
//     'Good value for the price.'
//   ],
//   3: [
//     'The shirt is okay but sizing runs slightly large.',
//     'Average quality. Nothing exceptional.',
//     'Print quality is decent but could be sharper.',
//     'Expected a bit more for the price.',
//     'Not bad but there is room for improvement.'
//   ],
//   2: [
//     'The fabric feels thinner than expected.',
//     'Print started fading after a few washes.',
//     'Sizing was not accurate.',
//     'Delivery took much longer than advertised.',
//     'Customer support response was slow.'
//   ],
//   1: [
//     'Very disappointed with the quality.',
//     'Received the wrong size and color.',
//     'Print was damaged when delivered.',
//     'Would not recommend this product.',
//     'Poor overall experience.'
//   ]
// };

// const IMAGE_POOL = [
//   {
//     url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
//     public_id: 'sample1'
//   },
//   {
//     url: 'https://res.cloudinary.com/demo/image/upload/shirt-review.jpg',
//     public_id: 'sample2'
//   },
//   {
//     url: 'https://res.cloudinary.com/demo/image/upload/customer-upload.jpg',
//     public_id: 'sample3'
//   }
// ];

// const VIDEO_POOL = {
//   url: 'https://res.cloudinary.com/demo/video/upload/review-video.mp4',
//   public_id: 'review-video'
// };

// const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// const randomDate = (days = 120) => {
//   const date = new Date();
//   date.setDate(date.getDate() - Math.floor(Math.random() * days));
//   return date;
// };

// async function seed() {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);

//     console.log('✅ MongoDB connected');

//     await Review.deleteMany({});
//     console.log('🗑 Existing reviews removed');

//     const users = await User.find({ role: 'user' }).select('_id');
//     const products = await Product.find().select('_id');

//     if (!users.length) {
//       throw new Error('No users found');
//     }

//     if (!products.length) {
//       throw new Error('No products found');
//     }

//     const reviews = [];

//     for (let i = 0; i < 200; i++) {
//       const ratingPool = [
//         5,5,5,5,5,
//         4,4,4,4,
//         3,3,
//         2,
//         1
//       ];

//       const rating = pick(ratingPool);

//       const statuses = [
//         'approved',
//         'approved',
//         'approved',
//         'approved',
//         'pending',
//         'rejected'
//       ];

//       const status = pick(statuses);

//       const review = {
//         product: pick(products)._id,
//         user: pick(users)._id,
//         rating,
//         reviewText: pick(REVIEWS[rating]),
//         status,
//         createdAt: randomDate(),
//         updatedAt: new Date()
//       };

//       // 35% image reviews
//       if (Math.random() < 0.35) {
//         review.images = [pick(IMAGE_POOL)];

//         if (Math.random() < 0.3) {
//           review.images.push(pick(IMAGE_POOL));
//         }
//       }

//       // 8% video reviews
//       if (Math.random() < 0.08) {
//         review.video = VIDEO_POOL;
//       }

//       reviews.push(review);
//     }

//     await Review.insertMany(reviews);

//     console.log(`✅ Seeded ${reviews.length} reviews`);

//     const breakdown = reviews.reduce((acc, r) => {
//       acc[r.status] = (acc[r.status] || 0) + 1;
//       return acc;
//     }, {});

//     console.log('📊 Status breakdown:', breakdown);

//     await mongoose.disconnect();

//     console.log('✅ Done');
//     process.exit(0);

//   } catch (err) {
//     console.error('❌ Seed failed:', err);
//     process.exit(1);
//   }
// }

// seed();