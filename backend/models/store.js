const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    image: { type: String, required: true },
    storeName: { type: String, required: true },
    storeDescription: { type: String, required: true },
    storeAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Store = mongoose.model('store', StoreSchema);

module.exports = Store;
