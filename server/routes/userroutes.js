const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getUserRank } = require('../controllers/rankingcontroller');
const { getProfile, addUserAvatar, addUserStatus, getUserStatus, getUserAvatar, getUserById } = require('../controllers/usercontroller');
const { secure } = require("../middlewares/authsecure");
const uploadavatar = require('../config/multeravatar')

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

//usercontext
router.get('/profile', getProfile);

router.use(secure);

//classement
router.get('/userranking', getUserRank);
//accounts
router.post('/addavatar', uploadavatar.single('image'), addUserAvatar);
router.post('/addstatus', addUserStatus)
router.get('/userstatus', getUserStatus);
router.get('/useravatar', getUserAvatar);
//book details
router.get('/:userId', getUserById)

module.exports = router;