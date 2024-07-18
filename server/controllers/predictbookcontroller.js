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

module.exports = { getUserCurrentBooks, getUserFutureBooks, deleteFutureUserBook };