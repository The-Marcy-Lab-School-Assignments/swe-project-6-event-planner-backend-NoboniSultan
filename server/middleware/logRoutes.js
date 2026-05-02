const logRoutes = (req, res, next) => {
    const time = new Date().toLocaleTimeString();
    console.log(`${req.method} ${req.originalURL} [${time}]`);
    next();
};

module.exports = logRoutes;