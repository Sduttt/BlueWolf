const Order = require('../model/order');
const Product = require('../model/product');
const customError = require('../util/customError');


exports.createOrder = async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new customError('No order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    try {

        const orders = await Order.find({ user: req.user._id });

        if (!orders) {
            return next(new customError('No order found with this ID', 404))
        }

        res.status(200).json({
            success: true,
            orders
        })

    } catch (error) {
        console.log(error.message)
    }
}

exports.adminGetAllOrders = async (req, res, next) => {
    try {

        const orders = await Order.find();

        if (!orders) {
            return next(new customError('No order found', 404))
        }

        res.status(200).json({
            success: true,
            orders
        })

    } catch (error) {
        console.log(error.message)
    }


}

exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new customError('No order found with this ID', 404))
    }

    if (order.orderStatus === 'Delivered') {
        return next(new customError('You have already delivered this order', 400))
    }

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    await order.save();

    res.status(200).json({
        success: true,
        order
    })

}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (!product) {
        // Handle the case where the product is not found or null
        console.log(`Product with ID ${id} not found`);
        return;
    }

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new customError('No order found with this ID', 404))
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order is deleted'
    })
}