const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    productFrame: { type: String, required: true },
    descriptionFrame: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String, required: true },
    price: { type: String, required: false },
    stock: Boolean,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Product = mongoose.model('product', ProductSchema);

module.exports = Product;
