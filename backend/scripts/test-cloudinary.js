require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

console.log('Environment variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET (ends with ' + process.env.CLOUDINARY_API_KEY.slice(-4) + ')' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET (length: ' + process.env.CLOUDINARY_API_SECRET.length + ')' : 'NOT SET');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const testDir = path.join(__dirname, 'test');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

const testFile = path.join(testDir, 'test-image.png');
const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(testFile, pngData);

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'test',
      resource_type: 'auto'
    });
    
    console.log('SUCCESS! Image uploaded to Cloudinary');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    console.log('Deleting test image from Cloudinary...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Test image deleted');
    
    fs.unlinkSync(testFile);
    console.log('Local test file deleted');
  } catch (error) {
    console.error('CLOUDINARY TEST FAILED:');
    console.error(error);
    console.error('\nPlease check your Cloudinary credentials and internet connection.');
  }
}

testCloudinary(); 