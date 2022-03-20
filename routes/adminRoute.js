const express = require('express');

//initialize  express router
const router = express.Router();

//import authentication controller
const authController = require('../controllers/authController');

//import admin controller
const adminController = require('../controllers/adminController');

//import user controller
const userController = require('../controllers/userController');



//import role base controller
const { protect, restrictTo } = require('../middlewares/authentication');

//mouting routes
router.post('/signup', authController.signupAdmin);
router.post('/login', authController.loginAdmin);

router.post('/forgotpassword', authController.forgotpassword);


router
    .route('/users/create')
    .post(protect, restrictTo('admin', 'user'), adminController.createUser);



module.exports = router;