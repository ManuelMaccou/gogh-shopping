const express = require('express');
const path = require('path');
const connectDB = require('./database');
const cors = require('cors');

const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const generatePage = require('./routes/generate');
const frameRoutes = require('./routes/frames');
const productPage = require('./routes/pages');
const metadataRoutes = require('./routes/metadata');
// const productDb = require('./routes/productDb');
const storeRoutes = require('./routes/stores');
const impersonateRoutes = require('./routes/impersonate');


require('dotenv').config();

const app = express();
app.use(cors());

// Connect to Database
connectDB();

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'gogh', 'build')));

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/generate-page', generatePage);
app.use('/api/frames', frameRoutes);
app.use('/product-page', productPage);
app.use('/api', metadataRoutes);
// app.use('/api/index-csv', productDb);
app.use('/api/stores', storeRoutes);
app.use('/api/impersonate', impersonateRoutes)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'gogh', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
