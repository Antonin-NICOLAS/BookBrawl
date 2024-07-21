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
        const books = await Book.find({ isVerified: false }).populate('pastReaders', 'prenom');
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livres en attente de vérification.' });
    }
};

// Marquer un livre comme vérifié
const verifyBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        await Book.findByIdAndUpdate(bookId, { isVerified: true });
        res.status(200).json({ message: 'Livre vérifié avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la vérification du livre.' });
    }
};

// Route pour mettre à jour les informations d'un livre
const updateBook = async (req, res) => {
    try {
        const { title, author, wordsRead } = req.body;
        const { bookId } = req.params;

        // Trouver le livre par ID
        const book = await Book.findById(bookId);
        if (!book) {
            return res.json({ error: "Livre non trouvé" });
        }

        // Mettre à jour les informations du livre
        book.title = title || book.title;
        book.author = author || book.author;
        book.wordsRead = wordsRead || book.wordsRead;
        book.isVerified = true;

        await book.save();
        res.status(200).json(book);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du livre :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du livre" });
    }
};

module.exports = {checkAdmin, verifyBook, getUnverifiedBooks, updateBook }