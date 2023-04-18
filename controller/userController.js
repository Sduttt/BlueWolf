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
        },
        role: "user"
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

//Update password
exports.updatePassword = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const user = await User.findById(userId).select("+password");

        const isCorrectPassword = await user.isValidatedPassword(req.body.oldPassword);

        if (!isCorrectPassword) {
            return next(new customError("Password didn't match!", 400));
        }

        user.password = req.body.newPassword;

        await user.save();

        cookieToken(user, res);

    } catch (error) {
        console.log(error.message);
    }
}

//Update profile
exports.updateProfile = async (req, res, next) => {

    try {

        const { name, email } = req.body;

        if (!name || !email) {
            return next(new customError("Name & Email is required", 400));
        }

        const newData = {
            name: req.body.name,
            email: req.body.email
        }

        if (req.files) {
            const user = await User.findById(req.user.id);
            const imgId = user.photo.id;

            await cloudinary.uploader.destroy(imgId);

            const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
                folder: "user",
                width: 150,
                crop: "scale"
            })

            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }
        }

        const user = await User.findByIdAndUpdate(req.user.id, newData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
        })


    } catch (error) {
        console.log(error.message)
    }
}

//usersList:
exports.usersList = async (req, res, next) => {
    try {

        const users = await User.find();

        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        console.log(error.message)
    }
}

// userlist without admin:
exports.usersOnly = async (req, res, next) => {
    try {

        const users = await User.find({ role: "user" });

        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        console.log(error.message)
    }
}

//getSingleUser:
exports.getSingleUser = async (req, res, next) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new customError("User not found", 400));
        }

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error.message)
    }
}

//update single user by admin
exports.updateProfileByAdmin = async (req, res, next) => {

    try {

        // const user = await User.findById(req.params.id);

        // if (!user) {
        //     return next(new customError("User not found", 400));
        // }

        const { name, email } = req.body;

        if (!name || !email) {
            return next(new customError("Name & Email is required", 400));
        }

        const newData = {
            name: req.body.name,
            email: req.body.email
        }

        if (req.files) {
            const user = await User.findById(req.user.id);
            const imgId = user.photo.id;

            await cloudinary.uploader.destroy(imgId);

            const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
                folder: "user",
                width: 150,
                crop: "scale"
            })

            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, newData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
        })


    } catch (error) {
        console.log(error.message)
    }
}

//delete user by admin
exports.deleteProfileByAdmin = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new customError("User not found", 400));
    }

    const imgId = user.photo.id;
    await cloudinary.uploader.destroy(imgId);

    await User.deleteOne({_id: user._id});

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
}

