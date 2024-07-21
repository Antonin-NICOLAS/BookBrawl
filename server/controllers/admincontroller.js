const Book = require('../models/book');
const jwt = require('jsonwebtoken')

//admin
const checkAdmin = (req, res) => {
    const { jwtauth } = req.cookies;
    if (jwtauth) {
        jwt.verify(jwtauth, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).send({ isAdmin: false });
            const isAdmin = user.role === 'admin';
            res.json({ isAdmin });
        });
    } else {
        res.json({ isAdmin: false });
    }
};

// Récupérer les livres en attente de vérification
const getUnverifiedBooks = async (req, res) => {
    try {
        const books = await Book.find({ isVerified: false });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des livres en attente de vérification.' });
    }
};

// Marquer un livre comme vérifié
const verifyBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        await Book.findByIdAndUpdate(bookId, { isVerified: true });
        res.status(200).json({ message: 'Livre vérifié avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification du livre.' });
    }
};

module.exports = {checkAdmin, verifyBook, getUnverifiedBooks}