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
module.exports = router;