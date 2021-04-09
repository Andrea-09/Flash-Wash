const express = require('express')
const router = express.Router()

const Authenticator = require('./Authenticator')
const { register, login, getCurrentUser, updateUser, requestPassword, requestPasswordHandler } = require('../controllers/Users/UserController')

router.get('/my-info', Authenticator, getCurrentUser)

router.post('/request-recover', requestPassword)
router.post('/recover-handler', requestPasswordHandler)
router.post('/register', register)
router.post('/login', login)

router.put('/update', Authenticator, updateUser)

module.exports = router