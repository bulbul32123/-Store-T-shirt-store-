const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parent', 'name slug')
            .sort({ name: 1 });

        res.status(200).json({ categories });
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find by ID or slug
        const category = await Category.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
                { slug: id }
            ]
        }).populate('parent', 'name slug');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, featured, parent } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create new category
        const category = new Category({
            name,
            description,
            featured: featured || false,
            parent: parent || null
        });

        // Handle image upload if provided
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            category.image = {
                url: result.url,
                public_id: result.public_id
            };
        }

        await category.save();

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, featured, parent } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check for circular reference when setting parent
        if (parent && parent.toString() === id.toString()) {
            return res.status(400).json({ message: 'Category cannot be its own parent' });
        }

        // Update fields
        category.name = name || category.name;
        category.description = description || category.description;

        if (featured !== undefined) {
            category.featured = featured;
        }

        if (parent !== undefined) {
            category.parent = parent || null;
        }

        // Handle image upload if provided
        if (req.file) {
            // Delete old image if exists
            if (category.image && category.image.public_id) {
                await deleteFromCloudinary(category.image.public_id);
            }

            const result = await uploadToCloudinary(req.file.path);
            category.image = {
                url: result.url,
                public_id: result.public_id
            };
        }

        // Update slug if name changed
        if (name && name !== category.name) {
            category.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        }

        await category.save();

        res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has products
        const productsCount = await Product.countDocuments({ category: id });

        if (productsCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete category with associated products',
                productsCount
            });
        }

        // Check if category has child categories
        const childCategoriesCount = await Category.countDocuments({ parent: id });

        if (childCategoriesCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete category with child categories',
                childCategoriesCount
            });
        }

        // Delete image from cloudinary if exists
        if (category.image && category.image.public_id) {
            await deleteFromCloudinary(category.image.public_id);
        }

        // Correct way to delete the document
        await Category.deleteOne({ _id: id });

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find category by ID or slug
        const category = await Category.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
                { slug: id }
            ]
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Get products in this category
        const products = await Product.find({ category: category._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments({ category: category._id });

        res.status(200).json({
            category,
            products,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching category products:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 