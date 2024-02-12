const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        console.log("Requested Unique ID:", uniqueId);

        const user = await User.findOne({ pageId: uniqueId });
        console.log("User found:", user);

        if (!user) {
            console.log("No user found for Unique ID:", uniqueId);
            return res.status(404).send('User not found');
        }

        // Check if pageHtml is specifically undefined or null
        if (user.pageHtml === undefined || user.pageHtml === null) {
            console.log("User found but no pageHtml for Unique ID:", uniqueId);
            return res.status(404).send('Page HTML not found');
        }

        res.send(user.pageHtml);
    } catch (err) {
        console.error('Error in GET /:uniqueId', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
