const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const Product = require('../models/product');
const User = require('../models/user');

router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user;
        const uniqueId = uuidv4();
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const products = await Product.find({ user: userId });

        if (products.length === 0) {
            return res.status(404).send('No products found');
        }
        const product = products[0];


        user.pageId = uniqueId;
        user.framesMeta = {
            ogTitle: `${user.username}'s product page on Gogh Shopping`,
            ogDescription: "Sell anything on Farcaster",
            ogImage: product.image,
            fcFrame: "vNext",
            fcFramePostUrl: `${process.env.BASE_URL}/api/frames/frame/${uniqueId}`,
            fcFrameImage: product.ogImage,
            fcFrameButton1: "prev",
            fcFrameButton2: "next"
        };

        await user.save();

        res.json({ url: `${process.env.BASE_URL}/product-page/${uniqueId}` });
    } catch (err) {
        console.error('Error in generate-page:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;