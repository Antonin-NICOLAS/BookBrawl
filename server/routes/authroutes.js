const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { test, registerUser, loginUser, logoutUser, getProfile, changePassword, addUserAvatar } = require('../controllers/authcontroller');
const { secure } = require("../controllers/authsecure");
const { getUserRank } = require('../controllers/rankingcontroller');
const { addUserBook, getUserBooks } = require('../controllers/bookcontroller');
const uploadbook = require('../config/multerbooks');
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

router.post('/addavatar', uploadbook.single('image'), addUserAvatar);
router.post('/change-password', changePassword);
router.get('/userranking', getUserRank);
router.get('/userbooks', getUserBooks);
router.post('/addbook', uploadbook.single('image'), addUserBook);

module.exports = router;