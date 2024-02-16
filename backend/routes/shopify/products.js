const express = require('express');
const router = express.Router();
const verifyShopifyWebhook = require('../../middleware/shopify');

router.post('/create', verifyShopifyWebhook, (req, res) => {
    // Process the verified webhook
    res.status(200).send('Webhook received');
  });
  
router.post('/update', verifyShopifyWebhook, (req, res) => {
// Process the verified webhook
res.status(200).send('Webhook received');
});

module.exports = router;
