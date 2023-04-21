const express = require('express');
const router = express.Router();

const { createOrder, getSingleOrder, myOrders, adminGetAllOrders, updateOrder, deleteOrder } = require('../controller/orderController');
const { isLoggedIn, checkRole } = require('../middleware/usermid');

//admin routes
router.route('/admin/all').get(isLoggedIn, checkRole('admin'), adminGetAllOrders);
router.route('/admin/:id').put(isLoggedIn, checkRole('admin'), updateOrder);
router.route('/admin/:id').delete(isLoggedIn, checkRole('admin'), deleteOrder);

//user routes
router.route('/new').post(isLoggedIn, createOrder);
router.route('/myorders').get(isLoggedIn, myOrders);
router.route('/:id').get(isLoggedIn, getSingleOrder);

module.exports = router;