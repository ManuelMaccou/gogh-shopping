const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    merchantId: { type: String, required: true },
    fid: { type: String, unique: false },
    signer_uuid: { type: String },
    isAdmin: { type: Boolean, default: false },
    products: [{ type: Schema.Types.ObjectId, ref: 'product' }],
    pageId: { type: String },
    pageHtml: { type: String },
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
