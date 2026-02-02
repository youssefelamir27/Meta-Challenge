const express = require('express');
const User = require('../models/user');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { createLog } = require('../utils/logger');

// Validation rules
const validateUser = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .escape(),
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
        .withMessage('Password must include uppercase, lowercase, numbers, and special characters'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150')
];

const validateLogin = [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Register user
router.post('/users', validateUser, handleValidationErrors, async (req, res) => {
    try {
        console.log('Received registration data:', req.body); 
        const user = new User(req.body);
        const token = await user.generateToken();
        await user.save();
        
        await createLog(user._id, 'register', 'User registered', req.ip);
        res.status(201).send({ user, token });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(400).send({ error: e.message });
    }
});

// Login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        await createLog(user._id, 'login', 'User logged in', req.ip);
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
    res.status(200).send(req.user);
});


// Get user by ID
router.get('/users/:id', auth, (req, res) => {
    const _id = req.params.id;
    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send({ error: 'Unable to find user' });
        }
        res.status(200).send(user);
    }).catch((e) => {
        res.status(500).send({ error: e.message });
    });
});

// Update user
router.patch('/users/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', 'email', 'password', 'age', 'city'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const _id = req.params.id;
        const user = await User.findById(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'No user found' });
        }

        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        await createLog(user._id, 'update_profile', 'User profile updated', req.ip);

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const user = await User.findByIdAndDelete(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'Unable to find user' });
        }
        
        await createLog(user._id, 'delete_account', 'User account deleted', req.ip);
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Logout
router.delete('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token !== req.token;
        });
        await req.user.save();
        await createLog(req.user._id, 'logout', 'User logged out', req.ip);
        res.send({ message: 'Logged out successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Logout all sessions
router.delete('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        await createLog(req.user._id, 'logout_all', 'User logged out from all devices', req.ip);
        res.send({ message: 'Logged out from all devices successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;