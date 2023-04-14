exports.home = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            greeting: "Hello from api"
        })
    } catch (error) {
        console.log(error)
    }
}


exports.homedummy = async (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "A dummy route"
    })
}
