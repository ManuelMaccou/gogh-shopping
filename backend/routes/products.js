const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const generateProductImage = require('../utils/imageGenerator');

// POST route to add a new product
router.post('/add', auth, async (req, res) => {
  try {
    const productData = req.body;

    const generatedImage = await generateProductImage(productData);

    productData.ogImage = generatedImage;

    const newProduct = new Product(productData);

    await newProduct.save();

    // Extract user ID from JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Add product ID to user's products array
    await User.findByIdAndUpdate(userId, { $push: { products: newProduct._id } });

    res.status(201).send(newProduct);
  } catch (err) {
    console.error('Error in POST /api/products/add:', err);
    res.status(500).send(err.message);
  }
});

// Fetch user's products
router.get('/user-products', auth, async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
          return res.status(400).json({ message: "User ID not found" });
        }
        const products = await Product.find({ user: userId });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/by-page/:pageId', async (req, res) => {
  try {
      const pageId = req.params.pageId;
      const user = await User.findOne({ pageId: pageId }).exec();
      if (!user) {
          return res.status(404).send('User not found');
      }

      const products = await Product.find({ user: user._id }).exec();
      res.json(products);
  } catch (error) {
      console.error('Error in GET /api/products/by-page/:pageId:', error);
      res.status(500).send('Server error');
  }
});


module.exports = router;
