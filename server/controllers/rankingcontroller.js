const User = require('../models/user');


//ranking
const getUserRank = async (req, res) => {
    try {
        const users = await User.find().sort({ wordsRead: -1 }).exec();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserRank };