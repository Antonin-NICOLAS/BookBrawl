const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { checkAdmin, getUnverifiedBooks, verifyBook } = require('../controllers/admincontroller');
const { secure } = require("../middlewares/authsecure");
const { admin } = require('../middlewares/adminsecure')

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

//admin context
router.get('/adminprofile', checkAdmin);

router.use(secure)
router.use(admin);

router.get('/unverified', getUnverifiedBooks);
router.put('/verify/:bookId', verifyBook);
router

module.exports = router;