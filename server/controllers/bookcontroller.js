const Book = require('../models/book');
const User = require('../models/user');
const { checkAndAwardRewards } = require('./rewardscontroller');
const mongoose = require('mongoose')

// Route pour ajouter un livre avec une critique
const addUserBook = async (req, res) => {
    try {
        const { title, author, language, wordsRead, startDate, endDate, Readingstatus, description, rating } = req.body;
        const userId = req.user.id;

        // Vérifier si le livre existe déjà
        let book = await Book.findOne({ title: title, author: author, language: language });
        if (book) {
            console.log('livre reconnu !')
        }
        else {
            console.log('livre inconnu !')
        }

        if (!book) {
            const image = req.file.path;
            const themes = JSON.parse(req.body.themes);

            book = new Book({
                title,
                author,
                language,
                wordsRead,
                image,
                themes,
                reviews: [{
                    user: userId,
                    description,
                    rating,
                    Readingstatus,
                    startDate,
                    endDate,
                }]
            });
        } else {
            // Si le livre existe, ajouter une nouvelle critique
            book.reviews.push({
                user: userId,
                description,
                rating,
                Readingstatus,
                startDate,
                endDate,
            });
        }

        // Mettre à jour les lecteurs actuels ou passés
        if (Readingstatus === 'en train de lire') {
            book.currentReaders.push(userId);
        } else if (Readingstatus === 'lu') {
            book.pastReaders.push(userId);
        }
        else if (Readingstatus === 'à lire') {
            book.futureReaders.push(userId);
        }

        await book.save();

        // Mettre à jour le nombre total de mots lus par l'utilisateur
        const user = await User.findById(userId);
        user.wordsRead += parseInt(req.body.wordsRead, 10);

        //gérer les livres favoris
        console.log('rating :', rating)
        if (rating === '5') {
            user.favoriteBooks.push(book._id);
            console.log('added to favorites')
        }
        user.booksRead.push(book._id);
        await user.save();

        await checkAndAwardRewards(userId);

        res.status(200).json(book);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre" });
    }
};

// Route pour récupérer les livres d'un utilisateur
const getUserBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('booksRead');
        res.status(200).json(user.booksRead);

    } catch (error) {
        console.error('Erreur de récupération des livres :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres' });
    }
};

//récupérer les livres récents
const getUserRecentBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).lean();

        const books = await Book.aggregate([
            { $match: { _id: { $in: user.booksRead } } }, //filtre les livres pour ne garder que ceux dont l'ID est dans la liste user.booksRead.
            { $unwind: '$reviews' }, //déroule le tableau reviews de chaque livre.
            { $match: { 'reviews.user': new mongoose.Types.ObjectId(userId) } }, //filtre les documents pour ne garder que ceux où l'utilisateur de la critique correspond à l'ID de l'utilisateur actuel.
            { $sort: { 'reviews.endDate': -1 } }, //trie les documents par la date de fin de lecture (endDate) dans l'ordre décroissant.
            { $limit: 3 },
            {
                $project: {
                    title: 1,
                    author: 1,
                    language: 1,
                    wordsRead: 1,
                    image: 1,
                    themes: 1,
                    reviews: ['$reviews', 0],
                    futureReaders: 1,
                    currentReaders: 1,
                    pastReaders: 1
                }
            }
        ]);

        res.status(200).json(books);
    } catch (error) {
        console.error('Erreur de récupération des livres :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres' });
    }
};

const getUserFavoriteBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('favoriteBooks');
        res.status(200).json(user.favoriteBooks);
    } catch (error) {
        console.error('Erreur de récupération des livres favoris :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres favoris' });
    }
};

const checkExistingBook = async (req, res) => {
    const { title } = req.query;

    try {
        const book = await Book.findOne({ title });
        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(200).json({ error: "Les données de ce livre n'ont pas été trouvées" });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

const BookSuggestion = async (req, res) => {
    const { title } = req.query;

    try {
        // Rechercher les titres de livres existants qui commencent par le motif fourni
        const books = await Book.find({ title: { $regex: title, $options: 'i' } }).select('title');

        if (books.length > 0) {
            return res.status(200).json(books);
        } else {
            return res.status(200).json({ error: 'Aucun livre trouvé' });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getBookById = async (req, res) => {
    const { bookId } = req.params;

    try {
        const book = await Book.findById(bookId)
            .populate({
                path: 'reviews.user',
            })
            .populate({
                path: 'futureReaders',
            })
            .populate({
                path: 'currentReaders',
            })
            .populate({
                path: 'pastReaders',
            });

        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        res.status(200).json(book.toJSON());
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID de livre invalide' });
        }
        console.error('Error fetching book details:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};
module.exports = { addUserBook, getUserBooks, getUserRecentBooks, getUserFavoriteBooks, checkExistingBook, BookSuggestion, getBookById };