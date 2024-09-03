const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getUserRank } = require('../controllers/rankingcontroller');
const { getProfile, addUserAvatar, addUserStatus, getUserStatus, getUserAvatar, getUserById, getUserWords, getReviews } = require('../controllers/usercontroller');
const { secure } = require("../middlewares/authsecure");

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

//usercontext
router.get('/profile', getProfile);

//classement
router.get('/userranking', getUserRank);

router.use(secure);

//accounts
const uploadavatar = require('../config/multeravatar')
router.post('/addavatar', uploadavatar.single('image'), addUserAvatar);
router.post('/addstatus', addUserStatus)
router.get('/userstatus', getUserStatus);
router.get('/useravatar', getUserAvatar);
router.get('/userwords', getUserWords)
//book details
router.get('/bookdetails/:bookId', getReviews)
//user details
router.get('/userdetails/:userId', getUserById)

module.exports = router;
