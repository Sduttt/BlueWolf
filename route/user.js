const express = require('express');
const router = express.Router();

const { signup, login, logout, forgotPassword, resetPassword, userProfile, updatePassword, updateProfile, usersList, usersOnly, getSingleUser, updateProfileByAdmin, deleteProfileByAdmin } = require('../controller/userController');
const { isLoggedIn, checkRole } = require('../middleware/usermid');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').post(resetPassword);
router.route('/profile').get(isLoggedIn, userProfile);
router.route('/updatepassword').put(isLoggedIn, updatePassword)
router.route('/profile/update').put(isLoggedIn, updateProfile)
router.route('/list').get(isLoggedIn, checkRole("admin"), usersList)
router.route('/:id').get(isLoggedIn, checkRole("admin"), getSingleUser)
router.route('/:id/update').put(isLoggedIn, checkRole("admin"), updateProfileByAdmin)
router.route('/delete/:id').put(isLoggedIn, checkRole("admin"), deleteProfileByAdmin)

router.route('/normalusers').get(isLoggedIn, checkRole("manager"), usersOnly)

module.exports = router;
