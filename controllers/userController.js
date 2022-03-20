/* eslint-disable prettier/prettier */
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const mongoose = require('mongoose'); // import fs
const fs = require('fs');
const path = require('path');
const sorter = require('sort-nested-json');
//import cloudinary
const cloudinary = require('../utils/cloudinary');
// import otp generator
const twoStepAuth = require('../utils/twostepauth');
//import utilty email
const sendEmail = require('../utils/email');
const Plugins = require('../utils/plugins');
//import paystack
const paystack = require('../utils/paystack');

const fileUpload = require('express-fileupload'); 

//import  user  model
const User = require('../models/userModel');

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
    res.setHeader('Set-Cookie', [`jwt=${token}`, 'language=javascript']);
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
};

//create user route
exports.createUser = async(req, res, next) => {
    try {
  
        let newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            'personal.firstName': firstName,
            'personal.lastName': lastName,
            'personal.phoneNumber': phoneNumber,
            ...req.body,
        });

        //send user to client
        createSendToken(newUser, 201, res, req);
    } catch (err) {
        console.log('signup error message', err);
        if (err.code === 11000) {
            console.log('error from sign up :', err);
            return next(createError(400, 'from userController createUser function'));
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
        console.log(`this is the cookie awesome ${req.cookies.jwt}`);
        //check req query for filters
        //if filters, find filter from event models
        //fetch all events verifiedId
        const conditions = {};
        if (req.query.role) conditions.role = req.query.role;
        if (req.query.isProcessed) conditions.isProcessed = req.query.isProcessed;
        if (req.query.verifiedId) conditions.verifiedId = req.query.verifiedId;

        //find users from database
        let users = await User.find(conditions).sort({ _id: -1 });
let sortedUsers = sorter.sort(users).desc("charge.stopTime");
console.log("sorted array", sortedUsers)
  

        //send users to client
        res.status(200).json({
            status: 'success',
            result: users.length,
            data: {
                users,
            },
        });
    } catch (err) {
        next(err);
    }
};

//Get a single user
exports.getUser = async(req, res, next) => {
    try {
        //find  user from database by id
        const user = await User.findById(req.params.id).sort({ _id: -1 });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }
        //send user to client
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};
//Get a single user OTP
exports.confirmUserOTP = async(req, res, next) => {
    try {
        //find  user from database by id
        let user = await User.findById(req.params.id).sort({ _id: -1 });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }
        let storeOTP = user.otp;
        console.log('storedOTP:', storeOTP);
        console.log('inputedOTP:', req.body.otp);
        console.log('isOtpVerified line 270:', user.isOtpVerified);
        if (storeOTP === req.body.otp) {
            let { isOtpVerified } = user;
            user.isOtpVerified = true;
            console.log('isOtpVerified line 274:', user.isOtpVerified);
            await user.save();
            res.status(200).json({
                status: 'success',
                data: {
                    user,
                    isOtpVerified,
                },
            });
        } else {
            console.log('in correct OTP.');
            res.status(400).json({
                status: 'fail',
                message: 'wrong otp,otp does not match,please try again.',
            });
        };
        next();


        //send user to client
    } catch (err) {
    
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid OTP, check your Email for a Valid OTP.'));
        }
        next(err);
    }
};
//Get a single user OTP
exports.resendOtp = async(req, res, next) => {
    try {
        //find  user from database by id
        let user = await User.findById(req.params.id).sort({ _id: -1 });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }
        // let resentOtp = await twoStepAuth(user.email);
        // generate 6 digit random number or OTP
        let otp = Math.floor(100000 + Math.random() * 900000);
        console.log('otp:', otp);
        console.log('user otp is:', otp);

        let data = {
            otp: otp,
            isOtpVerified: false,
        };
        //search database by user id and update

        user = await User.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        });
        let { email, firstName } = user;
        firstName = firstName[0].toUpperCase() + firstName.substring(1);
        console.log('To email:', email);
        let from = 'ASTRAPAY  <support@ASTRAPAY.com>';
        let message = `Dear ${firstName},

We are sending this email because you requested a password reset.  

This is your new OTP ${otp} if you didn't request a password reset, you can ignore this email. 

Your password will not be changed.`;

        try {
            await sendEmail({
                from,

                to: email,
                subject: 'ASTRAPAY OTP',
                text: message,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Your OTP was successfully sent to email',
                data: {
                    user,
                },
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            next(
                createError(500, 'There was an error sending email, try again later!.')
            );
        }
        next();

    } catch (err) {
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid User ID.'));
        }
        next(err);
    }
};

