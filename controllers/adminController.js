/* eslint-disable prettier/prettier */
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const mongoose = require('mongoose');
//import cloudinary
const cloudinary = require('../utils/cloudinary');
//import utilty email
const sendEmail = require('../utils/email');
//import  user  model
const User = require('../models/userModel');
//import utility generateExcel
const convertJsonToExcel = require('../utils/generateExcel');
//import utility generatePdf
const convertJsonToPdf = require('../utils/generatePdf');
//import  admin  model
const Admin = require('../models/adminModel');

// eslint-disable-next-line arrow-body-style
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res, req) => {
    const token = signToken(user._id, user.role);
    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
 
    console.log('Cookie have been saved successfully.');
  

    //remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
    // res.redirect('/users');
};

//create user route
exports.createUser = async(req, res, next) => {
    try {
        // save the request body in a variable
        let input = req.body;
        //   create an object with the content from the req body
        const newUser = await User.create({...req.body });

        //find admins from database
        let admins = await Admin.find({});

        // push new user to the admin collection
        if (newUser.role === 'admin') {
            await admins.push(newUser);
        }

        console.log('after admins :', admins);

        // save the new user to the database
        newUser.save();

        //send user to client
        createSendToken(newUser, 201, res, req);
    } catch (err) {
        if (err.code === 11000) {
            return next(createError(400, 'User already exist'));
        }
        if (err.name === 'ValidationError') {
            return next(createError(422, err.message));
        }
        next(err);
    }
};

//Get all user route
exports.getAllUsers = async(req, res, next) => {
    try {
        let allUser = 0;
        //find and count all users from database
        allUser = await User.countDocuments({ role: 'user' });
        let allAdmin = 0;
        //find and count all users from database
        allAdmin = await User.countDocuments({ role: 'admin' });
        let active = 0;
        //find and count all active users from database
        active = await User.countDocuments({ isActive: true, role: 'user' });
        let activeInsurance = 0;
        //find and count all activeInsurance users from database
        activeInsurance = await User.countDocuments({ "vehicleDetails.$.isActive": true, role: 'user' });
        let inActiveInsurance = 0;
        //find and count all inActiveInsurance users from database
        inActiveInsurance = await User.countDocuments({ "vehicleDetails.$.isActive": false, role: 'user' });
 let mostRecentUsers = [];
        let deactivated = 0;
        //find and count all deactivated users from database
        deactivated = await User.countDocuments({ isDeactivated: true, role: 'user' });

        let inactive = 0;
        //find and count all inactive users from database
        inactive = await User.countDocuments({ isActive: false, role: 'user' });
        let verifiedid = 0;
        //find and count all verifiedid users from database
        verifiedid = await User.countDocuments({ verifiedId: true, role: 'user' });
        let unverifiedid = 0;
        //find and count all verifiedid users from database
        unverifiedid = await User.countDocuments({ verifiedId: false, role: 'user' });
        let login = 0;
        //find and count all login users from database
        login = await User.countDocuments({ login: true, role: 'user' });

        let logout = 0;
        //find and count all logout users from database
        logout = await User.countDocuments({ login: false, role: 'user' });
        let activeAdmin = 0;
        //find and count all active users from database
        activeAdmin = await User.countDocuments({ isActive: true, role: 'admin' });
        let mostRecentAdmins = [];
        let deactivatedAdmin = 0;
        //find and count all deactivated users from database
        deactivatedAdmin = await User.countDocuments({ isDeactivated: true, role: 'admin' });

        let inactiveAdmin = 0;
        //find and count all inactive users from database
        inactiveAdmin = await User.countDocuments({ isActive: false, role: 'admin' });
        let verifiedidAdmin = 0;
        //find and count all verifiedid users from database
        verifiedidAdmin = await User.countDocuments({ verifiedId: true, role: 'admin' });
        let unverifiedidAdmin = 0;
        //find and count all verifiedid users from database
        unverifiedidAdmin = await User.countDocuments({ verifiedId: false, role: 'admin' });
        let loginAdmin = 0;
        //find and count all login users from database
        loginAdmin = await User.countDocuments({ login: true, role: 'admin' });

        let logoutAdmin = 0;
        //find and count all logout users from database
        logoutAdmin = await User.countDocuments({ login: false, role: 'admin' });

        let income = 0;
        let message = '';

        //check req query for filters
        //if filters, find filter from users models
        //fetch all users
        const conditions = {};
        if (req.query.role) conditions.role = req.query.role;
        if (req.query.isActive) conditions.isActive = req.query.isActive;
        if (req.query.isInActive) conditions.isInActive = req.query.isInActive;
        if (req.query.id) conditions._id = req.query.id;
        if (req.query.lastName) conditions.lastName = req.query.lastName;
        if (req.query.firstName) conditions.firstName = req.query.firstName;
        if (req.query.email) conditions.email = req.query.email;
        if (req.query.verifiedId) conditions.verifiedId = req.query.verifiedId;
        if (req.query.isProcessed) conditions.isProcessed = req.query.isProcessed;

        //find users from database and order it with the latest user at the top
        mostRecentUsers = await User.find(conditions)
            .limit(20)
            .sort({ _id: -1 });

        //find users from database and order it with the latest user at the top
        let users = await User.find(conditions).sort({ updatedAt: -1 });

        //find admins from database
        const admins = await Admin.find(conditions).sort({ _id: -1 });

        console.log('admins :', admins);

        // get the numbers of previous users
        const previousNumberOfUsers = admins.previousNumberOfUsers;

        const newNumberOfUsers = users.length;

        if (previousNumberOfUsers >= newNumberOfUsers) {
            deactivated = previousNumberOfUsers - newNumberOfUsers;
            admins.isDeactivated = deactivated;
        }

        let sortedVehicles = User.aggregate([{ $unwind: '$vehicleDetails' }, { $sort: { 'vehicleDetails._id': -1 } }, {
            $group: {
                _id: '$_id',
                'vehDetails': {
                    $push: '$vehicleDetails'
                }
            }
        }, {
            $project: {
                'vehicleDetails': '$vehDetails'
            }
        }]);
        console.log('sorted vehicle details:', sortedVehicles);
        // await mostRecentUsers.push(users);
        // admins.save();
        //send users to client
        res.status(200).json({
            status: 'success',
            totalNumberOfUsers: users.length,
            totalNumberOfDeactivatedUsers: admins.isDeactivated,
            data: {
                sortedVehicles,
                users,
                mostRecentUsers,
                deactivated,
                verifiedid,
                unverifiedid,
                login,
                logout,
                active,
                inactive,
                activeAdmin,
                mostRecentAdmins,
                inactiveAdmin,
                deactivatedAdmin,
                verifiedidAdmin,
                unverifiedidAdmin,
                loginAdmin,
                activeInsurance,
                inActiveInsurance,
                allUser,
                allAdmin,
                logoutAdmin,
            },
        });
    } catch (err) {
        next(err);
    }
};

//update user route
exports.updateUser = async(req, res, next) => {
    try {
        //search database by user id and update
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }
        //send updated user to client
        createSendToken(user, 200, res, req);
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};

