const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');


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
        const { bookTitle } = req.query;

        // Supprimer le livre de toutes les listes de l'utilisateur
        const user = await User.findById(userId);
        const book = await Book.findOne({ title: bookTitle }).exec();
        const bookId = book._id

        user.CurrentReader.pull(bookId);
        user.FutureReader.pull(bookId);

        user.futureWordsRead -= book.wordsRead;

        await user.save();

        // Supprimer les critiques de l'utilisateur sur ce livre

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

//ajouter aux lectures futures d'un util les le livre consulté
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
            res.status(200).json({ message: 'Livre trouvé parmi les lectures futures'});
        }
        else {
            res.json({error: 'livre non trouvé'})
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
            res.status(200).json({ message: 'Livre trouvé parmi les lectures actuelles'});
        }
        else {
            res.json({error: 'livre non trouvé'})
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des lectures actuelles de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook, addFutureReader, getFutureStatus, getCurrentStatus };