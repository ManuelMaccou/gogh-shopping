const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Product = require('../models/product');

// Get a specific product by index for a user
async function getProductAndUser(uniqueId, productIndex) {
    const user = await User.findOne({ pageId: uniqueId }).populate('products');
    if (!user) {
        // console.error(`User not found with pageId: ${uniqueId}`);
        return { product: null, username: null };
    }

    if (!user.products || user.products.length === 0 || !user.products[productIndex]) {
        // console.error(`Product not found or out of index range for user: ${uniqueId}`);
        return { product: null, username: null };
    }

    return { product: user.products[productIndex], username: user.username };
}

router.get('/frame/:uniqueId', async (req, res) => {
    const productIndex = 0; // Always show the first product initially
    const { product, username } = await getProductAndUser(req.params.uniqueId, productIndex);

    if (!product) {
        return res.status(404).send('No products found');
    }

    res.send(generateFrameHtml(product, username, req.params.uniqueId, productIndex));
});

router.post('/frame/:uniqueId', async (req, res) => {
    console.log('Request Body:', req.body);
    const uniqueId = req.params.uniqueId;
    const buttonIndex = req.body.untrustedData.buttonIndex;
    let productIndex = parseInt(req.query.index) || 0;
    let frameType = req.query.frameType || 'productFrame';

    try {
        const user = await User.findOne({ pageId: uniqueId }).populate('products');
        if (!user) {
            return res.status(404).send('User not found');
        }
        const totalProducts = user.products.length;
        console.log("total products:", totalProducts);

        const { product, username } = await getProductAndUser(uniqueId, productIndex);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        if (frameType === 'descriptionFrame') {
            if (buttonIndex === 1) { // 'back' button
                frameType = 'productFrame';
            
            } else if (buttonIndex === 2) { // 'buy' button
                const redirectUrl = `${process.env.BASE_URL}/api/products/redirect/${product._id}`;
                console.log("redirectURL:", redirectUrl)
                if (product.url) {
                    res.setHeader('Location', redirectUrl);
                    // console.log('Response Headers (before sending):', res.getHeaders());
                    return res.status(302).send();
                } else {
                    return res.status(404).send('Redirect URL not found');
                }
            }
            console.log(`frameType: ${frameType}, buttonIndex: ${buttonIndex}`);

        } else {
            // frameType is productFrame
            if (buttonIndex === 1) { // 'prev' button
                productIndex = (productIndex - 1 + totalProducts) % totalProducts;
            } else if (buttonIndex === 3) { // 'next' button
                productIndex = (productIndex + 1) % totalProducts;
            }
            frameType = 'productFrame';

            const { product, username } = await getProductAndUser(uniqueId, productIndex);
            if (!product) {
                return res.status(404).send('Product not found');
            }

            // Handling the 'more info' button
            if (buttonIndex === 2) {
                frameType = 'descriptionFrame'
            }

            // console.log('Response Headers (before sending):', res.getHeaders());
            res.status(200).send(generateFrameHtml(product, username, uniqueId, productIndex, frameType));
            // console.log('Response Headers (after sending):', res.getHeaders());
        }
    } catch (err) {
        console.error('Error in POST /frame/:uniqueId', err);
        res.status(500).send('Internal Server Error');
    }
});

// Helper function to generate frame HTML
function generateFrameHtml(product, username, uniqueId, productIndex, frameType = 'productFrame') {
    const postUrl = `${process.env.BASE_URL}/api/frames/frame/${uniqueId}?index=${productIndex}&frameType=${frameType}`;

    // Determine which frame to show based on the frameType parameter
    const frameContent = frameType === 'descriptionFrame' ? product.descriptionFrame : product.productFrame;

    // Dynamically set buttons based on the frameType
    let buttonsHtml = '';
    if (frameType === 'descriptionFrame') {
        // Define buttons for descriptionFrame
        buttonsHtml = `
            <meta property="fc:frame:button:1" content="back" />
            <meta property="fc:frame:button:2" content="buy" />
            <meta property="fc:frame:button:2:action" content="post_redirect" />
        `;
    } else {
        // Default button set for productFrame
        buttonsHtml = `
            <meta property="fc:frame:button:1" content="prev" />
            <meta property="fc:frame:button:2" content="more info" />
            <meta property="fc:frame:button:3" content="next" />
        `;
    }

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
            <meta property="fc:frame:image" content="${frameContent}">
            ${buttonsHtml}
        </head>
        </html>
    `;
}

module.exports = router;