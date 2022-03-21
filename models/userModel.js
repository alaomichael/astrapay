/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// create expenditure schema
const facilitator = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [false, 'please input your first name!'],
        validate: [validator.isAlpha, 'First name should contain only alphabets'],
        default: '',
    },
    startTime: {
        type: Date,
        required: [true, 'start time is required'],
        default: 0,
    },
    stopTime: {
        type: Date,
        required: [true, 'stop time is required'],
        default: 0,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
});


// create expenditure schema
const charge = new mongoose.Schema({
    costOfPeriod: {
        type: Number,
        required: [true, 'please enter the current status'],
        default: 0,
        createdOn: Date.now()
    },
    startTime: {
        type: Date,
        required: [true, 'start time is required'],
        default: 0,
    },
    stopTime: {
        type: Date,
        required: [true, 'stop time is required'],
        default: 0,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
});

// create duration Schema
const timeUsed = new mongoose.Schema({
    duration: {
        type: Number,
        required: [true, 'usage time / duration is required'],
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: false });

// create duration Schema
const slot = new mongoose.Schema({
    position: {
        type: Number,
        required: [false, 'slot position is required'],
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: false });

// create time available schema
const timeAvailable = new mongoose.Schema({
    minutes: {
        type: Number,
        required: [false, 'please enter the available time'],
        default: 0,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: false });

// create time remaining schema
const timeRemaining = new mongoose.Schema({
    minutes: {
        type: Number,
        required: [false, 'please enter the remaining time'],
        default: 0,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: false });

// create user model
const userSchema = new mongoose.Schema({
    
    firstName: {
        type: String,
        trim: true,
        required: [false, 'please input your first name!'],
        validate: [validator.isAlpha, 'First name should contain only alphabets'],
        default: '',
    },
    lastName: {
        type: String,
        trim: true,
        required: [false, 'please input your last name!'],
        validate: [validator.isAlpha, 'Last name should contain only alphabets'],
        default: '',
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: [true, 'please provide a phone number'],
        validate: [validator.isMobilePhone, 'please provide valid phone number'],
        default: '',
    },
    password: {
        type: String,
        trim: true,
        minlength: 8,
        select: false,
        required: [true, 'please provide a password'],
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
        // required: [true, 'please confirm your password'],
        required: [false, 'please confirm your password'],
    },
    otp: {
        type: Number,
        trim: true,
        required: [false, 'please provide otp'],
        default: 000000,
    },
    payForTheWeek: {
        type: Number,
        trim: true,
        required: [false, 'please provide payForTheWeek'],
        default: 0,
    },
    periodForTheWeek: {
        type: Number,
        trim: true,
        required: [false, 'please provide periodForTheWeek'],
        default: 0,
    },
        login: {
        type: Boolean,
        trim: true,
        required: [false, 'please provide login status'],
        default: true,
        createdOn: {
            type: Date,
            default: Date.now(),
        },
    },
    logout: {
        type: Boolean,
        trim: true,
        required: [false, 'please provide logout status'],
        default: false,
        createdOn: {
            type: Date,
            default: Date.now(),
        },
    },
    lastLogin: {
        type: Date,
        default: Date.now(),
    },
    lastLogout: {
        type: Date,
        default: Date.now(),
    },
    periodActivationCount: {
        type: Number,
        trim: true,
        required: [false, 'please provide period activation count'],
        default: 0,
    },
    email: {
        type: String,
        trim: true,
        index: { "unique": true, "sparse": true },
        lowercase: true,
        required: [true, 'please provide your email'],
        validate: [validator.isEmail, 'please provide a valid email'],
    },
    costOfLastPeriodSession: {
        type: Number,
        required: [true, 'please provide the cost of last period session'],
        default: 0,
    },
    durationOfLastSession: {
        type: Number,
        required: [true, 'please provide the duration of last period session'],
        default: 0,
    },
    charges: [charge],
 
    isActive: {
        type: Boolean,
        required: [true, 'please enter the current status'],
        default: false,
    },
    isDeactivated: {
        type: Boolean,
        required: [true, 'please enter the current deactivation status'],
        default: false,
    },
    isInActive: {
        type: Boolean,
        required: true,
        default: true,
    },
      totalPeriodUsedForThisWeek: {
        type: Number,
        trim: true,
        required: [false, 'please provide total period withdrawals'],
        default: 0,
    },
    periodBalance: {
        type: Number,
        trim: true,
        required: [true, 'please provide period balance'],
        default: 0,
    },
   
    // walletTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' }],
    // walletTransactions2: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     index: true,
    //     ref: 'Wallet'
    // }],
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user',
    },

    stopTime: {
        type: Date,
        required: [false, 'stop time is required'],
    },
    startTime: {
        type: Date,
        required: [false, 'stop time is required'],
    },
    usage: [timeUsed],
    allotedSlots: [slot],
    periodTimeAvailableInMin: {
        type: Number,
        required: [false, 'periodTimeAvailableInMin is required'],
        default: 0,
    },
    periodTimeRemainingInMin: {
        type: Number,
        required: [false, 'periodTimeRemainingInMin is required'],
        default: 0,
    },
    timeUsedToday: {
        type: Number,
        required: [false, 'timeUsedToday is required'],
        default: 0,
    },
    timeUsedThisWeek: {
        type: Number,
        required: [false, 'timeUsedThisWeek is required'],
        default: 0,
    },
    presentWeek: {
        type: Number,
        required: [false, 'presentWeek is required'],
        default: 0,
    },
    previousWeek: {
        type: Number,
        required: [false, 'previousWeek is required'],
        default: 0,
    },
    presentDay: {
        type: Number,
        required: [false, 'presentDay is required'],
        default: 0,
    },
    previousDay: {
        type: Number,
        required: [false, 'previousDay is required'],
        default: 0,
    },
    facilitators: [facilitator],
    periodTimeAvailable: [timeAvailable],
    periodTimeRemaining: [timeRemaining],
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

// middleware hook for hashing passwords when created or chnaged
userSchema.pre('save', async function(next) {
    //only run this function if password was actually created or modified
    if (!this.isModified('password')) return next();

    //Hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete confirm password field
    this.confirmPassword = undefined;
});

//instance method for comparing passwords
userSchema.methods.correctPassword = async function(password, hashPassword) {
    return await bcrypt.compare(password, hashPassword);
};

//instance method to create forget password or password reset token
userSchema.methods.createPasswordResetToken = function() {
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

//initialize user model
const User = mongoose.model('User', userSchema);

//export user model
module.exports = User;
