const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { secure } = require("../middlewares/authsecure");
const { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook } = require('../controllers/predictbookcontroller');

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.use(secure);

//books
router.get('/userfuturebooks', getUserFutureBooks);
router.get('/usercurrentbooks', getUserCurrentBooks);
router.get('/delete', deleteFutureUserBook);

module.exports = router;