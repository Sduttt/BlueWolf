const cookieToken = (user, res) => {
    const token = user.getSignedToken();

    const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    user.password = undefined;

    res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}


module.exports = cookieToken;