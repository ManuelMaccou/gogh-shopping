const express = require('express');
const User = require('../models/user');
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

        user = new User({ email, password, username });
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

module.exports = router;
