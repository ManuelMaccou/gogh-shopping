const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const framesMetaSchema = new mongoose.Schema({
    description: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    fcFrame: { type: String, default: '' },
    fcFramePostUrl: { type: String, default: '' },
    fcFrameImage: { type: String, default: '' },
    fcFrameButton1: { type: String, default: '' },
    fcFrameButton2: { type: String, default: '' }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'product' }],
    pageId: { type: String },
    framesMeta: { type: framesMetaSchema, default: () => ({}) }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
