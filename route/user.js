const express = require('express');
const router = express.Router();

const { signup } = require('../controller/userController');
const { login } = require('../controller/userController');
const { logout } = require('../controller/userController');
const { forgotPassword } = require('../controller/userController');
const { resetPassword } = require('../controller/userController');
const { userProfile } = require('../controller/userController');
const { isLoggedIn } = require('../middleware/usermid');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').post(resetPassword);
router.route('/profile').get(isLoggedIn, userProfile);

module.exports = router;