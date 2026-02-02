const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { createLog } = require('../utils/logger');

// Validation middleware
const validateTask = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 5, max: 500 }).withMessage('Description must be 5-500 characters')
        .escape(),
    body('completed')
        .optional()
        .isBoolean().withMessage('Completed must be true or false')
];

const validateId = [
    param('id').isMongoId().withMessage('Invalid task ID')
];

// Helper function
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

// Create task
router.post('/tasks', auth, validateTask, handleValidationErrors, async (req, res) => {
    try {
        const task = new Task({ ...req.body, owner: req.user._id });
        await task.save();
        await createLog(req.user._id, 'create_task', `Task created: ${task.title}`, req.ip);
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Get all user tasks
router.get('/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('tasks');
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Get single task
router.get('/tasks/:id', auth, validateId, handleValidationErrors, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner: req.user._id });
        
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }
        
        await task.populate('owner');
        res.send(task);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Update task
router.patch('/task/:id', auth, validateId, handleValidationErrors, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'completed'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const id = req.params.id;
        const task = await Task.findOne({ _id: id, owner: req.user._id });
        
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();
        await createLog(req.user._id, 'update_task', `Task updated: ${task.title}`, req.ip);

        res.status(200).send(task);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Delete task
router.delete('/task/:id', auth, validateId, handleValidationErrors, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }
        
        await createLog(req.user._id, 'delete_task', `Task deleted: ${task.title}`, req.ip);
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;