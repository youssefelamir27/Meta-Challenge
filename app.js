/**
 * Meta-Task API
 * A secure, rate-limited task management API with JWT authentication
 */
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

app.use(express.json());

const mongoSanitize = require('./middleware/mongoSanitize');
app.use(mongoSanitize);

// Rate limiting
const rateLimiter = require('./middleware/rateLimiter');
app.use(rateLimiter);

require('./db/mongoose');

// Routes
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(userRouter);
app.use(taskRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).send({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('\n=== ERROR ===');
    console.error('URL:', req.url);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('=============\n');
    res.status(500).send({ error: 'Something went wrong!', message: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});