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

const cloudinary = require('../config/cloudinary');

//Avatar
const addUserAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        //supprimer l'ancien avatar
        if (user.avatar && user.avatar !== 'https://book-brawl.vercel.app/assets/account-D8hsV5Dv.jpeg') {
            const urlParts = user.avatar.split('/');
            const avatarsIndex = urlParts.indexOf('avatars');
            const publicIdWithExtension = urlParts.slice(avatarsIndex).join('/');
            const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
            await cloudinary.uploader.destroy(publicId);
        }

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

//words
const getUserWords = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('wordsRead');
        res.status(200).json({ words: user.wordsRead });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
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

        res.status(200).json(user.toJSON());
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = { getProfile, addUserAvatar, getUserAvatar, addUserStatus, getUserStatus, getUserById, getUserWords };