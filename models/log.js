const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'register',
            'login', 
            'logout',
            'logout_all',
            'create_task', 
            'update_task', 
            'delete_task',
            'view_tasks',
            'update_profile',
            'delete_account'
        ]
    },
    details: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ action: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;