const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csvParser = require('csv-parser');
const { Client } = require('@elastic/elasticsearch');
const crypto = require('crypto');
const { format } = require('fast-csv');
const { parse } = require('json2csv');
const router = express.Router();

require('dotenv').config();

const client = new Client({
    cloud: {
      id: process.env.ES_CLOUD_ID,
    },
    auth: {
      username: process.env.ES_USERNAME,
      password: process.env.ES_PASSWORD
    }
  });

const upload = multer({ dest: 'uploads/' }); // Adjust as needed

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const filePath = req.file.path;
    const errorRecords = [];
    const headers = [];
    const bulkOps = [];

    fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
        const id = crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');
        // Use 'create' action for the bulk operation
        bulkOps.push({ create: { _index: 'search-gogh', _id: id } }, row);
        })
        .on('end', async () => {
            try {
                if (bulkOps.length) {
                    await retry(async () => {
                        const { body: bulkResponse } = await client.bulk({ 
                            refresh: true,
                            operations: bulkOps,
                            pipeline: 'ml-inference-search-gogh'
                        });

                        if (bulkResponse.errors) {
                            const erroredDocuments = [];
                            bulkResponse.items.forEach((action, index) => {
                                const operation = Object.keys(action)[0];
                                if (action[operation].error) {
                                    erroredDocuments.push(bulkOps[index * 2 + 1]);
                                }
                            });
                            errorRecords.push(...erroredDocuments);
                        }
                    }, 3);
                }
            } catch (error) {
                console.error(`Bulk indexing failed: ${error.message}`);
            } finally {
                if (errorRecords.length > 0) {
                    writeErrorsToFile(errorRecords, 'files/indexing_errors.csv');
                }
                res.send('Indexing completed with errors tracked in indexing_errors.csv');
            }
        });
});

const retry = async (fn, retries) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 1) {
            return retry(fn, retries - 1);
        } else {
            throw error;
        }
    }
};

const writeErrorsToFile = (records, filePath) => {
    if (records.length === 0) {
        console.log('No errors to write.');
        return;
    }

    const fields = ['title', 'creator', 'product_url', 'checkout_url', 'short_description', 'long_description', 'image', 'creator_bio', 'product_type', 'product_category', 'product_tags'];
    try {
        const opts = { fields };
        const csv = parse(records, opts);
        fs.writeFileSync(filePath, csv, { flag: 'a' }); // Append to file
        console.log(`Wrote ${records.length} error records to ${filePath}`);
    } catch (err) {
        console.error('Error writing to file:', err);
    }
};


module.exports = router;
