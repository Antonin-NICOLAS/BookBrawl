const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getLastReadBooks } = require('../controllers/homecontroller');
const { secure } = require("../middlewares/authsecure");

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);


router.use(secure);

//home
router.get('/last-read-books', getLastReadBooks);


module.exports = router;