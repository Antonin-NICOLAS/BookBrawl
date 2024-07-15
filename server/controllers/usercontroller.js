const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

//profile
const getProfile = (req, res) => {
    const { jwtauth } = req.cookies
    if (jwtauth) {
        jwt.verify(jwtauth, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES }, (err, user) => {
            if (err) throw err;
            res.json(user)
        })
    } else {
        res.json(null)
    }
}

//Avatar
const addUserAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const image = req.file.path;
        user.avatar = image;

        await user.save();

        res.status(200).json({ avatar: user.avatar });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'avatar :", error);
        res.json({ error: "Erreur lors de l'ajout de l'avatar" });
    }
};

const getUserAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('avatar');
        res.status(200).json({ avatar: user.avatar });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'avatar utilisateur :", error);
        res.json({ error: "Erreur lors de la récupération de l'avatar utilisateur" });
    }
};

//status
const addUserStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const { status } = req.body;
        user.status = status;

        await user.save();

        res.status(200).json({ status: user.status });
    } catch (error) {
        console.error("Erreur lors de l'ajout du statut :", error);
        res.json({ error: "Erreur lors de la modification du statut" });
    }
};

const getUserStatus = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).select('status');
        res.status(200).json({ status: user.status });

    } catch (error) {
        console.error("Erreur lors de la récupération du statut utilisateur :", error);
        res.json({ error: "Erreur lors de la récupération du statut utilisateur" });
    }
};

const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId)
            .populate({
                path: 'booksRead',
            })
            .populate({
                path: 'favoriteBooks',
            })
            .populate({
                path: 'rewards',
            });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user.toJSON());
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: "ID d'utilisateur invalide" });
        }
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getProfile, addUserAvatar, getUserAvatar, addUserStatus, getUserStatus, getUserById };