const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    const token = req.header('auth-token')

    if (!token) {
        return res.status(401).send({ message: 'Access Denied' })
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.userData = verified
        next()
    }
    catch (err) {
        console.error('JWT Verification Error:', err);
        return res.status(401).send({ message: 'Invalid token' })
    }
}

module.exports = auth