const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { secure } = require("../middlewares/authsecure");
const { addUserBook, getUserBooks, getUserRecentBooks, getUserFavoriteBooks, checkExistingBook, BookSuggestion, getBookById, deleteUserBook } = require('../controllers/bookcontroller');
const uploadbook = require('../config/multerbooks');

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.use(secure);

//accounts
router.get('/userrecentbooks', getUserRecentBooks)
//books
router.get('/userbooks', getUserBooks);
router.get('/userfavoritebooks', getUserFavoriteBooks)
router.post('/add', uploadbook.single('image'), addUserBook);
router.get('/delete', deleteUserBook);
router.get('/checkbook', checkExistingBook)
router.get('/suggest', BookSuggestion);
//book details
router.get('/:bookId', getBookById)

module.exports = router;