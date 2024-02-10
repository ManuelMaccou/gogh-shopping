const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/', auth, async (req, res) => {
    const { targetFid } = req.body;
    const adminUser = await User.findById(req.user);

    if (!adminUser || !adminUser.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
    }

    const targetUser = await User.findOne({ fid: targetFid });
    if (!targetUser) {
        return res.status(404).json({ message: "Target user not found." });
    }

    const token = jwt.sign({ userId: targetUser.id }, process.env.JWT_SECRET, { expiresIn: '48h' });
    res.json({ token, redirect: '/submit-product' });
});

module.exports = router;