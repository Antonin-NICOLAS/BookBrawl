const admin = (req, res, next) => {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Accès refusé" });
    }
    next();
}

module.exports = { admin };