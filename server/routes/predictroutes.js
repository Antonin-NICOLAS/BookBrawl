const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { secure } = require("../middlewares/authsecure");
const { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook, addFutureReader, getFutureStatus, getCurrentStatus } = require('../controllers/predictbookcontroller');

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
//book details
router.post('/:bookId/future-readers', addFutureReader);
router.get('/:bookId/futurebook', getFutureStatus);
router.get('/:bookId/currentbook', getCurrentStatus);

module.exports = router;