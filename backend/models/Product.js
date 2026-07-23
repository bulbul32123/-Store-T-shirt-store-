

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    sizes: {
      type: [String],
      default: ["M"],
    },
    colors: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          code: {
            type: String,
            required: true,
          },
          images: [
            {
              url: {
                type: String,
                required: true,
              },
              public_id: {
                type: String,
                required: true,
              },
            },
          ],
        },
      ],
      validate: {
        validator: function (colors) {
          if (!colors.length) return true;

          return colors.every(
            (color) =>
              color.name &&
              typeof color.name === "string" &&
              color.code &&
              typeof color.code === "string" &&
              Array.isArray(color.images),
          );
        },
        message: "Each color must have name, code, and images array",
      },
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        review: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    newDrop: {
      type: Boolean,
      default: false,
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ popular: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });

productSchema.virtual('allImages').get(function() {
    let allImages = [...this.images]; 
    
    this.colors.forEach(color => {
        allImages = allImages.concat(color.images);
    });
    
    return allImages;
});

productSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
        this.numReviews = this.ratings.length;
    } else {
        this.averageRating = 0;
        this.numReviews = 0;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;