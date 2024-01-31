const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Product = require('../models/product');

// Get a specific product by index for a user
async function getProductAndUser(uniqueId, productIndex) {
    const user = await User.findOne({ pageId: uniqueId }).populate('products');
    if (!user || !user.products || user.products.length === 0 || !user.products[productIndex]) {
        return { product: null, username: null };
    }

    return { product: user.products[productIndex], username: user.username };
}

router.get('/frame/:uniqueId', async (req, res) => {
    // Default to the first product for the initial GET request
    const productIndex = 0; // Always show the first product initially
    const { product, username } = await getProductAndUser(req.params.uniqueId, productIndex);

    if (!product) {
        return res.status(404).send('No products found');
    }

    res.send(generateFrameHtml(product, username, req.params.uniqueId, productIndex));
});

router.post('/frame/:uniqueId', async (req, res) => {
    
    try {
        const uniqueId = req.params.uniqueId;
        const buttonIndex = req.body.untrustedData.buttonIndex;
        let productIndex = parseInt(req.query.index) || 0;

        // Increment or decrement index based on the index
        if (buttonIndex === 1) { // 'prev' button
            productIndex--;
        } else if (buttonIndex === 2) { // 'next' button
            productIndex++;
        }

        const { product, username } = await getProductAndUser(uniqueId, productIndex);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Send updated frame HTML with the new product and index
        res.status(200).send(generateFrameHtml(product, username, uniqueId, productIndex));
    } catch (err) {
        console.error('Error in POST /frame/:uniqueId', err);
        res.status(500).send('Internal Server Error');
    }
});

// Helper function to generate frame HTML
function generateFrameHtml(product, username, uniqueId, productIndex) {
    const postUrl = `${process.env.BASE_URL}/api/frames/frame/${uniqueId}?index=${productIndex}`;

    return `
        <!DOCTYPE html>
        <html>
            <head>
            <title>${username}'s Products</title>
                <meta name="description" content="${username}'s products">
                <meta property="og:url" content="${product.url}">
                <meta property="og:image" content="${product.image}">
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:post_url" content="${postUrl}">
                <meta property="fc:frame:image" content="${product.ogImage}" />
                <meta property="fc:frame:button:1" content="prev" />
                <meta property="fc:frame:button:2" content="next" />
            </head>
        </html>
    `;
}

module.exports = router;