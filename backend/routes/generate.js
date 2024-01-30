const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const Product = require('../models/product');
const User = require('../models/user');

router.post('/', auth, async (req, res) => {
    console.log("Generate Page route hit");
    try {
        const userId = req.user;
        console.log("User ID:", userId);

        const uniqueId = uuidv4();
        console.log("Generated Unique ID:", uniqueId);

        const user = await User.findById(userId);
        console.log("Found User:", user);
        if (!user) {
            console.log("User not found for ID:", userId);
            return res.status(404).send('User not found');
        }

        const username = user.username;
        console.log("Username:", username);

        const products = await Product.find({ user: userId });
        if (products.length === 0) {
            console.log("No products found for user:", userId);
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
                <meta property="og:image" content="${product.image}">
                <meta property="fc:frame" content="vNext" />
                <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/frames/frame/${uniqueId}">
                <meta property="fc:frame:image" content="${product.ogImage}">
                <meta property="fc:frame:button:1" content="next" />
                <meta property="fc:frame:button:2" content="prev" />
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