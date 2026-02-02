const Log = require('../models/log');

const createLog = async (userId, action, details = '', ipAddress = '') => {
    try {
        const log = new Log({
            userId,
            action,
            details,
            ipAddress
        });
        await log.save();
    } catch (error) {
        console.error('Logging error:', error);
    }
};

module.exports = { createLog };