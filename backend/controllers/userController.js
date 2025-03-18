const User = require('../models/User');

async function register (req, res) {
    try {
        const { name, email, password, confirmPassword } = req.body;
        
        // Validate input
        if (!name || !email || !password || !confirmPassword) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required'
          });
        }
        
        if (password !== confirmPassword) {
          return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
          });
        }
        
        // Check if user already exists
        const existingUser = await User.getByEmail(email);
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
        
        // Create new user
        const userId = await User.create({ name, email, password });
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          userId: userId
        });
      } catch (error) {
        console.error('Error in register controller:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred during registration'
        });
      }
};

async function login (req, res) {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required'
          });
        }
        
        // Authenticate user
        const user = await User.authenticate(email, password);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }
        
        // Store user in session
        req.session.user = user;
        
        res.json({
          success: true,
          message: 'Login successful',
          user: user
        });
      } catch (error) {
        console.error('Error in login controller:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred during login'
        });
      }
};

function logout(req, res) {
    req.session.destroy();
    res.json({
      success: true,
      message: 'Logout successful'
    });
};

function getCurrentUser (req, res) {
    if (req.session.user) {
        res.json({
          success: true,
          user: req.session.user
        });
      } else {
        res.json({
          success: false,
          message: 'User not authenticated'
        });
      }
};

async function getUserProfile (req, res) {
    try {
        // Check if user is logged in
        if (!req.session.user) {
          return res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
        }
        
        const user = await User.getById(req.session.user.id);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        
        res.json({
          success: true,
          user: user
        });
      } catch (error) {
        console.error('Error in getUserProfile controller:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred while fetching your profile'
        });
      } 
};

module.exports = {register, login, logout,getCurrentUser,getUserProfile};