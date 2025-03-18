const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);

// Logout route
router.post('/logout', userController.logout);

// Get current user
router.get('/current', userController.getCurrentUser);

// Get user profile
router.get('/profile', authMiddleware.isAuthenticated, userController.getUserProfile);

module.exports = router;