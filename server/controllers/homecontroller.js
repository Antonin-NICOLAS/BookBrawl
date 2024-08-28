const Book = require('../models/book');

const getLastReadBooks = async (req, res) => {
    try {
        const books = await Book.aggregate([
            { $unwind: "$reviews" }, // Dénormaliser le tableau des critiques
            { $sort: { "reviews.endDate": -1 } },
            { $limit: 10 }, // Limiter les résultats à 10
            {
                $lookup: {
                    from: 'users', // Nom de la collection User
                    localField: 'pastReaders', // Champ dans Book
                    foreignField: '_id', // Champ correspondant dans User
                    as: 'pastReadersInfo' // Alias pour les données peuplées
                }
            },
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
                    pastReadersInfo: { $first: "$pastReadersInfo" }, // Inclure les infos des pastReaders
                    isVerified: { $first: "$isVerified" },
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    author: 1,
                    language: 1,
                    wordsRead: 1,
                    image: 1,
                    themes: 1,
                    reviews: 1,
                    futureReaders: 1,
                    currentReaders: 1,
                    isVerified: 1,
                    pastReaders: {
                        $map: {
                            input: "$pastReadersInfo",
                            as: "pastReader",
                            in: {
                                _id: "$$pastReader._id",
                                prenom: "$$pastReader.prenom"
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(books);
    } catch (error) {
        console.error('Erreur lors de la récupération des derniers livres lus :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getLastReadBooks };