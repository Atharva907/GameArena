import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to count products in this category
CategorySchema.methods.countProducts = async function() {
  // Import Product model here to avoid circular dependency
  const Product = mongoose.model('Product');
  return await Product.countDocuments({ category: this._id });
};

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;
