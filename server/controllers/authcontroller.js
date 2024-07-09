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
            prenom, nom, email, password: hashedPassword, wordsRead
        });
        const options = {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
        }
        const token = jwt.sign({ id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, words: user.wordsRead }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })

        return res.status(201).cookie('jwtauth', token, options).json(user);
    } catch (error) {
        console.log(error);
        return res.json({ error: "Un problème est survenu. Réessayer plus tard" });
    }
}

//login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: "L'email n'est associé à aucun compte" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (isPasswordMatch) {
            const options = {
                secure: process.env.NODE_ENV === "production" ? true : false,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
                maxAge: 2 * 24 * 60 * 60 * 1000,
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
            }
            jwt.sign({ id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, words: user.wordsRead }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES }, (err, token) => {
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

module.exports = { test, registerUser, loginUser, logoutUser, getProfile };