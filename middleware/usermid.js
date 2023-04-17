const User = require('../model/user');
const jwt = require('jsonwebtoken');
const customError = require('../util/customError');

exports.isLoggedIn = async (req, res, next) => {

    try {

        const token  = req.cookies.token || req.headers("authorization").replace("Bearer ", "");

        if (!token) {
            return next(new customError("Please login to get access", 401));
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = await User.findById(decoded.id)
        // console.log(decoded);
    
        next();

    } catch (error) {
        console.log(error);
    }

}