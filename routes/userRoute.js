const express = require('express');

//initialize  express router
const router = express.Router();

//import authentication controller
const authController = require('../controllers/authController');

//import user controller
const userController = require('../controllers/userController');

// import insurance controller
const periodController = require('../controllers/periodController');
// import email controller
const emailController = require('../controllers/emailController');
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
router.patch('/resetpassword/:token', authController.resetpassword);
router.patch('/resetpassword', authController.resetpassword);

router
    .route('/')
    .post(
        protect,
        restrictTo('admin', 'user'),

        userController.createUser
    )
    .get(protect, restrictTo('admin'), userController.getAllUsers);
router
    .route('/uploadimages')
    .post(
        protect,
        restrictTo('admin', 'user'),
        upload.array('image'),
        userController.uploadImages
    )
    .patch(
        protect,
        restrictTo('admin', 'user'),
        upload.array('image'),
        userController.uploadImages
    );

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

router.post("/wonderful", upload.array("img", 3), async(req, res) => {
    const urls = [];
    const files = req.files;
    for (const file of files) {
        const { path } = file;
        const newPath = await cloudinaryImageUploadMethod(path);
        urls.push(newPath);
    }
});


router
    .route('/uploadvideos')
    .post(
        protect,
        restrictTo('admin', 'user'),
        upload.array('video'),
        userController.uploadImages
    )
    .patch(
        protect,
        restrictTo('admin', 'user'),
        upload.array('video'),
        userController.uploadImages
    );

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
// add vehicle
router
    .route('/addvehicle/:id')
    .post(
        protect,
        restrictTo('admin', 'user'),
        upload.array('image'),
        userController.addVehicle
    );

    router
    .route('/viewvehicledetails/:id').get(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),
        userController.viewVehicleDetails)
.patch(
    protect,
    restrictTo('admin', 'user'),
    upload.single('image'),
    userController.viewVehicleDetails)
    .delete(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),
        userController.viewVehicleDetails);

        router
        .route('/deleteVehicleDetails/:id')
        .get(
            protect,
            restrictTo('admin', 'user'),
            upload.single('image'),
            userController.deleteVehicleDetails)
            .delete(
            protect,
            restrictTo('admin', 'user'),
            upload.single('image'),
            userController.deleteVehicleDetails);
        
    
router
    .route('/:id/deleteuser')
    .delete(protect, restrictTo('admin', 'user'), userController.deleteUser);
// verify OTP

router
    .route('/:id/verifyotp')
    .post(
        protect,
        restrictTo('admin', 'user'),
        userController.getAndConfirmUserOTP
    );
router
    .route('/:id/resendotp')
    .post(protect, restrictTo('admin', 'user'), userController.resendOtp);

router
    .route('/:id/transaction')
    .patch(protect, restrictTo('admin', 'user'), userController.updateUserWallet);

router
    .route('/:id/transactions')
    .get(
        protect,
        restrictTo('admin', 'user'),
        userController.getUserTransactions
    );

router
    .route('/:id/balance')
    .get(protect, restrictTo('admin', 'user'), userController.getUserBalance);

router
    .route('/:id/activateinsurance')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        upload.any('video'),
        periodController.getUserAndOnInsurance
    );

router
    .route('/:id/insurancestatus')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        periodController.updateUserInsuranceStatus
    );

router
    .route('/:id/deactivateinsurance')
    .patch(
        protect,
        restrictTo('admin', 'user'),
        periodController.getUserAndOffInsurance
    );
router
    .route('/inappmessage').get(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),
        userController.getUserAndSendMessage)

.post(
    protect,
    restrictTo('admin', 'user'),
    upload.single('image'),
    userController.getUserAndSendMessage);
router
    .route('/contact')
    .post(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),
        emailController.sendMessage
    );
router
    .route('/:id/verifyinsurance')
    .get(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),

        periodController.verifyInsurance)

.post(
    protect,
    restrictTo('admin', 'user'),
    upload.single('image'),
    periodController.verifyInsurance);

router
    .route('/:id/purchaseinsurance')
    .get(
        protect,
        restrictTo('admin', 'user'),
        upload.single('image'),

        periodController.purchaseInsurance)

.post(
    protect,
    restrictTo('admin', 'user'),
    upload.single('image'),
    periodController.purchaseInsurance);

module.exports = router;