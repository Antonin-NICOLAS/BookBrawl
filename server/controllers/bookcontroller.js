const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('cloudinary')

// Route pour ajouter un livre
const addUserBook = async (req, res) => {
    try {
        const { title, wordsRead, userId } = req.body;
        const image = req.file.path;

        const book = new Book({
            title,
            image,
            wordsRead,
            user: userId,
        });

        await book.save();

        // Mettre à jour le nombre total de mots lus par l'utilisateur
        const user = await User.findById(userId);
        user.wordsRead += parseInt(wordsRead, 10);
        await user.save();

        res.status(200).json(book);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre" });
    }
};

// Route pour récupérer les livres d'un utilisateur
const getUserBooks = async (req, res) => {
    try {
        const { userId } = req.query;
        const books = await Book.find({ user: userId });
        res.status(200).json(books);
    } catch (error) {
        console.error('Erreur de récupération des livres :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres' });
    }
};

module.exports = { addUserBook, getUserBooks };