const User = require('../model/user');
const customError = require('../util/customError');
const cookieToken = require('../util/cookieToken');
const fileUpload = require('express-fileupload');
const emailSender = require('../util/emailSender');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// Signup
exports.signup = async (req, res, next) => {

    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return next(new customError("Name, Email & Password is required", 400));
    }

    let result;
    if (!req.files) {
        return next(new customError("Please upload a photo", 400))
    } else {
        try {
            const file = req.files.photo;
            result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: "user",
                width: 150,
                crop: "scale"
            })
        } catch (error) {
            console.log(error)
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });


    cookieToken(user, res);
}

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new customError("Email & Password is required", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new customError("User is not registered", 400));
    }

    const isPasswordMatched = await user.isValidatedPassword(password);

    if (!isPasswordMatched) {
        return next(new customError("Invalid credentials", 400));
    }

    cookieToken(user, res);
}

//Logout
exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged out"
    })
}

//Forgot Password
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new customError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new customError("User is not registered", 400));
    }

    const resetToken = user.getForgotPasswordToken();

    await user.save({ validateBeforeSave: false });

    const myUrl = `${req.protocol}://${req.get('host')}/api/v1/user/resetpassword/${resetToken}`;

    const message = `Your password reset token is as follow: \n\n ${myUrl} \n\n If you have not requested this email, then ignore it.`;

    try {
        await emailSender({
            email: user.email,
            subject: "Bluewolf Password Reset Token",
            message
        })

        res.status(200).json({
            success: true,
            message: "Email sent"
        })

    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new customError(error.message, 500));
    }

}

//Reset Password
exports.resetPassword = async (req, res, next) => {

    try {
        const token = req.params.resetToken;

        const encryptedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            forgotPasswordToken: encryptedToken,
            forgotPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new customError("Invalid token or token expired", 400));
        }

        user.password = req.body.password;

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpire = undefined;

        await user.save();

        cookieToken(user, res);
    } catch (error) {
        console.log(error.message)
    }

}

// User Profile
exports.userProfile = async (req, res, next) => {

    try {
        
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.log(error.message);
    }
}