//update user route
exports.updateUser = async(req, res, next) => {
    try {
        console.log(' req body @ line 375:', req.body);
       

        let user = await User.findById(req.params.id).sort({ _id: -1 });
     


        if (user.vehicleDetails.length >= 2) {
            let {
                selectedCar,
            } = req.body;

            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            let { vehicleDetails } = user;
            selectedCar = selectedCar ? selectedCar : 0;
            let activeCar = vehicleDetails[selectedCar];
            console.log('Active car :', activeCar);
            console.log('vehicle details:', vehicleDetails);

            let {
                carMake,
                carModel,
                engineNumber,
                chasisNumber,
                carValue,
                registrationNumber,
                carYearOfMake,
                vehicleColour,
                cloudinaryId,
                dashboardImageUrl,
                leftSideImageUrl,
                rightSideImageUrl,
                rearImageUrl,
                frontImageUrl,
                proofOfOwnershipImageUrl,
                vehicleLicenseImageUrl,
                purchaseType,
                isActive,
                isDeactivated,
                isDriving,
                isParked,
                isInActive,
                hasInsuranceCover,
            } = activeCar;
            console.log('req.body.carMake details line 792:', req.body.carMake);
            console.log('carMake details line 793:', carMake);

            carMake = (req.body.carMake != undefined) ? req.body.carMake : carMake;
            carModel = (req.body.carModel != undefined) ? req.body.carModel : carModel;
            engineNumber = (req.body.engineNumber != undefined) ? req.body.engineNumber : engineNumber;
            chasisNumber = (req.body.chasisNumber != undefined) ? req.body.chasisNumber : chasisNumber;
            carValue = (req.body.carValue != undefined) ? req.body.carValue : carValue;
            registrationNumber = (req.body.registrationNumber != undefined) ? req.body.registrationNumber : registrationNumber;
            carYearOfMake = (req.body.carYearOfMake != undefined) ? req.body.carYearOfMake : carYearOfMake;
            vehicleColour = (req.body.vehicleColour != undefined) ? req.body.vehicleColour : vehicleColour;
            cloudinaryId = (req.body.cloudinaryId != undefined) ? req.body.cloudinaryId : cloudinaryId;
            dashboardImageUrl = (req.body.dashboardImageUrl != undefined) ? req.body.dashboardImageUrl : dashboardImageUrl;
            leftSideImageUrl = (req.body.leftSideImageUrl != undefined) ? req.body.leftSideImageUrl : leftSideImageUrl;
            rightSideImageUrl = (req.body.rightSideImageUrl != undefined) ? req.body.rightSideImageUrl : rightSideImageUrl;
            rearImageUrl = (req.body.rearImageUrl != undefined) ? req.body.rearImageUrl : rearImageUrl;
            frontImageUrl = (req.body.frontImageUrl != undefined) ? req.body.frontImageUrl : frontImageUrl;
            proofOfOwnershipImageUrl = (req.body.proofOfOwnershipImageUrl != undefined) ? req.body.proofOfOwnershipImageUrl : proofOfOwnershipImageUrl;
            vehicleLicenseImageUrl = (req.body.vehicleLicenseImageUrl != undefined) ? req.body.vehicleLicenseImageUrl : vehicleLicenseImageUrl;
            purchaseType = (req.body.purchaseType != undefined) ? req.body.purchaseType : purchaseType;
            isActive = (req.body.isActive != undefined) ? req.body.isActive : isActive;
            isDeactivated = (req.body.isDeactivated != undefined) ? req.body.isDeactivated : isDeactivated;
            isDriving = (req.body.isDriving != undefined) ? req.body.isDriving : isDriving;
            isParked = (req.body.isParked != undefined) ? req.body.isParked : isParked;
            isInActive = (req.body.isInActive != undefined) ? req.body.isInActive : isInActive;
            hasInsuranceCover = (req.body.hasInsuranceCover != undefined) ? req.body.hasInsuranceCover : hasInsuranceCover;



            //             let newVehicleData = {
            //                 carMake: carMake,
            //                 carModel: carModel,
            //                 engineNumber: engineNumber,
            //                 chasisNumber: chasisNumber,
            //                 carValue: carValue,
            //                 registrationNumber: registrationNumber,
            //                 carYearOfMake: carYearOfMake,
            //                 vehicleColour: vehicleColour,
            //                 vehicleLicenseImageUrl: vehicleLicenseImageUrl,
            //                 proofOfOwnershipImageUrl: proofOfOwnershipImageUrl,
            //                 frontImageUrl: frontImageUrl,
            //                 rearImageUrl: rearImageUrl,
            //                 rightSideImageUrl: rightSideImageUrl,
            //                 leftSideImageUrl: leftSideImageUrl,
            //                 dashboardImageUrl: dashboardImageUrl,
            //                 cloudinaryId: cloudinaryId,
            //                 purchaseType: purchaseType,
            //                 ...req.body,
            //             };
            //             if (newVehicleData != undefined) {
            //                 console.log('new Data  line 769', newVehicleData);
            //                 let id = req.params.id;
            //            let updateVehicleData =  await User.updateOne({ _id: id }, { $set: { activeCar: newVehicleData } }, { upsert: true });
            //             }

            // added for vehicle update 12-01-2022
            let id = req.params.id;
            let vehicleId = activeCar._id;
            //             var query = {
            //      vehicleDetails: {
            //         $elemMatch: {
            //             "_id": vehicleId
            //         }
            //      }
            // };

            // var update = {
            //     $set: {
            //         'vehicleDetails.$[].proofOfOwnershipImageUrl': proofOfOwnershipImageUrl,

            //     }
            // };

            // var options = {
            //     arrayFilters: [
            //         { "inner._id" : vehicleId}
            //     ] 
            // };

            //    let updateVehicleData = await User.updateOne(query, update, options);

            //      let updateVehicleData = await User.updateOne(
            //          { "vehicleDetails._id": vehicleId },
            //          {$set: {proofOfOwnershipImageUrl:proofOfOwnershipImageUrl}});       

            const query = { _id: id, "vehicleDetails._id": vehicleId }
            console.log('query Data line 1045 ', query);
            let updateDocument = {
                $set: {
                    "vehicleDetails.$.carMake": carMake,
                    "vehicleDetails.$.carModel": carModel,
                    "vehicleDetails.$.engineNumber": engineNumber,
                    "vehicleDetails.$.chasisNumber": chasisNumber,
                    "vehicleDetails.$.carValue": carValue,
                    "vehicleDetails.$.registrationNumber": registrationNumber,
                    "vehicleDetails.$.carYearOfMake": carYearOfMake,
                    "vehicleDetails.$.vehicleColour": vehicleColour,
                    "vehicleDetails.$.vehicleLicenseImageUrl": vehicleLicenseImageUrl,
                    "vehicleDetails.$.proofOfOwnershipImageUrl": proofOfOwnershipImageUrl,
                    "vehicleDetails.$.frontImageUrl": frontImageUrl,
                    "vehicleDetails.$.rearImageUrl": rearImageUrl,
                    "vehicleDetails.$.rightSideImageUrl": rightSideImageUrl,
                    "vehicleDetails.$.leftSideImageUrl": leftSideImageUrl,
                    "vehicleDetails.$.dashboardImageUrl": dashboardImageUrl,
                    "vehicleDetails.$.cloudinaryId": cloudinaryId,
                    "vehicleDetails.$.purchaseType": purchaseType,
                    "vehicleDetails.$.isActive": isActive,
                    "vehicleDetails.$.isDeactivated": isDeactivated,
                    "vehicleDetails.$.isDriving": isDriving,
                    "vehicleDetails.$.isParked": isParked,
                    "vehicleDetails.$.isInActive": isInActive,
                    "vehicleDetails.$.hasInsuranceCover": hasInsuranceCover,
                }
            };
            let updateVehicleData = await User.updateOne(query, updateDocument);
            // user = await User.findOneAndUpdate(registrationNumber, {
            //     $set: {
            //         vehicleDetails: newVehicleData,
            //     }
            // });
            // user = await User.findOneAndUpdate(registrationNumber, {
            //     $addToSet: {
            //         vehicleDetails: newVehicleData,
            //     }
            // });
            // User.upsert({ registrationNumber: registrationNumber }, newVehicleData)
            // if (!user) {
            //     throw createError(404, 'User does not exist');
            // }
            console.log('update vehicle Data line 1088 ', updateVehicleData);
            console.log(' req body @ line 1089:', req.body);
            //             let { isActive, isDeactivated, isInActive } = req.body;
            let data = {
                isActive,
                isDeactivated,
                isInActive,
                ...req.body,
                // cloudinaryId: user.cloudinaryId,
                // profileImageUrl: result.secure_url,
            };
            //search database by user id and update

            user = await User.findByIdAndUpdate(req.params.id, data, {
                new: true,
                runValidators: true,
            });
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            //  console.log('New vehicle can not be added,you are only allowed to add maximum of two vehicles per account.');
            //send updated user to client
            createSendToken(user, 200, res, req);
            // return 'You are only allowed to add maximum of two vehicles per account.'
        } else if (user.vehicleDetails.length === 1) {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            let { vehicleDetails } = user;
            console.log('vehicle details line 1121:', vehicleDetails);

            let {
                carMake,
                carModel,
                engineNumber,
                chasisNumber,
                carValue,
                registrationNumber,
                carYearOfMake,
                vehicleColour,
                cloudinaryId,
                dashboardImageUrl,
                leftSideImageUrl,
                rightSideImageUrl,
                rearImageUrl,
                frontImageUrl,
                proofOfOwnershipImageUrl,
                vehicleLicenseImageUrl,
                purchaseType,
                isActive,
                isDeactivated,
                isDriving,
                isParked,
                isInActive,
                hasInsuranceCover,
            } = vehicleDetails[0];
            console.log('req.body.carMake details line 1148:', req.body.carMake);
            console.log('carMake details line 1149:', carMake);

            carMake = (req.body.carMake != undefined) ? req.body.carMake : carMake;
            carModel = (req.body.carModel != undefined) ? req.body.carModel : carModel;
            engineNumber = (req.body.engineNumber != undefined) ? req.body.engineNumber : engineNumber;
            chasisNumber = (req.body.chasisNumber != undefined) ? req.body.chasisNumber : chasisNumber;
            carValue = (req.body.carValue != undefined) ? req.body.carValue : carValue;
            registrationNumber = (req.body.registrationNumber != undefined) ? req.body.registrationNumber : registrationNumber;
            carYearOfMake = (req.body.carYearOfMake != undefined) ? req.body.carYearOfMake : carYearOfMake;
            vehicleColour = (req.body.vehicleColour != undefined) ? req.body.vehicleColour : vehicleColour;
            cloudinaryId = (req.body.cloudinaryId != undefined) ? req.body.cloudinaryId : cloudinaryId;
            dashboardImageUrl = (req.body.dashboardImageUrl != undefined) ? req.body.dashboardImageUrl : dashboardImageUrl;
            leftSideImageUrl = (req.body.leftSideImageUrl != undefined) ? req.body.leftSideImageUrl : leftSideImageUrl;
            rightSideImageUrl = (req.body.rightSideImageUrl != undefined) ? req.body.rightSideImageUrl : rightSideImageUrl;
            rearImageUrl = (req.body.rearImageUrl != undefined) ? req.body.rearImageUrl : rearImageUrl;
            frontImageUrl = (req.body.frontImageUrl != undefined) ? req.body.frontImageUrl : frontImageUrl;
            proofOfOwnershipImageUrl = (req.body.proofOfOwnershipImageUrl != undefined) ? req.body.proofOfOwnershipImageUrl : proofOfOwnershipImageUrl;
            vehicleLicenseImageUrl = (req.body.vehicleLicenseImageUrl != undefined) ? req.body.vehicleLicenseImageUrl : vehicleLicenseImageUrl;
            purchaseType = (req.body.purchaseType != undefined) ? req.body.purchaseType : purchaseType;
            isActive = (req.body.isActive != undefined) ? req.body.isActive : isActive;
            isDeactivated = (req.body.isDeactivated != undefined) ? req.body.isDeactivated : isDeactivated;
            isDriving = (req.body.isDriving != undefined) ? req.body.isDriving : isDriving;
            isParked = (req.body.isParked != undefined) ? req.body.isParked : isParked;
            isInActive = (req.body.isInActive != undefined) ? req.body.isInActive : isInActive;
            hasInsuranceCover = (req.body.hasInsuranceCover != undefined) ? req.body.hasInsuranceCover : hasInsuranceCover;

            //             let newVehicleData = {
            //                 carMake: carMake,
            //                 carModel: carModel,
            //                 engineNumber: engineNumber,
            //                 chasisNumber: chasisNumber,
            //                 carValue: carValue,
            //                 registrationNumber: registrationNumber,
            //                 carYearOfMake: carYearOfMake,
            //                 vehicleColour: vehicleColour,
            //                 vehicleLicenseImageUrl: vehicleLicenseImageUrl,
            //                 proofOfOwnershipImageUrl: proofOfOwnershipImageUrl,
            //                 frontImageUrl: frontImageUrl,
            //                 rearImageUrl: rearImageUrl,
            //                 rightSideImageUrl: rightSideImageUrl,
            //                 leftSideImageUrl: leftSideImageUrl,
            //                 dashboardImageUrl: dashboardImageUrl,
            //                 cloudinaryId: cloudinaryId,
            //                 purchaseType: purchaseType,
            //                 ...req.body,
            //             };

           // console.log('new Data line 1077 ', newVehicleData);
            let id = req.params.id;
            // added for vehicle update 12-01-2022
            let vehicleId = vehicleDetails[0]._id;
            const query = { _id: id, "vehicleDetails._id": vehicleId }
            console.log('query Data line 1201 ', query);
            let updateDocument = {
                $set: {
                    "vehicleDetails.$.carMake": carMake,
                    "vehicleDetails.$.carModel": carModel,
                    "vehicleDetails.$.engineNumber": engineNumber,
                    "vehicleDetails.$.chasisNumber": chasisNumber,
                    "vehicleDetails.$.carValue": carValue,
                    "vehicleDetails.$.registrationNumber": registrationNumber,
                    "vehicleDetails.$.carYearOfMake": carYearOfMake,
                    "vehicleDetails.$.vehicleColour": vehicleColour,
                    "vehicleDetails.$.vehicleLicenseImageUrl": vehicleLicenseImageUrl,
                    "vehicleDetails.$.proofOfOwnershipImageUrl": proofOfOwnershipImageUrl,
                    "vehicleDetails.$.frontImageUrl": frontImageUrl,
                    "vehicleDetails.$.rearImageUrl": rearImageUrl,
                    "vehicleDetails.$.rightSideImageUrl": rightSideImageUrl,
                    "vehicleDetails.$.leftSideImageUrl": leftSideImageUrl,
                    "vehicleDetails.$.dashboardImageUrl": dashboardImageUrl,
                    "vehicleDetails.$.cloudinaryId": cloudinaryId,
                    "vehicleDetails.$.purchaseType": purchaseType,
                    "vehicleDetails.$.isActive": isActive,
                    "vehicleDetails.$.isDeactivated": isDeactivated,
                    "vehicleDetails.$.isDriving": isDriving,
                    "vehicleDetails.$.isParked": isParked,
                    "vehicleDetails.$.isInActive": isInActive,
                    "vehicleDetails.$.hasInsuranceCover": hasInsuranceCover,
                }
            };
            let updateVehicleData = await User.updateOne(query, updateDocument);

            console.log('update vehicle Data report line 1231 ', updateVehicleData);
            console.log(' req body @ line 1232:', req.body);

            //             let { isActive, isDeactivated, isInActive } = req.body;
            let data = {
                isActive,
                isDeactivated,
                isInActive,
                ...req.body,
                // cloudinaryId: user.cloudinaryId,
                // profileImageUrl: result.secure_url,
            };
            //search database by user id and update

            user = await User.findByIdAndUpdate(req.params.id, data, {
                new: true,
                runValidators: true,
            });
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // User.upsert({ registrationNumber: registrationNumber }, newVehicleData)
            //send updated user to client
            createSendToken(user, 200, res, req);

        } else {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            console.log(' req body @ line 1264:', req.body);
            let { isActive, isDeactivated, isInActive } = req.body;
            let data = {
                isActive,
                isDeactivated,
                isInActive,
                ...req.body,
                // cloudinaryId: user.cloudinaryId,
                // profileImageUrl: result.secure_url,
            };
            //search database by user id and update

            user = await User.findByIdAndUpdate(req.params.id, data, {
                new: true,
                runValidators: true,
            });
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            //send updated user to client
            createSendToken(user, 200, res, req);
        };
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            console.log('Error:', err);

            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};
//update all  user route
exports.updateAllUser = async(req, res, next) => {
    try {
        console.log(' req body @ line 1299:', req.body);
        console.log('type of guideVideoActive is:', typeof req.body.guideVideoActive); // await User.syncIndexes();
        const conditions = {};
        if (req.query.role) conditions.role = req.query.role;
        if (req.query.isProcessed) conditions.isProcessed = req.query.isProcessed;
        if (req.query.verifiedId) conditions.verifiedId = req.query.verifiedId;

        //find users from database
        let users = await User.find(conditions).sort({ _id: -1 });
        //check if user exists
        if (!users) {
            throw createError(404, 'User does not exist');
        }
        // user = await User.findOne({ 'bankDetails.bankAccountNumber': req.body.bankAccountNumber });
        // user = await User.findOneAndUpdate(bankAccountNumber, {
        //     $set: {
        //         bankDetails: newBankData,
        //     }
        // });
        // if (!user) {
        //     let user = await User.findById(req.params.id);
        //     await user.bankDetails.push({ bankDetails: newBankData });
        // } else if (user) {
        //     user = await User.findOneAndUpdate(bankAccountNumber, {
        //         $set: {
        //             bankDetails: newBankData,
        //         }
        //     });
        // };
        // if (newBankData != undefined && bankAccountNumber === 0 ||
        //     newBankData != '' && bankAccountNumber === 0 ||
        //     newBankData != null && bankAccountNumber === 0) {
        //     let id = req.params.id;
        //     await User.findOne({ _id: id }, (error, result) => {
        //         if (error) {
        //             console.log(error);
        //         } else {
        //             result.bankDetails.push(newBankData)
        //             result.save((error, updatedRecord) => {
        //                 console.log(updatedRecord);
        //             })
        //         }
        //     });
        //     await User.updateOne({ _id: id }, { $set: { bankDetails: newBankData } }, { upsert: true });
        // }




        // user = await User.findOneAndUpdate(registrationNumber, {
        //     $set: {
        //         vehicleDetails: newVehicleData,
        //     }
        // });
        // user = await User.findOneAndUpdate(registrationNumber, {
        //     $addToSet: {
        //         vehicleDetails: newVehicleData,
        //     }
        // });
        // User.upsert({ registrationNumber: registrationNumber }, newVehicleData)
        // if (!user) {
        //     throw createError(404, 'User does not exist');
        // }

        // console.log(' req body @ line 545:', req.body);
        // let data = {
        //     ...req.body,
        //     // cloudinaryId: user.cloudinaryId,
        //     // profileImageUrl: result.secure_url,
        // };
        //search database by user id and update

        // user = await User.findByIdAndUpdate(req.params.id, data, {
        //     new: true,
        //     runValidators: true,
        // });
        // //check if user exists
        // if (!user) {
        //     throw createError(404, 'User does not exist');
        // }
        // console.log('New vehicle can not be added,you are only allowed to add maximum of two vehicles per account.');
        // //send updated user to client
        // createSendToken(user, 200, res, req);
        // return 'You are only allowed to add maximum of two vehicles per account.'
        // console.log('newusers Data ', users);
        let { driveModeRate, parkModeRate, guideVideoActive, guideVideoUrl, driveModeDivider, parkModeDivider, } = users;
        console.log('new Data ', parkModeRate);
        if (req.body.guideVideoActive === true) {
            console.log('type of guideVideoActive is:', typeof req.body.guideVideoActive);
            guideVideoActive = await User.updateMany({}, { $set: { guideVideoActive: true } }, { upsert: true });
            console.log('new guideVideoActive ', guideVideoActive);
        }
        if (req.body.guideVideoActive === false) {
            console.log('type of guideVideoActive is:', typeof req.body.guideVideoActive);
            guideVideoActive = await User.updateMany({}, { $set: { guideVideoActive: false } }, { upsert: true });
            console.log('new guideVideoActive ', guideVideoActive);
        }
        if (req.body.guideVideoUrl) {
            let convertedUrl = req.body.guideVideoUrl;
            guideVideoUrl = await User.updateMany({}, { $set: { guideVideoUrl: convertedUrl } }, { upsert: true });
            console.log('new guideVideoUrl ', guideVideoUrl);
        }
        if (req.body.driveModeRate) {
            console.log('type of new driveModeRate ', typeof req.body.driveModeRate);
            let convertedRate = Number(req.body.driveModeRate);
            console.log('type of converted rate is:', typeof convertedRate);
            driveModeRate = await User.updateMany({}, { $set: { driveModeRate: convertedRate } }, { upsert: true });
            console.log('new driveModeRate ', driveModeRate);
        }
        if (req.body.parkModeRate) {
            let convertedRate = Number(req.body.parkModeRate);
            console.log('type of converted rate is:', typeof convertedRate);
            parkModeRate = await User.updateMany({}, { $set: { parkModeRate: convertedRate } }, { upsert: true });
            console.log('new parkModeRate ', parkModeRate);
        }
        if (req.body.driveModeDivider) {
            let convertedRate = Number(req.body.driveModeDivider);
            console.log('type of converted rate is:', typeof convertedRate);
            driveModeDivider = await User.updateMany({}, { $set: { driveModeDivider: convertedRate } }, { upsert: true });
            console.log('new driveModeDivider ', driveModeDivider);
        }
        if (req.body.parkModeDivider) {
            let convertedRate = Number(req.body.parkModeDivider);
            console.log('type of converted rate is:', typeof convertedRate);
            parkModeDivider = await User.updateMany({}, { $set: { parkModeDivider: convertedRate } }, { upsert: true });
            console.log('new parkModeDivider ', parkModeDivider);
        }

        await User.syncIndexes();

        // send result to the client
        res.status(200).json({
            status: 'success',

            data: {
                users,
                driveModeRate,
                parkModeRate,
                guideVideoActive,
                guideVideoUrl,
                driveModeDivider,
                parkModeDivider,
            },
        });
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            console.log('Error:', err);

            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};

