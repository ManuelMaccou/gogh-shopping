const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ogImage: String,
    url: String,
    price: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Product = mongoose.model('product', ProductSchema);

module.exports = Product;
