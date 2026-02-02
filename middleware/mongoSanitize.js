const sanitize = (obj) => {
    if (obj instanceof Object) {
        for (let key in obj) {
            if (/^\$/.test(key) || /\./.test(key)) {
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    }
    return obj;
};

const mongoSanitize = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body) {
            req.body = sanitize(req.body);
        }
        
        // Sanitize params
        if (req.params) {
            req.params = sanitize(req.params);
        }
        
        // Sanitize query
        if (req.query) {
            req.query = sanitize(req.query);
        }
        
        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        next();
    }
};

module.exports = mongoSanitize;