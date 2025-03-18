const Order = require('../models/Order');
const Product = require('../models/Product');

function getCart(req, res){
  res.json(req.session.cart);
};

async function addToCart (req, res){
  try {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;
    
    // Get product details
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not enough stock available' 
      });
    }
    
    const cart = req.session.cart;
    
    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * product.price;
    } else {
      // Add new item
      cart.items.push({
        id: productId,
        title: product.title,
        quantity: quantity,
        price: product.price,
        totalPrice: quantity * product.price,
        image: product.image_url
      });
    }
    
    // Update cart totals
    cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    
    // Save updated cart to session
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      message: 'Product added to cart',
      cart: cart
    });
  } catch (error) {
    console.error(`Error in addToCart controller for product ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while adding to cart' 
    });
  }
};

function updateCart (req, res){
  try {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity);
    
    if (quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be greater than 0' 
      });
    }
    
    const cart = req.session.cart;
    
    // Find the item
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].price;
    
    // Update cart totals
    cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    
    // Save updated cart to session
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      message: 'Cart updated',
      cart: cart
    });
  } catch (error) {
    console.error('Error in updateCart controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while updating the cart' 
    });
  }
};

function removeFromCart  (req, res) {
  try {
    const productId = req.params.id;
    const cart = req.session.cart;
    
    // Find the item
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Update cart totals
    cart.totalQty = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    
    // Save updated cart to session
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart: cart
    });
  } catch (error) {
    console.error('Error in removeFromCart controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while removing from cart' 
    });
  }
};

async function getOrdersByUser (req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const userId = req.session.user.id;
    const orders = await Order.getByUserId(userId);
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error in getOrdersByUser controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching your orders' 
    });
  }
};

async function placeOrder (req, res) {
  try {
    const cart = req.session.cart;
    
    if (cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    // Prepare order data
    const orderData = {
      userId: req.session.user ? req.session.user.id : null,
      totalAmount: cart.totalPrice,
      shippingAddress: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      },
      paymentMethod: req.body.paymentMethod,
      items: cart.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    // Create order
    const orderId = await Order.create(orderData);
    
    // Clear cart
    req.session.cart = {
      items: [],
      totalQty: 0,
      totalPrice: 0
    };
    
     // Get order details
     const order = await Order.getById(orderId);

     res.json({ 
      success: true, 
      message: 'Order placed successfully',
      order: order
    });
  } catch (error) {
    console.error('Error in placeOrder controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while placing your order' 
    });
  }
};

async function getOrderById  (req, res) {
  try {
    const orderId = parseInt(req.params.id);
    const order = await Order.getById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true,
      order: order
    });
  } catch (error) {
    console.error(`Error in getOrderSuccess controller for order ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching your order' 
    });
  }
};

module.exports = {getCart, addToCart, updateCart, removeFromCart, getOrdersByUser,placeOrder,getOrderById};