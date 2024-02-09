const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const Product = require('../models/product');
const User = require('../models/user');
const Store = require('../models/store');

router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user;
        const uniqueId = uuidv4();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch the store associated with the user
        const store = await Store.findOne({ storeAdmin: userId });
        if (!store) {
            return res.status(404).send('Store not found');
        }

        const username = user.username;

        const products = await Product.find({ user: userId });
        if (products.length === 0) {
            return res.status(404).send('No products found');
        }
        const product = products[0];

        const pageHtml = `
        <!DOCTYPE html>
        <html>
            <head>
            <title>${username}'s Products</title>
                <meta name="description" content="${username}'s products">
                <meta property="og:url" content="${product.url}">
                <meta property="og:image" content="${store.image}">
                <meta property="fc:frame" content="vNext" />
                <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/frames/frame/${uniqueId}?initial=true">
                <meta property="fc:frame:image" content="${store.image}">
                <meta property="fc:frame:button:1" content="Start Shopping" />
            </head>
        </html>
        `;

        await User.findByIdAndUpdate(userId, 
            { 
                $set: { 
                    pageId: uniqueId,
                    pageHtml: pageHtml
                }
            },
            { new: true }
        );

        res.json({ url: `${process.env.BASE_URL}/product-page/${uniqueId}` });
    } catch (err) {
        console.error('Error in generate-page:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;