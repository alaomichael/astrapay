const express = require('express');

//initialize  express router
const router = express.Router();

//import user controller
const userController = require('../controllers/userController');

// import insurance controller
const periodController = require('../controllers/periodController');

//import role base controller
const { protect, restrictTo } = require('../middlewares/authentication');

router
    .route('/')
    .post(protect, restrictTo('admin', 'user'), userController.createUser)
    .get(protect, restrictTo('admin'), userController.getAllUsers);

router
    .route('/:id')
    .get(protect, restrictTo('admin'), userController.getUser)
    .patch(protect, restrictTo('admin'), userController.updateUser)
  ;

module.exports = router;