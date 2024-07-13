const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { secure } = require("../controllers/authsecure");
const { getUserRewards, verifyRewards } = require('../controllers/rewardscontroller')

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.use(secure);

router.get('/userrewards', getUserRewards);
router.get('/checkrewards', verifyRewards)

module.exports = router;