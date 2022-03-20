const express = require('express');

//initialize  express router
const router = express.Router();

//import authentication controller
const authController = require('../controllers/authController');

//import admin controller
const adminController = require('../controllers/adminController');

//import user controller
const userController = require('../controllers/userController');

//import claim controller
const claimController = require('../controllers/claimsController');

//import role base controller
const { protect, restrictTo } = require('../middlewares/authentication');

//mouting routes
router.post('/signup', authController.signupAdmin);
router.post('/login', authController.loginAdmin);

router.post('/forgotpassword', authController.forgotpassword);
router.patch('/resetpassword/:token', authController.resetpassword);
// router.get('/dashboard', function(req, res) {
//     res.sendFile(__dirname + '../payuhtml/dashboard.html');
// });
router
    .route('/users/create')
    .post(protect, restrictTo('admin', 'user'), adminController.createUser);
router
    .route('/users/pdf')
    .post(protect, restrictTo('admin', 'user'), adminController.exportUserAsPdf);
router
    .route('/users')
    .get(protect, restrictTo('admin', 'user'), adminController.getAllUsers).post(protect, restrictTo('admin', 'user'), adminController.exportUserAsExcel);

router
    .route('/users/active')
    .get(protect, restrictTo('admin', 'user'), adminController.getAllActiveUsers);
router
    .route('/users/inactive')
    .get(protect, restrictTo('admin', 'user'), adminController.getAllInActiveUsers);
router
    .route('/users/deactivated')
    .get(protect, restrictTo('admin', 'user'), adminController.getAllDeactivatedUsers);
router
    .route('/users/revenue')
    .get(protect, restrictTo('admin', 'user'), adminController.getUsersExpenditures);

router
    .route('/users/outflows')
    .get(protect, restrictTo('admin', 'user'), adminController.getUsersWithdrawals);

router
    .route('/users/inflows')
    .get(protect, restrictTo('admin', 'user'), adminController.getUsersDeposits);


router
    .route('/users/insuranceactivationcounter')
    .get(protect, restrictTo('admin', 'user'), adminController.getInsuranceActivationCount);

router
    .route('/users/:id')
    .get(protect, restrictTo('admin', 'user'), adminController.getUser)
    .patch(protect, restrictTo('admin', 'user'), adminController.updateUser);
router
    .route('/users/:id/deleteuser')
    .delete(protect, restrictTo('admin', 'user'), adminController.deleteUser)
    .get(protect, restrictTo('admin', 'user'), adminController.deleteUser);
router
    .route('/users/:id/transaction')
    .patch(protect, restrictTo('admin', 'user'), adminController.updateUserWallet);

router
    .route('/:id/transactions')
    .get(protect, restrictTo('admin', 'user'), adminController.getUserTransactions)
    .get(protect, restrictTo('admin', 'user'), adminController.getUserTransactionsById);
router
    .route('/transactions')
    .get(protect, restrictTo('admin', 'user'), adminController.getTransactions);

router
    .route('/:id/balance')
    .get(protect, restrictTo('admin', 'user'), adminController.getUserBalance);

router
    .route('/sendemail')
    .get(protect, restrictTo('admin', 'user'), adminController.getUsersAndSendEmail);
router
    .route('/inappmessage')
    .post(protect, restrictTo('admin', 'user'), userController.sendInAppMessage);
router
    .route('/notification')
    .post(protect, restrictTo('admin', 'user'), userController.sendNotification);

router
    .route('/claims')
    .get(protect, restrictTo('admin', 'user'), claimController.getAllClaims).post(protect, restrictTo('admin', 'user'), claimController.exportUserClaimAsExcel);
router
    .route('/claims/:id')
    .get(protect, restrictTo('admin', 'user'), claimController.getAllClaims).post(protect, restrictTo('admin', 'user'), claimController.exportUserClaimAsExcel);

router
    .route('/totalsumofallclaims')
    .get(protect, restrictTo('admin', 'user'), claimController.getSumOfAllClaims).post(protect, restrictTo('admin', 'user'), claimController.exportUserClaimAsExcel);

router
    .route('/claims/users/:id')
    .get(protect, restrictTo('admin', 'user'), claimController.getClaim)
    .patch(protect, restrictTo('admin', 'user'), claimController.updateClaim)
    .delete(protect, restrictTo('admin', 'user'), claimController.deleteClaim);
router
    .route('/updateinsurancerate')

.patch(protect, restrictTo('admin', 'user'), userController.updateAllUser);
router
    .route('/claims/users/:id/exportexcel')
    .get(protect, restrictTo('admin', 'user'), claimController.exportUserClaimAsExcel);
router
    .route('/searchwithdate')
    .get(protect, restrictTo('admin', 'user'), userController.getUsersForPdfExport);
router
    .route('/deletevehicle/:id')
    .get(protect, restrictTo('admin', 'user'), userController.deleteVehicle);

module.exports = router;