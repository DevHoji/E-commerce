const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');

// Import routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'ecommerce-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Initialize cart if it doesn't exist
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totalQty: 0,
      totalPrice: 0
    };
  }
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);


// Serve the SPA for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

// Serve specific HTML pages
app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/product.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/cart.html'));
});

app.get('/order-success/:id', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/order-success.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;