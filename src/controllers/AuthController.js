const User = require('../models/User')
const { registerValidation, loginValidation } = require('../middlewares/validation')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const AuthController = {

    // register user
    async register_user(req, res) {
        const { error } = registerValidation(req.body)
        if (error) {
            return res.status(400).send({ message: error['details'][0]['message'] })
        }
        const userExists = await User.findOne({ email: req.body.email })
        if (userExists) {
            return res.status(400).send({ message: 'User already exists' })
        }
        const usernameExists = await User.findOne({ username: req.body.username })
        if (usernameExists) {
            return res.status(400).send({ message: 'Username already taken' })
        }

        // encrypt password
        const salt = await bcryptjs.genSalt(5)
        const hashedPassword = await bcryptjs.hash(req.body.password, salt)

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        try {
            const savedUser = await user.save()
            res.status(201).send(savedUser)
        }
        catch (err) {
            res.status(500).send({ message: err })
        }
    },

    // user login
    async login_user(req, res) {
        const { error } = loginValidation(req.body)
        if (error) {
            return res.status(403).send({ message: error['details'][0]['message'] })
        }

        // Check if user is registered in our system
        const user = await User.findOne({ username: req.body.username })
        if (!user) {
            return res.status(401).send({ message: 'User does not exist' })
        }

        // check password match
        const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
        if (!passwordValidation) {
            return res.status(401).send({ message: 'Username/Passowrd is incorrect' })
        }

        // create user token
        const tokenPayload = {
            _id: user._id,
            username: user.username
        }
        const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET)
        // res.setHeader('auth-token', token)
        res.header('auth-token', token).send(`You have successfully logged into Piazza! Here is your token:${token}. Have fun posting`)
    }
}

module.exports = AuthController