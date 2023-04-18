require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        maxlength: [40, 'A user name must have less or equal then 40 characters'],
        minlength: [5, 'A user name must have more or equal then 5 characters']
    },
    email: {
        type: String,
        required: [true, 'Please tell us your email!'],
        validator: [validator.isEmail, 'Please provide a valid email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minlength: [8, 'A password must have more or equal then 8 characters'],
        maxlength: [20, 'A password must have less or equal then 20 characters'],
        select: false
    },
    photo: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
    }
})



//encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    else this.password = await bcrypt.hash(this.password, 10);
})

//compare password
userSchema.methods.isValidatedPassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

//generate token
userSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
    const forgotToken = crypto.randomBytes(20).toString('hex');

    //hash token and set to resetPasswordToken field
    this.forgotPasswordToken = crypto.createHash('SHA256').update(forgotToken).digest('hex')

    this.forgotPasswordExpire = Date.now() + 2 * 60 * 60 * 1000;

    return forgotToken;

}

module.exports = mongoose.model('User', userSchema);