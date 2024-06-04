const express = require('express')
const cors = require('cors');
const { test, registerUser, loginUser } = require('../controllers/authcontroller')

const router = express.Router()

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

router.get('/', test)

router.post('/register', registerUser)

router.post('/login', loginUser)

module.exports = router
