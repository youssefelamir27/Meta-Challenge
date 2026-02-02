# Meta-Challenge API
A secure rate-limited task management API with JWT authentication.

## Tech Stack
- Node.js
- Express.js
- MongoDB
- JWT

## Setup
1. Install dependencies: npm install
2. Create .env file with PORT, MONGODB_URL, JWT_SECRET
3. Run: node app.js

## API Endpoints

### Auth
- POST /users - Register
- POST /login - Login
- DELETE /logout - Logout
- DELETE /logoutAll - Logout all devices

### Profile
- GET /profile - Get profile

### Tasks
- POST /tasks - Create task
- GET /tasks - Get all tasks
- GET /tasks/:id - Get task by ID
- PATCH /tasks/:id - Update task
- DELETE /tasks/:id - Delete task

## Security
- JWT Authentication
- Rate Limiting (5 req/min)
- Input Validation
- NoSQL Injection Protection
- Password Hashing (bcrypt)
- Helmet.js
EOF
