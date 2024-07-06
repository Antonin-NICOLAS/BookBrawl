const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
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
        const user = await User.create({ prenom, nom, email, password: hashedPassword });
        return res.status(201).json(user);
    } catch (error) {
        console.log(error);
        return res.json({ error: "Une erreur est survenue. Réessayer plus tard" });
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
                sameSite: process.env.NODE_ENV === "production" ? 'None' : '',
                maxAge: 2 * 24 * 60 * 60 * 1000,
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                domain: "vercel.app"
            }
            jwt.sign({ id: user._id, nom: user.nom, prenom: user.prenom, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES }, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, options).json(user)
            })
        }
        else {
            return res.json({ error: "Mot de passe incorrect" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: "Une erreur est survenue. Réessayer plus tard" });
    }
}

module.exports = { test, registerUser, loginUser };
