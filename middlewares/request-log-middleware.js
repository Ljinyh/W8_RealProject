const requestMiddleware = (req, res, next) => {
    console.log("Request URL:", req.originalUrl, " - ", new Date());
    next();
};

module.exports = requestMiddleware;