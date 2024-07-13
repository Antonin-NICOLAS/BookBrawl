const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { test, registerUser, loginUser, logoutUser, getProfile, changePassword, addUserAvatar, addUserStatus, getUserStatus, getUserAvatar } = require('../controllers/authcontroller');
const { secure } = require("../controllers/authsecure");
const uploadavatar = require('../config/multeravatar')

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', getProfile);

router.use(secure);

router.post('/addavatar', uploadavatar.single('image'), addUserAvatar);
router.post('/addstatus', addUserStatus)
router.get('/userstatus', getUserStatus);
router.get('/useravatar', getUserAvatar);
router.post('/change-password', changePassword);

module.exports = router;