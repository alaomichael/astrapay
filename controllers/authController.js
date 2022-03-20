const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const createError = require('http-errors'); // import fs
const fs = require('fs');
const twoStepAuth = require('../utils/twostepauth');

//import cloudinary
const cloudinary = require('../utils/cloudinary');
//import  user  model
const User = require('../models/userModel');
//import utilty email
const sendEmail = require('../utils/email');

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
    // res.setHeader('Set-Cookie', [`jwt=${token}`, 'language=javascript']);
    // res.send('Cookie have been saved successfully');
    console.log('Cookie have been saved successfully.');
    //remove password from output
    user.password = undefined;
    // res.redirect('/users');
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};


//registration route
exports.signup = async(req, res, next) => {
    try {
        //fetch registration detail from req body
        let {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phoneNumber,
        } = req.body;
      
        // generate 6 digit random number or OTP
        let otp = Math.floor(100000 + Math.random() * 900000);
        console.log('otp:', otp);
        console.log('user otp is:', otp);
        let verifyOTP = otp;
        // create user and save to database
        let newUser = await User.create({
            password,
            confirmPassword,
            otp: otp,
            ...req.body,
        });
        const token = signToken(newUser._id, newUser.role);
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        });
        console.log('Cookie have been saved successfully.');
        //remove password from output
        newUser.password = undefined;
        firstName = firstName[0].toUpperCase() + firstName.substring(1);
        let from = 'ASTRAPAY  <hello@astrapay.com>';
        let message = `Dear ${firstName},

Thanks for signing up to ASTRAPAY!  We're really glad to have you onboard.


I’m Michael, the founder of ASTRAPAY and I’d like to personally thank you for signing up to our service. We established ASTRAPAY  in order to provide you with affordable and transparent payment gateway. Please enjoy our service to the fullest.

I’d love to hear what you think of  ASTRAPAY and if there is anything we can improve. If you have any questions, please reply to this email.

I’m always happy to help!

Your OTP is ${otp}.

Enjoy!


Michael from ASTRAPAY
`;

        try {
            await sendEmail({
                from,
                to: email,
                subject: 'Welcome to ASTRAPAY!',
                text: message,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Your welcome message was successfully sent to email',
                token,
                verifyOTP,
                data: {
                    newUser,
                },
            });
        } catch (err) {
            next(
                createError(500, 'There was an error sending email, try again later!.')
            );
        }
    } catch (err) {
        console.log('error from sign up :', err.message);
        if (err.code === 11000) {
            console.log('error from sign up :', err.message);
            return next(createError(400, 'from authController signup function'));
        }
        if (err.name === 'ValidationError') {
            return next(createError(422, err.message));
        }
        next(err);
    }
}; //registration route
exports.signupAdmin = async(req, res, next) => {
    try {
        //fetch registration detail from req body
        let {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phoneNumber,
        } = req.body;
   
        // create user and save to database
        let newUser = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            confirmPassword,
            role: 'admin',
            isActive: true,
            isDeactivated: false,
            isInActive: false,
            ...req.body,
        });
        await newUser.save(); // res.sendFile(__dirname + '/payuhtml/dashboard.html');
        //create jwt token and send to user client
        // res.redirect('/dashboard');
        const token = signToken(newUser._id, newUser.role);
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        });
        
        // res.send('Cookie have been saved successfully');
        console.log('Cookie have been saved successfully.');
        //remove password from output
        newUser.password = undefined;
        
        firstName = firstName[0].toUpperCase() + firstName.substring(1);
        let from = 'ASTRAPAY  <hello@ASTRAPAY.com>';
        let message = `Dear ${firstName},

Thanks for signing up to ASTRAPAY!  We're really glad to have you onboard.


I’m Michael, the founder of ASTRAPAY and I’d like to personally thank you for signing up to our service. We established ASTRAPAY  in order to provide you with affordable and transparent payment. Please enjoy our service to the fullest.

I’d love to hear what you think of  ASTRAPAY and if there is anything we can improve. If you have any questions, please reply to this email.

I’m always happy to help!

Enjoy!


Michael from ASTRAPAY
`;

        try {
            await sendEmail({
                from,
                to: email,
                subject: 'Welcome to ASTRAPAY!',
                text: message,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Your welcome message was successfully sent to email',
                token,
                data: {
                    user,
                },
            });
        } catch (err) {
            next(
                createError(500, 'There was an error sending email, try again later!.')
            );
        }
        console.log('newUser.', newUser);
    } catch (err) {
        console.log('error from sign up admin:', err);
        if (err.code === 11000) {
            return next(
                createError(
                    400,
                    'User already exist from authController signupAdmin function'
                )
            );
        }
        if (err.name === 'ValidationError') {
            return next(createError(422, err.message));
        }
        next(err);
    }
};

