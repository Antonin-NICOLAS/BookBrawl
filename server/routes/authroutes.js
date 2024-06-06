const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv').config();
const { test, registerUser, loginUser } = require('../controllers/authcontroller')

const router = express.Router()

router.use(
    cors({
        credentials: true,
        origin: `https://book-brawl.vercel.app`
    })
)

router.get('/', test)

router.post('/register', registerUser)

router.post('/login', loginUser)

module.exports = router
