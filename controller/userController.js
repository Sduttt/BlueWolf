const User = require('../model/user');
const customError = require('../util/customError');
const cookieToken = require('../util/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

exports.signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return next(new customError("Name, Email & Password is required", 400));
    }

    let result;
    if (req.files) {
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