module.exports = function(req, res, next) {
    // Check if user is SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ msg: 'Accès refusé. Rôle Super Admin requis.' });
    }
    next();
};
