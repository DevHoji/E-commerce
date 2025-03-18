const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get product by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get product by ID
router.get('/:id', productController.getProductById);

module.exports = router;