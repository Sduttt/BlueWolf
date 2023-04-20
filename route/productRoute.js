const express = require('express');
const router = express.Router();

const { isLoggedIn, checkRole } = require('../middleware/usermid');
const { createProduct, getProducts, getAdminProducts, getSingleProduct, updateProduct, deleteProduct, addReview, deleteReview, getReviews } = require('../controller/productController');

//user route
router.route('/').get(getProducts);
router.route('/reviews').put(getReviews);
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);

//admin route
router.route('/add').post(isLoggedIn, checkRole('admin'), createProduct);
router.route('/foradmin').get(isLoggedIn, checkRole('admin'), getAdminProducts);


//admin and user routes (with id)
router.route('/:id').get(getSingleProduct);
router.route('/update/:id').put(isLoggedIn, checkRole('admin'), updateProduct);
router.route('/delete/:id').put(isLoggedIn, checkRole('admin'), deleteProduct);


module.exports = router;