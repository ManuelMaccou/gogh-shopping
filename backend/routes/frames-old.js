const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Product = require('../models/product');

// Fet a random product for a user
async function getRandomProductAndUser(uniqueId) {
    const user = await User.findOne({ pageId: uniqueId }).populate('products');
    if (!user || !user.products || user.products.length === 0) {
        return { product: null, username: null };
    }

    const randomIndex = Math.floor(Math.random() * user.products.length);
    return { product: user.products[randomIndex], username: user.username };
}



router.get('/frame/:uniqueId', async (req, res) => {
    try {
        console.log("GET Frame route hit for uniqueId:", req.params.uniqueId);
        const uniqueId = req.params.uniqueId;
        const { product, username } = await getRandomProductAndUser(uniqueId);

        if (!product) {
            return res.status(404).send('No products found');
        }

        res.send(generateFrameHtml(product, username, uniqueId));
    } catch (err) {
        console.error('Error in GET /frame/:uniqueId', err);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/frame/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;

        const { product, username } = await getRandomProductAndUser(uniqueId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.status(200).send(generateFrameHtml(product, username, uniqueId));
    } catch (err) {
        console.error('Error in POST /frame/:uniqueId', err);
        res.status(500).send('Internal Server Error');
    }
});

// Helper function to generate frame HTML
function generateFrameHtml(product, username, uniqueId) {
    return `
        <!DOCTYPE html>
        <html>
            <head>
            <title>${username}'s Products</title>
                <meta name="description" content="${username}'s products">
                <meta name="fc:frame:post_url" content="${process.env.REACT_APP_BACKEND_URL}/api/frames/frame/${uniqueId}">
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${product.ogImage}" />
                <meta property="fc:frame:button:1" content="next" />
                <meta property="fc:frame:button:2" content="prev" />
            </head>
        </html>
    `;
}

module.exports = router;
