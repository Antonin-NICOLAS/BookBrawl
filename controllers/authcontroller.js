const User = require('../models/user');
const bcrypt = require('bcrypt');

const test = (req, res) => {
    res.json('test is working');
}

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

module.exports = { test, registerUser };
