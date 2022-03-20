const express = require('express');

//initialize  express router
const router = express.Router();

//import authentication controller
const authController = require('../controllers/authController');

//import user controller
const userController = require('../controllers/userController');

// import insurance controller
const periodController = require('../controllers/periodController');

//import role base controller
const { protect, restrictTo } = require('../middlewares/authentication');

//import multer
// const upload = require('../utils/multer1');
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');
//mouting routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotpassword);

router
    .route('/')
    .post(
        protect,
        restrictTo('admin', 'user'),

        userController.createUser
    )
    .get(protect, restrictTo('admin'), userController.getAllUsers);

const cloudinaryImageUploadMethod = async file => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (err, res) => {
            if (err) return res.status(500).send("upload image error")
            resolve({
                res: res.secure_url
            })
        })
    })
}

router
    .route('/:id')
    .get(protect, restrictTo('admin', 'user'), userController.getUser)
    .patch(
        protect,
        restrictTo('admin', 'user'),
        upload.array('image'),
        userController.updateUser
    )
    .post(
        protect,
        restrictTo('admin', 'user'),
        upload.array('image'),
        userController.updateUser
    );
    // verify OTP

router
    .route('/:id/verifyotp')
    .post(
        protect,
        restrictTo('admin', 'user'),
        userController.confirmUserOTP
    );
router
    .route('/:id/resendotp')
    .post(
        protect, 
        restrictTo('admin', 'user'),
        userController.resendOtp);


router
    .route('/:id/startperiod')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        upload.any('video'),
        periodController.startPeriod
    );

router
    .route('/:id/periodstatus')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        periodController.updateUserPeriodStatus
    );

router
    .route('/:id/stopperiod')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        periodController.stopPeriod
    );

module.exports = router;