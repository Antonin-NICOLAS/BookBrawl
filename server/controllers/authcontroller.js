const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('server is working');
}

//register
const registerUser = async (req, res) => {
    try {
        const { prenom, nom, email, password } = req.body;

        if (!nom) {
            return res.json({ error: "Le nom est requis" });
        }
        if (!password || password.length < 6) {
            return res.json({ error: "Un mot de passe est requis, d'une longueur de 6 caractères" });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({ error: "L'email est déjà associé à un compte" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            prenom, nom, email, password: hashedPassword, wordsRead: 0,
            avatar: 'https://book-brawl.vercel.app/assets/account-D8hsV5Dv.jpeg',
            role: 'user'
        });
        const options = {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
        }
        const token = jwt.sign({
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
        },
            process.env.JWT_SECRET,
            { expiresIn: '2d' })

        return res.status(201).cookie('jwtauth', token, options).json(user);
    } catch (error) {
        console.log(error);
        return res.json({ error: "Un problème est survenu. Réessayer plus tard" });
    }
}

//login
const loginUser = async (req, res) => {
    try {
        const { email, password, stayLoggedIn } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: "L'email n'est associé à aucun compte" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (isPasswordMatch) {
            const cookieDuration = stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
            const expiration = stayLoggedIn ? '7d' : '2d'
            const options = {
                secure: process.env.NODE_ENV === "production" ? true : false,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
                maxAge: cookieDuration,
                expires: new Date(Date.now() + cookieDuration),
                domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
            }
            jwt.sign({
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            },
                process.env.JWT_SECRET,
                { expiresIn: expiration }, (err, token) => {
                    if (err) throw err;
                    res.cookie('jwtauth', token, options).json(user)
                })
        }
        else {
            return res.json({ error: "Mot de passe incorrect" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: "Un problème est survenu. Réessayer plus tard" });
    }
}

//logout

const logoutUser = async (req, res) => {
    const options = {
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
        expires: new Date(0),
        domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
    }
    res.cookie('jwtauth', 'expiredtoken', options);
    res.status(200).json({ status: "sucess" })
}

//changer de mot de passe 
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        console.log('Received request to change password for user:', userId);

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.json({ error: "Utilisateur introuvable" });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            console.log('Old password is incorrect');
            return res.json({ error: "L'ancien mot de passe est incorrect" });
        }

        if (newPassword.length < 6) {
            console.log('New password is too short');
            return res.json({ error: "Le nouveau mot de passe doit comporter au moins 6 caractères" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log('Password changed successfully');
        res.json({ success: "Mot de passe changé avec succès" });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: "Une erreur est survenue. Réessayez plus tard." });
    }
};

module.exports = { test, registerUser, loginUser, logoutUser, changePassword };