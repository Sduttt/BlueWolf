const mongoose = require('mongoose');
const Product = require('../model/product');
const customError = require('../util/customError');
const cloudinary = require('cloudinary').v2;
const whereClaus = require('../util/whereClaus');

// Create new product
exports.createProduct = async (req, res, next) => {

    //images
    let images = [];
    if (!req.files) {
        return next(new customError("Please upload product photos", 400))
    }
    try {
        if (req.files) {
            for (let i = 0; i < req.files.photos.length; i++) {
                let result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
                    folder: "products"
                });

                images.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        }
    } catch (error) {
        console.log(error)
    }


    req.body.photos = images;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })

}

// Get all products
exports.getProducts = async (req, res, next) => {

    const resultPerPage = 5;
    const totalProducts = await Product.countDocuments();


    const productsObj = new whereClaus(Product.find(), req.query).search().filter();

    let products = productsObj.base;

    const filteredProductsCount = await products.length;

    productsObj.pager(resultPerPage)
    products = await productsObj.base.clone();
    res.status(200).json({
        success: true,
        products,
        totalProducts,
        filteredProductsCount
    });
}

// Get single product
exports.getSingleProduct = async (req, res, next) => {

    try {

        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new customError('Invalid ID', 400));
        }

        const product = await Product.findById(id);

        if (!product) {
            return next(new customError("There is no product with this ID", 400))
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

//Admin get all products
exports.getAdminProducts = async (req, res, next) => {

    try {

        const products = await Product.find();

        if (!products) {
            return next(new customError("There is no product", 400))
        }

        res.status(200).json({
            success: true,
            products
        })

    } catch (error) {
        console.log(error.message)
    }
}

//admin update product
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new customError("There is no product", 400))
    }

    let images = [];

    if (req.files) {
        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.uploader.destroy(product.photos[i].id);
        }


        for (let i = 0; i < req.files.photos.length; i++) {
            let result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
                folder: "products"
            });

            images.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

        req.body.photos = images;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product
    })
}

//admin delete product
exports.deleteProduct = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new customError("There is no product", 400))
        }

        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.uploader.destroy(product.photos[i].id);
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted"
        })

    } catch (error) {
        console.log(error.message)
    }
}

// Add review to product
exports.addReview = async (req, res, next) => {
    try {

        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        }

        const product = await Product.findById(productId);

        if (!product) {
            return next(new customError("There is no product with this ID", 400))
        }

        let alreadyReviewed;

        // if (product.reviews.length = 0) {

        //     product.reviews.push(review);
        //     product.numOfReviews = product.reviews.length;
        // }

        alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());

        if (alreadyReviewed) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.comment = comment;
                    review.rating = rating;
                }
            })
        }
        else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;


        }

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true
        })

    } catch (error) {
        console.log(error.message)
    }
}

// Delete review
exports.deleteReview = async (req, res, next) => {
    try {

        const { productId } = req.body;

        const product = await Product.findById(productId);

        const reviews = product.reviews.filter(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        const numOfReviews = reviews.length;

        const rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await Product.findByIdAndUpdate(productId, {
            reviews,
            rating,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).json({
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

// Get all reviews
exports.getReviews = async (req, res, next) => {

    const { productId } = req.body;
    console.log(productId)
    const product = await Product.findById(productId);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}