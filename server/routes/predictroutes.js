const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { secure } = require("../middlewares/authsecure");
const { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook, addFutureReader, markBookAsCurrent, markBookAsRead, getFutureStatus, getCurrentStatus } = require('../controllers/predictbookcontroller');

const router = express.Router();
const upload = multer();

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
router.get('/delete/:bookId', deleteFutureUserBook);
//book details
router.post('/:bookId/future-readers', addFutureReader);
router.post('/:bookId/markasread', upload.none(), markBookAsRead);
router.post('/:bookId/markascurrent', markBookAsCurrent);
router.get('/:bookId/futurebook', getFutureStatus);
router.get('/:bookId/currentbook', getCurrentStatus);

module.exports = router;