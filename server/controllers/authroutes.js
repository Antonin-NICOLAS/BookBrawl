const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { test, registerUser, loginUser, logoutUser, changePassword } = require('../controllers/authcontroller');
const { secure } = require("../middlewares/authsecure");

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.get('/', test);
//popup-login
router.post('/register', registerUser);
router.post('/login', loginUser);
//accounts
router.post('/logout', logoutUser);

router.use(secure);

//accounts
router.post('/change-password', changePassword);

module.exports = router;