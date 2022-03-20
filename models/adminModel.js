const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// create recent user schema
const users = new mongoose.Schema({
    user: {
        type: String,
        required: [true, 'please provide user'],
    },
}, { timestamps: true });

// create user model
const adminSchema = new mongoose.Schema({
       //user details
     firstName: {
        type: String,
        trim: true,

        validate: [validator.isAlpha, 'First name should contain only alphabets'],
        default: '',
    },
    lastName: {
        type: String,
        trim: true,

        validate: [validator.isAlpha, 'Last name should contain only alphabets'],
        default: '',
    },
    phoneNumber: {
        type: String,
        trim: true,

        validate: [validator.isMobilePhone, 'please provide valid phone number'],
    },
    password: {
        type: String,
        trim: true,
        minlength: 8,
        select: false,
        required: [false, 'please provide a password'],
    },
    confirmPassword: {
        type: String,
        trim: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password are not the same',
        },
        required: [false, 'please confirm your password'],
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, 'please provide your email'],
        validate: [validator.isEmail, 'please provide a valid email'],
    },
    city: {
        type: String,
        trim: true,
        default: '',
    },
    isActive: {
        type: Number,
        required: [true, 'please provide is active status'],
        default: 0,
    },
    isInActive: {
        type: Number,
        required: [true, 'please provide is in active status'],
        default: 0,
    },
    
    isDeactivated: {
        type: Number,
        required: [true, 'please provide number of deactivation users'],
        default: 0,
    },
    recentUsers: [users],
    previousNumberOfUsers: {
        type: Number,
        required: [true, 'please provide number of registered users'],
        default: 0,
    },
    newNumberOfUsers: {
        type: Number,
        required: [true, 'please provide number of new number of users'],
        default: 0,
    },
    role: {
        type: String,
        required: [true, 'please provide role'],
        default: 'admin',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

// middleware hook for hashing passwords when created or chnaged
adminSchema.pre('save', async function(next) {
    //only run this function if password was actually created or modified
    if (!this.isModified('password')) return next();

    //Hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete confirm password field
    this.confirmPassword = undefined;
});

//instance method for comparing passwords
adminSchema.methods.correctPassword = async function(password, hashPassword) {
    return await bcrypt.compare(password, hashPassword);
};

//instance method to create forget password or password reset token
adminSchema.methods.createPasswordResetToken = function() {
    //create random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    //hash random token and save to database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    //save save password reset expiration date to database
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Admin = mongoose.model('Admin', adminSchema);

//export admin model
module.exports = Admin;