//login route
exports.login = async(req, res, next) => {
    try {
        //fetch user from req body
        let { email, password } = req.body;

        //check if email and password exist
        if (!email || !password) {
            throw createError(404, 'Please provide email and password');
        }
        //check if email and password exist
        let user = await User.findOne({ email }).select('+password');

        //check if user exist and password is correct
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw createError(404, 'Incorrect email or password');
        }
        let { isDeactivated, isOtpVerified } = user;
        if (isDeactivated === true) { res.status(404).json({ status: 'fail', message: 'you account has been deactivated, please contact admin for more information.' }) };
        if (isOtpVerified === false) {
            const token = signToken(user._id, user.role);
            res.cookie('jwt', token, {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            });
            //     res.setHeader('Set-Cookie', [`jwt=${token}`]);
            // res.send('Cookie have been saved successfully');
            console.log('Cookie have been saved successfully.');
            //remove password from output
            //user.password = undefined;
              res.status(404).json({
                status: 'fail',
                token,
                message: 'you have not verified your otp.',
                data: {
                    user,
                },
            });
        };
        let data = {
            logout: false,
            login: true,
            lastLogin: Date.now(),
        };
        //search database by user id and update

        user = await User.findOneAndUpdate({ email }, data, {
            new: true,
            runValidators: true,
        });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }

        //create jwt token  and  send token to client
        createSendToken(user, 200, res, req);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return next(createError(422, err.message));
        }
        next(err);
    }
};

//login route
exports.loginAdmin = async(req, res, next) => {
    try {
        //fetch user from req body
        let { email, password } = req.body;

        //check if email and password exist
        if (!email || !password) {
            throw createError(404, 'Please provide email and password');
        }
        //check if email and password exist
        let user = await User.findOne({ email }).select('+password');

        //check if user exist and password is correct
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw createError(404, 'Incorrect email or password');
        }
        let { isDeactivated } = user;

        if (isDeactivated === true) {
            res.status(404).json({
                status: 'fail',
                message: 'you account has been deactivated, please contact the super admin for more information.'
            });
        };

        let data = {
            logout: false,
            login: true,
            lastLogin: Date.now(),
        };
        //search database by user id and update

        user = await User.findOneAndUpdate(req.body.email, data, {
            new: true,
            runValidators: true,
        });
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }


        //create jwt token  and  send token to client
        // createSendToken(user, 200, res, req);
        const token = signToken(user._id, user.role);
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        });
        // localStorage.setItem('token', this.token);
        console.log('Cookie have been saved successfully.', token);
        // await res.setHeader('Set-Cookie', [`jwt=${token}`, 'language=javascript']);
        // res.send('Cookie have been saved successfully');
        // let headers = new Headers('Authorization', 'Bearer' + token);
        // console.log('Cookie have been saved successfully.', headers);
        // return
        res.status(200).redirect('/dashboard');
    } catch (err) {
        if (err.name === 'ValidationError') {
            return next(createError(422, err.message));
        }
        next(err);
    }
};
exports.forgotpassword = async(req, res, next) => {
    //get user base on  POSTED email
    let user = await User.findOne({ email: req.body.email });

    //check if user exist
    if (!user) {
        return next(createError(404, 'There is no user with this email address'));
    }

    //generate password reset token
    let resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //seed it to user's email
    let resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword${resetToken}`;
    // create and send otp
    // const verifyOTP = await twoStepAuth(req.body.email);
    // console.log('Verify OTP :', verifyOTP);
    // let otp = verifyOTP.OTP;

    // generate 6 digit random number or OTP
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log('otp:', otp);
    console.log('user otp is:', otp);
    // let verifyOTP = otp;
    let data = {
        otp: otp,
        isOtpVerified: false,
    };
    //search database by user id and update

    user = await User.findOneAndUpdate({ email: req.body.email }, data, {
        new: true,
        runValidators: true,
    });
    //check if user exists
    if (!user) {
        throw createError(404, 'User does not exist');
    }
    let { email, firstName } = user;
    firstName = firstName[0].toUpperCase() + firstName.substring(1);
    let from = 'ASTRAPAY  <support@ASTRAPAY.com>';
    let message = `Dear ${firstName},

    We are sending this email because you requested a password reset.  
    
    This is your new OTP ${otp} if you didn't request a password reset, you can ignore this email. 
    
    Your password will not be changed.`;


    try {
        await sendEmail({
            from,
            to: email,
            subject: 'Reset your ASTRAPAY Password',
            text: message,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Your OTP was successfully sent to email',
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
};
