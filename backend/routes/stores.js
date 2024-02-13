const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Store = require('../models/store');

router.post('/create', auth, async (req, res) => {
    const userId = req.user;
    const { image, storeName, storeDescription } = req.body;

    try {

        console.log("Creating store with userId as storeAdmin:", userId);
        const newStore = await Store.create({
            storeName,
            storeDescription,
            image,
            storeAdmin: userId
        });

        res.json({ success: true, store: newStore });
    } catch (error) {
        console.error("Error creating store:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get('/books', async (req, res) => {

    const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Gogh Books</title>
            <meta name="description" content="A collection of books in the Gogh Mall" />
            <meta property="og:url" content="https://www.gogh.shopping" />
            <meta property="og:image" content="https://aef8cbb778975f3e4df2041ad0bae1ca.cdn.bubble.io/f1707758185839x994545746657761400/book-store-frame.jpg" />
            <meta property="fc:frame" content="vNext" />
            <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/search/books?initial=true" />
            <meta property="fc:frame:image" content="https://aef8cbb778975f3e4df2041ad0bae1ca.cdn.bubble.io/f1707758185839x994545746657761400/book-store-frame.jpg" />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:button:1" content="Search" />
            <meta property="fc:frame:input:text" content="Search books" />
        </head>
    </html>
    `;

    res.send(htmlContent);

});

module.exports = router;