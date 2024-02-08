const express = require('express');
const User = require('../models/user');
const Store = require('../models/store');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate a unique merchant ID
        const { nanoid } = await import('nanoid');
        const merchantId = nanoid(6);
        const fid = nanoid(6)

        user = new User({ email, password, username, merchantId, fid });
        await user.save();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '48h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '48h' });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get('/get-page-id', auth, async (req, res) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId);
        if (!user || !user.pageId) {
            console.log("Page ID not found for User:", user);
            return res.status(404).json({ message: "Page ID not found" });
        }
        res.json({ pageId: user.pageId });
    } catch (err) {
        console.error('Error in get-page-id:', err);
        res.status(500).send('Server error');
    }
});

router.get('/check-page-status', auth, async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user already has a pageId and pageHtml
        const hasPage = user.pageId && user.pageHtml ? true : false;
        const response = {
            hasPage: hasPage,
            pageId: user.pageId ? user.pageId : null,
        };

        res.json(response);
    } catch (err) {
        console.error('Error in /check-page-status:', err);
        res.status(500).send('Server error');
    }
});

router.get('/check-merchant-status', auth, async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Missing user ID in request.' });
    }
    
    try {
        const user = await User.findById(userId).select('fid');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const stores = await Store.find({ storeAdmin: userId });
        const hasStore = stores.length > 0;
        res.json({ success: true, hasStore, stores, fid: user.fid });
    } catch (error) {
        console.error("Error checking merchant status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
