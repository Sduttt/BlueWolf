const express = require('express');
const router = express.Router();

const { sendStripeKey, capturePayment } = require('../controller/paymentController');
const { isLoggedIn, checkRole } = require('../middleware/usermid');

router.route('/send-stripe-key').get(isLoggedIn, sendStripeKey);
router.route('/stripe').post(isLoggedIn, capturePayment);

module.exports = router;    