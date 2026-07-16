const Product = require('../models/Product');

exports.generateUniqueSlug = async (name, existingId = null) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let slugExists = true;
  let counter = 1;
  
  while (slugExists) {
    const query = { slug };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    
    const existingProduct = await Product.findOne(query);
    
    if (!existingProduct) {
      slugExists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      slugExists = false;
    }
  }
  
  return slug;
}; 