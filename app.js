/* eslint-disable prettier/prettier */
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const createError = require('http-errors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// import node-cron for schedulling
const cron = require('node-cron');
// import user model
const User = require('./models/userModel');
// import insurance controller
const periodController = require('./controllers/periodController');

require("dotenv").config();
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const axios = require('axios');
const superagent = require('superagent');
const fileUpload = require('express-fileupload');
const { protect, restrictTo } = require('./middlewares/authentication');
//initialize express
const app = express();
//implement cors
app.use(cors());

app.options('*', cors());

app.enable('trust proxy');

const request = require('request');
const bodyParser = require('body-parser');
const pug = require('pug');
const _ = require('lodash');
//  "public" off of current is root
app.use(express.static(path.join(__dirname, 'public/')));
//import authentication controllers
const auth = require('./routes/userRoute');

//import admin controllers
const admin = require('./routes/adminRoute');

//import admin controllers
const period = require('./routes/periodRoute');

//set security Http headers
app.use(helmet());

//development loggin
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limit req from same api
const limiter = rateLimit({
    max: 1000000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests  from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({}));
// let’s you use the cookieParser in application
app.use(cookieParser());
//body parser, reading data from body into req.body
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin,x-access-token, X-Requested-With, Content-Type, Accept'
    );
    res.header('Accept', 'application/json, text/plain,application/x-www-form-urlencoded,application/form-data , */*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Methods", "POST, GET,DELETE,UPDATE,PATCH");
    // res.headers('authorization', 'Bearer' + ' ' + req.cookies.jwt);
    res.header('authorization', 'Bearer' + ' ' + req.cookies.jwt);
    res.header('x-access-token', 'Bearer' + ' ' + req.cookies.jwt);
    res.header('Authorization', 'Bearer' + ' ' + req.cookies.jwt);
    next();
});
app.set('view engine', pug);
//routes middlewares
app.use('/api/v1/users', auth);
app.use('/api/v1/admin', admin);
app.use('/api/v1/period', period);
app.use(
    fileUpload({
        useTempFiles: true,
        createParentPath: true,
    })
);

// checking insurance status every minute with node-cron
// cron.schedule('2 * * * *', periodController.updateUsersInsuranceStatus);

app.get('/logout', function(req, res) {
    const data = {
        logout: true,
        login: false,
        lastLogout: Date.now(),
    };
    //search database by user id and update
    let user = User.findOneAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    });
    //check if user exists
    if (!user) {
        throw createError(404, 'User does not exist');
    }
    res.clearCookie('jwt');
    res.send('You have logout and your cookies are cleared');
    // res.sendFile(__dirname + '/payuhtml/login.html');
    // res.redirect("/login.html");
});


app.all('*', (req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/mylocation.html');
    // next(createError(404, ` can't find ${req.originalUrl} on server!`));
});

//error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
            loggedError: err,
        },
    });
});

//export express
module.exports = app;