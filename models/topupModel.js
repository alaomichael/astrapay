const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const ObjectId = mongoose.Schema.ObjectId;
const topupSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
        required: true,
    },
    transactionType: {
        type: String,
        required: true,
        default: 'credit',
    },
    category: {
        type: String,
        enum: ['insurance', 'claim', 'withdrawal', 'topup', 'product'],
        trim: true,
        required: [true, 'please provide transaction category'],
        validate: [validator.isAlpha, 'please provide transaction category'],
        default: 'topup',
    },

    userId: {
        type: String,
        required: true,
        default: '',
    },
}, { timestamps: true });
const Topup = mongoose.model('Topup', topupSchema);
module.exports = { Topup };