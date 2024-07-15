const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');


//middleware secure API routes
const secure = (req, res, next) => {
    const token = req.cookies.jwtauth;

    if (!token) {
        return res.status(401).json({ error: "Accès non autorisé, veuillez vous connecter" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token invalide ou expiré" });
        }

        req.user = decoded;
        next();
    });
};

module.exports = { secure };
