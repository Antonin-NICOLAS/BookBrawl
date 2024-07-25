const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');
const { checkAndAwardRewards } = require('./rewardscontroller');


//Current user books
const getUserCurrentBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('CurrentReader');
        res.status(200).json(user.CurrentReader);
    } catch (error) {
        console.error('Erreur de récupération des livres actuels :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos livres actuels' });
    }
};

//Future user books
const getUserFutureBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('FutureReader');
        res.status(200).json(user.FutureReader);
    } catch (error) {
        console.error('Erreur de récupération des livres futurs :', error);
        res.status(500).json({ error: 'Erreur de récupération de vos prochains livres' });
    }
};

// Route pour supprimer un futur livre d'un utilisateur
const deleteFutureUserBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;

        // Supprimer le livre de toutes les listes de l'utilisateur
        const user = await User.findById(userId);
        const book = await Book.findById(bookId);

        user.CurrentReader.pull(bookId);
        user.FutureReader.pull(bookId);

        user.futureWordsRead -= book.wordsRead;

        await user.save();

        // Supprimer les critiques de l'utilisateur sur ce livre
        book.reviews = book.reviews.filter(review => !review.user.equals(userId));
        book.currentReaders.pull(userId);
        book.futureReaders.pull(userId);

        await book.save();

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

//ajouter aux lectures futures d'un util le livre consulté
const addFutureReader = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.params;

    try {
        const book = await Book.findById(bookId);
        const user = await User.findById(userId);

        if (!book || !user) {
            return res.json({ error: 'Livre ou utilisateur non trouvé' });
        }

        //normalement impossible car bouton accessible que si on l'a pas lu mais sait on jamais ?
        if (user.booksRead.includes(bookId) || book.pastReaders.includes(userId)) {
            return res.json({ error: 'Ce livre existe déjà parmis vos lectures' });
        }

        if (user.FutureReader.includes(bookId) || book.futureReaders.includes(userId)) {
            return res.json({ error: 'Ce livre existe déjà parmis vos lectures futures' });
        }
        else {
            user.FutureReader.push(bookId);
            user.futureWordsRead += parseInt(book.wordsRead);
            console.log(user.futureWordsRead)
            await user.save()
            book.futureReaders.push(userId);
            await book.save();
        }

        res.status(200).json({ message: 'Livre ajouté à vos lectures futures' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du livre aux lectures futures :', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du livre aux lectures futures.' });
    }
};

//passer le livre des lectures futures aux lectures actuelles
const markBookAsCurrent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;

        // Trouver le livre et l'utilisateur
        const book = await Book.findById(bookId);
        const user = await User.findById(userId);

        if (!book || !user) {
            return res.status(404).json({ error: 'Livre ou utilisateur non trouvé' });
        }

        // Vérifier si le livre est bien dans les lectures futures
        if (!user.FutureReader.includes(bookId)) {
            return res.json({ error: 'Le livre n\'est pas dans vos lectures futures' });
        }

        // Passer le livre aux lectures actuelles
        user.FutureReader.pull(bookId);
        user.CurrentReader.push(bookId);

        // Passer l'utilisateur de futureReaders à currentReaders
        book.futureReaders.pull(userId);
        book.currentReaders.push(userId);

        await user.save();
        await book.save();

        res.status(200).json({ message: 'Livre marqué comme en cours de lecture avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de lecture :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

//livre terminée d'un util
const markBookAsRead = async (req, res) => {
    try {
        const { startDate, endDate, description, rating, themes } = req.body;

        console.log('Received data:', req.body);

        const parsedThemes = themes ? JSON.parse(themes) : [];

        const userId = req.user.id;
        const { bookId } = req.params;

        console.log(description, rating, startDate, endDate, parsedThemes);

        // Trouver le livre et l'utilisateur
        const book = await Book.findById(bookId);
        const user = await User.findById(userId);

        if (!book || !user) {
            return res.status(404).json({ error: 'Livre ou utilisateur non trouvé' });
        }

        // Vérifier si le livre est bien dans les lectures actuelles
        if (!user.CurrentReader.includes(bookId)) {
            return res.json({ error: 'Le livre n\'est pas dans vos lectures actuelles' });
        }

        // Vérifier les dates
        if (startDate > endDate) {
            return res.json({ error: "La date de début doit être avant celle de fin" });
        }

        // Trouver la revue existante de l'utilisateur pour ce livre
        const existingReview = book.reviews.find(review => review.user.toString() === userId);

        if (existingReview) {
            // Mettre à jour la revue existante
            existingReview.description = description;
            existingReview.rating = rating;
            existingReview.startDate = startDate;
            existingReview.endDate = endDate;
        } else {
            // Ajouter une nouvelle revue si elle n'existe pas
            book.reviews.push({
                user: userId,
                description,
                rating,
                startDate,
                endDate,
            });
        }

        // Ajouter les thèmes s'ils n'existent pas encore
        if (parsedThemes && parsedThemes.length > 0 && book.themes.length === 0) {
            book.themes = parsedThemes;
        }

        // Passer le livre aux lectures terminées
        user.CurrentReader.pull(bookId);
        user.booksRead.push(bookId); // Ajouter aux livres lus
        user.futureWordsRead -= book.wordsRead;
        user.wordsRead += book.wordsRead;

        // Passer l'utilisateur de currentReaders à pastReaders
        book.currentReaders.pull(userId);
        book.pastReaders.push(userId);

        await user.save();
        await book.save();
        await checkAndAwardRewards(userId);

        res.status(200).json({ message: 'Livre marqué comme lu avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de lecture :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

//récupérer le statut du livre consulté pour l'util connecté
const getFutureStatus = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.params;

    try {
        const book = await Book.findById(bookId).populate('futureReaders', 'id');

        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        // Filtrer les lectures futures de l'utilisateur connecté
        const futureReading = book.futureReaders.find(reader => reader.id.toString() === userId);

        if (futureReading) {
            res.status(200).json({ message: 'Livre trouvé parmi les lectures futures' });
        }
        else {
            res.json({ error: 'livre non trouvé' })
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des lectures futures de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

const getCurrentStatus = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.params;

    try {
        const book = await Book.findById(bookId).populate('currentReaders', 'id');

        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        // Filtrer les lectures futures de l'utilisateur connecté
        const currentReading = book.currentReaders.find(reader => reader.id.toString() === userId);

        if (currentReading) {
            res.status(200).json({ message: 'Livre trouvé parmi les lectures actuelles' });
        }
        else {
            res.json({ error: 'livre non trouvé' })
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des lectures actuelles de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook, addFutureReader, markBookAsCurrent, markBookAsRead, getFutureStatus, getCurrentStatus };