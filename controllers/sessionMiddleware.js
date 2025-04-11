module.exports = (req, res, next) => {
    if (req.session.accountSession) {
        res.locals.user = req.session.accountSession;
        req.user = req.session.accountSession;
    }

    next();
}