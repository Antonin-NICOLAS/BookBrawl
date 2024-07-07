const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { test, registerUser, loginUser, logoutUser, getProfile } = require('../controllers/authcontroller')
const { getUserRank } = require('../controllers/rankingcontroller')

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

router.post('/logout', logoutUser)

router.get('/profile', getProfile)

router.get('/userranking', getUserRank);

module.exports = router
