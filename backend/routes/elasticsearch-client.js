const { Client } = require('@elastic/elasticsearch');

const ES_CLOUD_ID = process.env.ES_CLOUD_ID;
const ES_USERNAME = process.env.ES_USERNAME;
const ES_PASSWORD = process.env.ES_PASSWORD;

const client = new Client({
  cloud: {
    id: ES_CLOUD_ID,
  },
  auth: {
    username: ES_USERNAME,
    password: ES_PASSWORD
  }
});

module.exports = client;