const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');
const { checkAndAwardRewards, checkAndRevokeRewards } = require('./rewardscontroller');

// Route pour ajouter un livre avec une critique
const addUserBook = async (req, res) => {
    try {
        const { title, author, language, wordsRead, startDate, endDate, Readingstatus, description, rating } = req.body;
        const userId = req.user.id;

        // Vérifier si le livre existe déjà
        let book = await Book.findOne({ title: title, author: author, language: language });

        // Vérifier si le livre existe déjà parmi les livres de l'utilisateur
        const user = await User.findById(userId).populate('booksRead favoriteBooks CurrentReader FutureReader');
        const userBookExists = user.booksRead.some(bookId => bookId.equals(book?._id)) ||
            user.CurrentReader.some(reader => reader.equals(book?._id)) ||
            user.FutureReader.some(reader => reader.equals(book?._id))

        if (userBookExists) {
            return res.json({ error: "Le livre existe déjà parmi vos livres." });
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
            user.CurrentReader.push(book._id)
        } else if (Readingstatus === 'lu') {
            book.pastReaders.push(userId);
            user.booksRead.push(book._id)
        }
        else if (Readingstatus === 'à lire') {
            book.futureReaders.push(userId);
            user.FutureReader.push(book._id)
        }

        await book.save();

        // Mettre à jour le nombre total de mots lus par l'utilisateur
        user.wordsRead += parseInt(wordsRead, 10);

        //gérer les livres favoris
        if (rating === '5') {
            user.favoriteBooks.push(book._id);
        }

        await user.save();

        await checkAndAwardRewards(userId);

        res.status(200).json(book);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre" });
    }
};

// Route pour récupérer les livres d'un utilisateur sauf les favoris car affichés par une autre fonction
const getUserBooks = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer l'utilisateur avec les listes de livres
        const user = await User.findById(userId)
            .populate('booksRead')
            .populate('favoriteBooks')
            .populate('CurrentReader')
            .populate('FutureReader');

        // Convertir les listes de livres en ensembles pour une recherche rapide
        const favoriteBooksSet = new Set(user.favoriteBooks.map(book => book._id.toString()));
        const currentReaderSet = new Set(user.CurrentReader.map(book => book._id.toString()));
        const futureReaderSet = new Set(user.FutureReader.map(book => book._id.toString()));

        // Filtrer les livres pour exclure ceux qui sont dans les favoris, currentReader ou futureReader
        const filteredBooks = user.booksRead.filter(book => 
            !favoriteBooksSet.has(book._id.toString()) &&
            !currentReaderSet.has(book._id.toString()) &&
            !futureReaderSet.has(book._id.toString())
        );

        res.status(200).json(filteredBooks);
    } catch (error) {
        console.error('Erreur de récupération des livres :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres' });
    }
};

//récupérer les livres récents
const getUserRecentBooks = async (req, res) => {

    try {
        // Récupérer tous les livres où l'utilisateur est dans pastReaders
        const userId = req.user.id;
        const books = await Book.find({ pastReaders: userId })
            .populate('reviews.user')

        // Filtrer les avis de chaque livre pour ne garder que celui de l'utilisateur
        const booksWithUserReviews = books.map(book => {
            const userReview = book.reviews.find(review => review.user._id.toString() === userId);
            return {
                ...book.toObject(),
                reviews: userReview ? [userReview] : []
            };
        });

        // Trier les livres par date de fin de lecture
        const sortedBooks = booksWithUserReviews.sort((a, b) => {
            const dateA = new Date(a.reviews[0]?.endDate || 0);
            const dateB = new Date(b.reviews[0]?.endDate || 0);
            return dateB - dateA;
        });

        // Garder les 3 livres les plus récents
        const recentBooks = sortedBooks.slice(0, 3);

        res.status(200).json(recentBooks);
    } catch (error) {
        console.error('Error fetching recent books by user:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
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
            return res.json({ error: "Les données de ce livre n'ont pas été trouvées" });
        }
    } catch (error) {
        return res.status(500).json({error: 'Erreur lors de la récupération des données de ce livre.' });
    }
};

//books => add an existing book
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
        console.error('Erreur lors de la recherche de livres équivalents :', error);
        res.status(500).json({ error: 'Erreur lors de la recherche de livres équivalents.' });
    }
};

//book details
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
            return res.json({ error: 'Aucun livre trouvé' });
        }

        res.status(200).json(book.toJSON());
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du livre :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des détails du livre.' });
    }
};

// Route pour supprimer un livre d'un utilisateur
const deleteUserBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookTitle } = req.query;

        // Supprimer le livre de toutes les listes de l'utilisateur
        const user = await User.findById(userId);
        const book = await Book.findOne({ title: bookTitle }).exec();
        const bookId = book._id

        user.booksRead.pull(bookId);
        user.favoriteBooks.pull(bookId);
        user.CurrentReader.pull(bookId);
        user.FutureReader.pull(bookId);

        user.wordsRead -= book.wordsRead;

        await user.save();

        // Supprimer les critiques de l'utilisateur sur ce livre

        book.reviews = book.reviews.filter(review => !review.user.equals(userId));
        book.currentReaders.pull(userId);
        book.futureReaders.pull(userId);
        book.pastReaders.pull(userId);

        await book.save();

        //enlever un reward si nécessaire car perte de mots
        await checkAndRevokeRewards(userId);

        // Si nécessaire, supprimer le livre de la base de données (si personne d'autre ne l'a)
        const otherUsers = await User.find({
            $or: [
                { booksRead: bookId },
                { favoriteBooks: bookId },
                { CurrentReader: bookId },
                { FutureReader: bookId }
            ]
        });

        if (otherUsers.length === 0) {
                const urlParts = book.image.split('/');
                const booksIndex = urlParts.indexOf('books');
                const publicIdWithExtension = urlParts.slice(booksIndex).join('/');
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
                await cloudinary.uploader.destroy(publicId);
            await Book.findByIdAndDelete(bookId);
        }

        res.status(200).json({ message: 'Livre supprimé avec succès' });
    } catch (error) {
        console.error("Erreur lors de la suppression d'un livre :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du livre." });
    }
};


module.exports = { addUserBook, getUserBooks, getUserRecentBooks, getUserFavoriteBooks, checkExistingBook, BookSuggestion, getBookById, deleteUserBook };