const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const generateProductImage = require('../utils/productImageGenerator');
const generateDescriptionImage = require('../utils/descriptionImageGenerator');

// POST route to add a new product
router.post('/add', auth, async (req, res) => {
  try {
    const productData = req.body;
    console.log("Received product data:", productData.image);

    let generatedProductImage, generatedDescriptionImage;

    try {
      generatedProductImage = await generateProductImage(productData);
      console.log("Generated Product Image URL:", generatedProductImage.substring(0, 30));
    } catch (error) {
      console.error("Error generating product image:", error);
    } 

    try {
      generatedDescriptionImage = await generateDescriptionImage(productData);
      console.log("Generated Description Image URL:", generatedDescriptionImage.substring(0, 30));
    } catch (error) {
      console.error("Error generating description image:", error);
    }

    productData.productFrame = generatedProductImage;
    productData.descriptionFrame = generatedDescriptionImage;

    if (productData.productFrame && productData.descriptionFrame) {
      console.log("Product data with product frame:", productData.productFrame.substring(0, 30));
      console.log("Product data with description frame:", productData.descriptionFrame.substring(0, 30));
    } else {
      console.error("Product or description frame generation failed.");
    }

    const newProduct = new Product(productData);

    await newProduct.save();
    console.log("New product saved:", newProduct.descriptionFrame.substring(0, 30));

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

router.put('/update/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const productData = req.body;
  try {
    let generatedProductImage, generatedDescriptionImage;

    try {
      generatedProductImage = await generateProductImage(productData);
    } catch (error) {
      console.error("Error generating product image:", error);
      return res.status(500).send("Error generating product image");
    }

    try {
      generatedDescriptionImage = await generateDescriptionImage(productData);
    } catch (error) {
      console.error("Error generating description image:", error);
      return res.status(500).send("Error generating description image");
    }

    // Update the product data with the new image URLs
    productData.productFrame = generatedProductImage;
    productData.descriptionFrame = generatedDescriptionImage;

    const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in PUT /api/products/update:', error);
    res.status(500).send("Server error");
  }
});

router.delete('/delete/:productId', auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user;

    // Verify ownership and delete products
    const product = await Product.findOne({ _id: productId, user: userId });
        if (!product) {
            return res.status(403).json({ message: "Unauthorized action or product not found" });
        }

    // Delete the product from the Product collection
    await Product.deleteOne({ _id: productId });

    // Remove product ID from user's products array
    await User.findByIdAndUpdate(userId, { $pull: { products: productId } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/products/delete:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to handle redirection
router.get('/redirect/:productId', async (req, res) => {
  try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);

      if (product && product.url) {
          return res.redirect(product.url);
      } else {
          return res.status(404).send('Product or URL not found');
      }
  } catch (err) {
      console.error('Error in GET /redirect/:productId', err);
      res.status(500).send('Internal Server Error');
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
    // console.log(`Fetching products for page ID: ${req.params.pageId}`);
    const pageId = req.params.pageId;
    const user = await User.findOne({ pageId: pageId }).exec();
    if (!user) {
      // console.log(`User not found for page ID: ${pageId}`);
      return res.status(404).send('User not found');
    }

    // console.log(`User found: ${user._id}`);
    const products = await Product.find({ user: user._id }).exec();

    // console.log(`Number of products found: ${products.length}`);
    res.json(products);
  } catch (error) {
    console.error('Error in GET /api/products/by-page/:pageId:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
