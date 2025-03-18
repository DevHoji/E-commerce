const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Show cart
router.get('/cart', orderController.getCart);

// Add item to cart
router.post('/cart/add/:id', orderController.addToCart);

// Update cart item
router.put('/cart/update/:id', orderController.updateCart);

// Remove item from cart
router.delete('/cart/remove/:id', orderController.removeFromCart);

// Place order
router.post('/checkout', orderController.placeOrder);

// Get specific order
router.get('/:id', authMiddleware.isAuthenticated, orderController.getOrderById);

// Get user orders
router.get('/user/history', authMiddleware.isAuthenticated, orderController.getOrdersByUser);

module.exports = router;