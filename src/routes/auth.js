const express = require('express')
const router = express.Router()

const AuthController = require('../controllers/AuthController')

router.post('/register', AuthController.register_user)
router.post('/login', AuthController.login_user)

module.exports = router