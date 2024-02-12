const express = require('express');
const router = express.Router();
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');

router.get('/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(DATA_DIR, `${filename}.csv`);

    // Validate the filename to prevent directory traversal attacks
    if (!filename.includes('..') && !filename.includes('/') && !filename.includes('\\')) {
        res.download(filePath, (err) => {
            if (err) {
                // Handle error, but don't reveal too much to the client
                console.error('Error downloading the file:', err);
                res.status(500).send('Error downloading the file');
            }
        });
    } else {
        // Invalid filename provided
        res.status(400).send('Invalid request');
    }
});

module.exports = router;
