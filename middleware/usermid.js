const User = require('../model/user');
const jwt = require('jsonwebtoken');
const customError = require('../util/customError');

// Check if user is logged in
exports.isLoggedIn = async (req, res, next) => {

    try {

        const token = req.cookies.token || req.headers("authorization").replace("Bearer ", "");

        if (!token) {
            return next(new customError("Please login to get access", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id)

        next();

    } catch (error) {
        console.log(error);
    }

}

// Check users role
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!(roles.includes(req.user.role))) {
            return next(new customError("You are not authorized to access this route", 403));
        }
        next();
    };
}
