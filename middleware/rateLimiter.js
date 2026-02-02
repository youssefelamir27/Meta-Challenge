const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60000, // 1 min
    max: 5, // 5 requests per min
    message: 'Too many requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;