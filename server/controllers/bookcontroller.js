const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');
const slugify = require('slugify');
const { checkAndAwardRewards, checkAndRevokeRewards } = require('./rewardscontroller');

// Route pour ajouter un livre avec une critique
const addUserBook = async (req, res) => {
    try {
        const { title, author, language, wordsRead, startDate, endDate, Readingstatus, description, rating, imageUrl, isAdmin } = req.body;
        const userId = req.user.id;

        // Vérifier les dates si le statut de lecture est "Lu"
        if (startDate > endDate) {
            return res.json({ error: "La date de début doit être avant celle de fin" })
        }

        // Vérifier si le livre existe déjà
        let book = await Book.findOne({ title, author, language });

        // Vérifier si le livre existe déjà parmi les livres de l'utilisateur
        const user = await User.findById(userId).populate('booksRead favoriteBooks CurrentReader FutureReader');
        const userBookExists = user.booksRead.some(bookId => bookId.equals(book?._id)) ||
            user.CurrentReader.some(reader => reader.equals(book?._id)) ||
            user.FutureReader.some(reader => reader.equals(book?._id));

        if (userBookExists) {
            return res.json({ error: "Le livre existe déjà parmi vos livres." });
        }

        //image
        let image;
        if (req.file) {
            image = req.file.path;
        } else if (imageUrl) {
            const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
                folder: 'books',
                public_id: slugify(title, { lower: true, strict: true })
            });
            image = uploadedImage.secure_url;
        }

        if (!book) {

            const themes = req.body.themes ? JSON.parse(req.body.themes) : [];

            book = new Book({
                title,
                author,
                language,
                wordsRead,
                image,
                themes: Readingstatus === 'Lu' ? themes : themes || [],
                isVerified: isAdmin === 'true' ? true : false,
                reviews: Readingstatus === 'Lu' ? [{
                    user: userId,
                    description,
                    rating,
                    startDate,
                    endDate,
                }] : [{
                    user: userId,
                    startDate,
                    endDate
                }]
            });
        } else if (Readingstatus === 'Lu') {
            book.reviews.push({
                user: userId,
                description,
                rating,
                startDate,
                endDate,
            });
        } else if (Readingstatus === 'À lire' || 'En train de lire') {
            book.reviews.push({
                user: userId,
                startDate,
                endDate,
            })
        }
        //si le livre existe et que l'utilisateur ne l'a pas encore lu, pas besoin d'ajouter de données

        // Mettre à jour les lecteurs selon le statut de lecture
        if (Readingstatus === 'Lu') {
            book.pastReaders.push(userId);
            user.booksRead.push(book._id);
            user.wordsRead += parseInt(wordsRead, 10);
            if (rating === '5') {
                user.favoriteBooks.push(book._id);
            }
        } else if (Readingstatus === 'En train de lire') {
            book.currentReaders.push(userId);
            user.CurrentReader.push(book._id);
            user.futureWordsRead += parseInt(wordsRead, 10);
        } else if (Readingstatus === 'À lire') {
            book.futureReaders.push(userId);
            user.FutureReader.push(book._id);
            user.futureWordsRead += parseInt(wordsRead, 10);
        }

        await book.save();
        await user.save();

        if (Readingstatus === 'Lu') {
            await checkAndAwardRewards(userId);
        }

        res.status(200).json(book);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre" });
    }
};

// Route pour mettre à jour un livre et sa critique
const updateUserBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, language, wordsRead, startDate, endDate, description, rating, imageUrl, isAdmin, themes } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Trouver le livre par ID
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: "Livre non trouvé" });
        }

        // Vérifier si l'utilisateur a déjà une critique pour ce livre
        const review = book.reviews.find(review => review.user.equals(userId));

        // Conversion en nombre et validation de wordsRead
        const parsedWordsRead = parseInt(wordsRead, 10);
        if (!isNaN(parsedWordsRead) && book.wordsRead !== parsedWordsRead) {
            user.wordsRead -= book.wordsRead;
            user.wordsRead += parsedWordsRead;
            book.wordsRead = parsedWordsRead;

            await checkAndAwardRewards(userId);
            await checkAndRevokeRewards(userId);
        }

        // Mise à jour des informations du livre si l'utilisateur est créateur de la critique
        if (review) {
            book.title = title || book.title;
            book.author = author || book.author;
            book.language = language || book.language;
            book.wordsRead = wordsRead || book.wordsRead;
            book.isVerified = isAdmin === 'true' ? true : false;

            if (themes) {
                book.themes = JSON.parse(themes);
            }

            // Mise à jour de l'image du livre
            if (req.file) {
                book.image = req.file.path;
            } else if (imageUrl) {
                const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
                    folder: 'books',
                    public_id: slugify(title, { lower: true, strict: true })
                });
                book.image = uploadedImage.secure_url;
            }

            // Mise à jour de la critique si elle existe
            review.description = description || review.description;
            review.rating = rating !== undefined ? rating : review.rating;
            review.startDate = startDate || review.startDate;
            review.endDate = endDate || review.endDate;

            if (rating === '5' && !user.favoriteBooks.includes(book._id)) {
                user.favoriteBooks.push(book._id);
            }

            await user.save();
            await book.save();
            return res.status(200).json({ book });
        } else {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce livre" });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du livre :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du livre" });
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

//Favorite user books
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
        return res.status(500).json({ error: 'Erreur lors de la récupération des données de ce livre.' });
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
    const userId = req.user.id;
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

        const bookData = book.toJSON();

        // Récupérer les dates prévues pour l'utilisateur actuel s'il est dans futureReaders
        const futureReading = book.reviews.find(review => review.user._id.toString() === userId);
        if (futureReading) {
            bookData.startDate = futureReading.startDate;
            bookData.endDate = futureReading.endDate;
        }

        // Filtrer les reviews de l'utilisateur connecté
        bookData.reviews = bookData.reviews.filter(review => review.user._id.toString() !== userId);

        // Filtrer les futureReaders, currentReaders, et pastReaders de l'utilisateur connecté
        bookData.futureReaders = bookData.futureReaders.filter(reader => reader._id.toString() !== userId);
        bookData.currentReaders = bookData.currentReaders.filter(reader => reader._id.toString() !== userId);
        bookData.pastReaders = bookData.pastReaders.filter(reader => reader._id.toString() !== userId);

        res.status(200).json(bookData);
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


module.exports = { addUserBook, updateUserBook, getUserBooks, getUserRecentBooks, getUserFavoriteBooks, checkExistingBook, BookSuggestion, getBookById, deleteUserBook };