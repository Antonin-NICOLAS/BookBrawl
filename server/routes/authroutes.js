const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { test, registerUser, loginUser } = require('../controllers/authcontroller')

const router = express.Router()

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER
    })
)

router.get('/', test)

router.post('/register', registerUser)

router.post('/login', loginUser)

module.exports = router
