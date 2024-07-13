const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { secure } = require("../controllers/authsecure");
const { getUserRank } = require('../controllers/rankingcontroller');
const { addUserBook, getUserBooks, getUserRecentBooks } = require('../controllers/bookcontroller');
const uploadbook = require('../config/multerbooks');

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_SERVER,
    })
);

router.use(secure);

router.get('/userranking', getUserRank);
router.get('/userbooks', getUserBooks);
router.get('/userrecentbooks', getUserRecentBooks)
router.post('/addbook', uploadbook.single('image'), addUserBook);

module.exports = router;