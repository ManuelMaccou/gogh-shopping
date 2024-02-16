const crypto = require('crypto');

function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get('X-Shopify-Hmac-SHA256');
  const data = req.rawBody;
  const calculatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(data, 'utf8')
    .digest('base64');

  if (crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmacHeader || ''))) {
    console.log('Webhook verified');
    next(); // Proceed to the next middleware/route handler
  } else {
    console.log('Webhook verification failed');
    return res.status(401).send('Webhook verification failed');
  }
}

module.exports = verifyShopifyWebhook;
