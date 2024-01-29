const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const user = await User.findOne({ pageId: uniqueId });

        if (!user || !user.pageHtml) {
            return res.status(404).send('Page not found');
        }

        res.send(user.pageHtml);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
