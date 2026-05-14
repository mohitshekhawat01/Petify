const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  benefits: [{
    type: String,
  }],
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
    enum: ['Dogs', 'Cats', 'Birds', 'Fish', 'Dogs/Accessories', 'Dogs/Beds', 'Dogs/Treats', 'Dogs/Toys', 'Dogs/Clothing', 'Dogs/Feeding', 'Dogs/Health', 'Dogs/Grooming', 'Dogs/Training', 'Dogs/Tech', 'Dogs/Travel', 'Dogs/Comfort', 'Dogs/Safety', 'Dogs/Subscription', 'Dogs/Food', 'Cats/Treats', 'Cats/Toys', 'Cats/Furniture', 'Cats/Litter', 'Cats/Food', 'Cats/Grooming', 'Cats/Travel', 'Cats/Feeding', 'Cats/Beds', 'Cats/Health', 'Cats/Tech', 'Cats/Comfort', 'Cats/Subscription', 'Cats/Accessories', 'Birds/Housing', 'Birds/Food', 'Birds/Health', 'Birds/Accessories', 'Birds/Toys', 'Birds/Starter', 'Birds/Treats', 'Birds/Training', 'Birds/Travel', 'Birds/Feeding', 'Fish/Tanks', 'Fish/Food', 'Fish/Equipment', 'Fish/Lighting', 'Fish/Decor', 'Fish/Plants', 'Fish/Water Care', 'Fish/Tools', 'Fish/Maintenance', 'Fish/Accessories', 'Fish/Health', 'Fish/Starter'],
  },
  subcategory: {
    type: String,
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    required: true,
    default: 100,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  badge: {
    type: String,
  },
  emoji: {
    type: String,
  },
  specifications: {
    type: Map,
    of: String,
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
