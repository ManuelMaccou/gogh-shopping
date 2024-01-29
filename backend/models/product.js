const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ogImage: String,
    url: String,
    shippingDetails: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Product = mongoose.model('product', ProductSchema);

module.exports = Product;
