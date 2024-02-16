const { Shopify } = require('@shopify/shopify-api');

const shopDomain = 'quickstart-3ac724f4.myshopify.com';
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

// Initialize the Shopify context
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: ['write_products', 'read_products'],
  HOST_NAME: 'yourapp.com', // Replace with your app's host name
  IS_EMBEDDED_APP: false,
  API_VERSION: '2022-01' // Use the API version you're working with
});

// Function to create a webhook
async function createWebhook(shop, accessToken, topic, address) {
  const client = new Shopify.Clients.Rest(shop, accessToken);
  try {
    const response = await client.post({
      path: 'webhooks',
      data: {
        webhook: {
          topic: topic,
          address: address,
          format: 'json',
        },
      },
      type: 'application/json',
    });
    console.log(`Webhook created for topic ${topic}`);
    return response.body;
  } catch (error) {
    console.error(`Failed to create webhook for topic ${topic}: ${error.message}`);
  }
}

// Subscribe to the 'products/create' and 'products/update' topics
async function subscribeToWebhooks() {
  await createWebhook(shopDomain, accessToken, 'products/create', 'https://www.gogh.shopping/webhooks/products/create');
  await createWebhook(shopDomain, accessToken, 'products/update', 'https://www.gogh.shopping/webhooks/products/update');
  await createWebhook(shopDomain, accessToken, 'products/delete', 'https://www.gogh.shopping/webhooks/products/delete');
}

// Execute the subscription function
subscribeToWebhooks().then(() => console.log('Subscribed to webhooks successfully.'));
