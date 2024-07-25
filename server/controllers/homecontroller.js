const Book = require('../models/book')

const getLastReadBooks = async (req, res) => {
    try {
        const books = await Book.aggregate([
            { $unwind: "$reviews" }, // Dénormaliser le tableau des critiques
            { $sort: { "reviews.endDate": -1 } },
            { $limit: 10 }, // Limiter les résultats à 10
            {
                $group: {
                    _id: "$_id", // Regrouper par livre
                    title: { $first: "$title" },
                    author: { $first: "$author" },
                    language: { $first: "$language" },
                    wordsRead: { $first: "$wordsRead" },
                    image: { $first: "$image" },
                    themes: { $first: "$themes" },
                    reviews: { $push: "$reviews" },
                    futureReaders: { $first: "$futureReaders" },
                    currentReaders: { $first: "$currentReaders" },
                    pastReaders: { $first: "$pastReaders" },
                    isVerified: { $first: "$isVerified" },
                }
            }
        ]);

        res.status(200).json(books);
    } catch (error) {
        console.error('Erreur lors de la récupération des derniers livres lus :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getLastReadBooks }