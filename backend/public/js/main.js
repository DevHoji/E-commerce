// Main JavaScript File for the E-commerce Application

// Global variables
let cart = { items: [], totalQty: 0, totalPrice: 0 };
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
  
  // Setup navigation events
  setupNavigation();
  
  // Load appropriate page content based on URL
  loadPageContent();
});

// Initialize the application
async function initApp() {
  try {
    // Get current user if logged in
    await getCurrentUser();
    
    // Get cart data
    await getCart();
    
    // Update UI based on auth state
    updateAuthUI();
    
    // Update cart count in the header
    updateCartCount();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Setup navigation events
function setupNavigation() {
  // Handle navigation clicks
  document.body.addEventListener('click', function(e) {
    // Find closest anchor tag
    const link = e.target.closest('a');
    
    if (link && link.getAttribute('href').startsWith('#')) {
      e.preventDefault();
      
      // Get the route
      const route = link.getAttribute('href').substring(1);
      
      // Navigate to the route
      navigateTo(route);
    }
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', loadPageContent);
}

// Load page content based on URL
async function loadPageContent() {
  const path = window.location.hash.substring(1) || 'home';
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;
  
  try {
    // Show loading state
    mainContent.innerHTML = '<div class="text-center"><p>Loading...</p></div>';
    
    // Load content based on route
    switch (path) {
      case 'home':
        await loadHomePage(mainContent);
        break;
      case 'products':
        await loadProductsPage(mainContent);
        break;
      case 'cart':
        loadCartPage(mainContent);
        break;
      case 'checkout':
        loadCheckoutPage(mainContent);
        break;
      case 'login':
        loadLoginPage(mainContent);
        break;
      case 'register':
        loadRegisterPage(mainContent);
        break;
      case 'profile':
        await loadProfilePage(mainContent);
        break;
      default:
        if (path.startsWith('product/')) {
          const productId = path.split('/')[1];
          await loadProductDetailPage(mainContent, productId);
        } else if (path.startsWith('category/')) {
          const categoryId = path.split('/')[1];
          await loadCategoryPage(mainContent, categoryId);
        } else if (path.startsWith('order/')) {
          const orderId = path.split('/')[1];
          await loadOrderDetailPage(mainContent, orderId);
        } else {
          mainContent.innerHTML = '<div class="text-center"><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p></div>';
        }
    }
  } catch (error) {
    console.error('Error loading page content:', error);
    mainContent.innerHTML = '<div class="text-center"><h2>Error</h2><p>An error occurred while loading content. Please try again.</p></div>';
  }
}

// Navigate to a route
function navigateTo(route) {
  window.location.hash = route;
}

// API Calls
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const result = await fetchAPI('/api/users/current');
    
    if (result.success) {
      currentUser = result.user;
    } else {
      currentUser = null;
    }
    
    return currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    currentUser = null;
    return null;
  }
}

// Update UI based on authentication state
function updateAuthUI() {
  const authLinks = document.getElementById('auth-links');
  
  if (!authLinks) return;
  
  if (currentUser) {
    authLinks.innerHTML = `
      <a href="#profile">${currentUser.name}</a>
      <a href="#" id="logout-link">Logout</a>
      <div class="cart-icon" id="cart-icon">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cart-count">0</span>
      </div>
    `;
    
    // Add logout event listener
    document.getElementById('logout-link').addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  } else {
    authLinks.innerHTML = `
      <a href="#login">Login</a>
      <a href="#register">Register</a>
      <div class="cart-icon" id="cart-icon">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cart-count">0</span>
      </div>
    `;
  }
  
  // Add cart icon event listener
  document.getElementById('cart-icon').addEventListener('click', function() {
    navigateTo('cart');
  });
}

// Update cart count in the header
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  
  if (cartCount) {
    cartCount.textContent = cart.totalQty || 0;
  }
}

// Get cart data
async function getCart() {
  try {
    const result = await fetchAPI('/api/orders/cart');
    cart = result;
    updateCartCount();
    return cart;
  } catch (error) {
    console.error('Error getting cart:', error);
    return cart;
  }
}

// Add product to cart
async function addToCart(productId, quantity = 1) {
  try {
    const result = await fetchAPI(`/api/orders/cart/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
    
    if (result.success) {
      cart = result.cart;
      updateCartCount();
      showMessage('Product added to cart', 'success');
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding to cart:', error);
    showMessage('Error adding product to cart', 'error');
    throw error;
  }
}

// Update cart item quantity
async function updateCartItem(productId, quantity) {
  try {
    const result = await fetchAPI(`/api/orders/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    
    if (result.success) {
      cart = result.cart;
      updateCartCount();
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating cart:', error);
    showMessage('Error updating cart', 'error');
    throw error;
  }
}

// Remove item from cart
async function removeFromCart(productId) {
  try {
    const result = await fetchAPI(`/api/orders/cart/${productId}`, {
      method: 'DELETE'
    });
    
    if (result.success) {
      cart = result.cart;
      updateCartCount();
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error removing from cart:', error);
    showMessage('Error removing item from cart', 'error');
    throw error;
  }
}

// Login user
async function login(email, password) {
  try {
    const result = await fetchAPI('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.success) {
      currentUser = result.user;
      updateAuthUI();
      navigateTo('home');
      showMessage('Login successful', 'success');
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    showMessage('Error logging in', 'error');
    throw error;
  }
}

// Register user
async function register(userData) {
  try {
    const result = await fetchAPI('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (result.success) {
      showMessage('Registration successful. Please login.', 'success');
      navigateTo('login');
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error registering:', error);
    showMessage('Error registering account', 'error');
    throw error;
  }
}

// Logout user
async function logout() {
  try {
    const result = await fetchAPI('/api/users/logout');
    
    if (result.success) {
      currentUser = null;
      updateAuthUI();
      navigateTo('home');
      showMessage('Logout successful', 'success');
    }
    
    return result;
  } catch (error) {
    console.error('Error logging out:', error);
    showMessage('Error logging out', 'error');
    throw error;
  }
}

// Place order
async function placeOrder(orderData) {
  try {
    const result = await fetchAPI('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    
    if (result.success) {
      cart = { items: [], totalQty: 0, totalPrice: 0 };
      updateCartCount();
      navigateTo(`order/${result.order.id}`);
      showMessage('Order placed successfully', 'success');
    } else {
      showMessage(result.message, 'error');
    }
    
    return result;
  } catch (error) {
    console.error('Error placing order:', error);
    showMessage('Error placing order', 'error');
    throw error;
  }
}

// Show message to user
function showMessage(message, type = 'info') {
  // Check if message container exists
  let messageContainer = document.getElementById('message-container');
  
  // If not, create one
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.right = '20px';
    messageContainer.style.zIndex = '1000';
    document.body.appendChild(messageContainer);
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.style.backgroundColor = type === 'error' ? '#e74c3c' : '#2ecc71';
  messageElement.style.color = '#fff';
  messageElement.style.padding = '10px 20px';
  messageElement.style.borderRadius = '4px';
  messageElement.style.marginBottom = '10px';
  messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  messageElement.textContent = message;
  
  // Add to container
  messageContainer.appendChild(messageElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}

// Page Loaders
async function loadHomePage(container) {
  try {
    // Fetch featured products
    const featuredProducts = await fetchAPI('/api/products/featured');
    
    // Render homepage content
    container.innerHTML = `
      <div class="container">
        <h1 class="text-center mb-20">Welcome to E-Shop</h1>
        
        <section class="hero mb-20">
          <h2>Featured Products</h2>
          <div class="product-grid">
            ${featuredProducts.map(product => `
              <div class="product-card">
                <img src="${product.image_url}" alt="${product.title}" class="product-img">
                <div class="product-info">
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">$${product.price.toFixed(2)}</p>
                  <p class="product-desc">${product.description.substring(0, 60)}...</p>
                  <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                  <a href="#product/${product.id}" class="btn btn-secondary">View Details</a>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
    
    // Add event listeners to Add to Cart buttons
    const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.dataset.id;
        await addToCart(productId);
      });
    });
    
  } catch (error) {
    console.error('Error loading home page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load featured products. Please try again later.</p></div>';
  }
}

async function loadProductsPage(container) {
  try {
    // Fetch all products
    const products = await fetchAPI('/api/products');
    
    // Render products page
    container.innerHTML = `
      <div class="container">
        <h1 class="text-center mb-20">All Products</h1>
        
        <div class="product-grid">
          ${products.map(product => `
            <div class="product-card">
              <img src="${product.image_url}" alt="${product.title}" class="product-img">
              <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-desc">${product.description.substring(0, 60)}...</p>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                <a href="#product/${product.id}" class="btn btn-secondary">View Details</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add event listeners to Add to Cart buttons
    const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.dataset.id;
        await addToCart(productId);
      });
    });
    
  } catch (error) {
    console.error('Error loading products page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load products. Please try again later.</p></div>';
  }
}

async function loadProductDetailPage(container, productId) {
  try {
    // Fetch product details
    const product = await fetchAPI(`/api/products/${productId}`);
    
    if (!product) {
      container.innerHTML = '<div class="text-center"><h2>Product Not Found</h2><p>The product you are looking for does not exist.</p></div>';
      return;
    }
    
    // Render product detail page
    container.innerHTML = `
      <div class="container">
        <div class="product-detail">
          <div class="product-detail-img-container">
            <img src="${product.image_url}" alt="${product.title}" class="product-detail-img">
          </div>
          <div class="product-detail-info">
            <h1 class="product-detail-title">${product.title}</h1>
            <p class="product-detail-price">$${product.price.toFixed(2)}</p>
            <p class="product-detail-desc">${product.description}</p>
            
            <div class="product-quantity">
              <button class="quantity-btn decrease-btn">-</button>
              <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}">
              <button class="quantity-btn increase-btn">+</button>
              <span class="stock-info">In Stock: ${product.stock}</span>
            </div>
            
            <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            <a href="#products" class="btn btn-secondary">Back to Products</a>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const quantityInput = container.querySelector('.quantity-input');
    const decreaseBtn = container.querySelector('.decrease-btn');
    const increaseBtn = container.querySelector('.increase-btn');
    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    
    decreaseBtn.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    
    increaseBtn.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue < product.stock) {
        quantityInput.value = currentValue + 1;
      }
    });
    
    addToCartBtn.addEventListener('click', async function() {
      const quantity = parseInt(quantityInput.value);
      await addToCart(product.id, quantity);
    });
    
  } catch (error) {
    console.error('Error loading product detail page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load product details. Please try again later.</p></div>';
  }
}

async function loadCategoryPage(container, categoryId) {
  try {
    // Fetch products by category
    const products = await fetchAPI(`/api/products/category/${categoryId}`);
    
    // Render category page
    container.innerHTML = `
      <div class="container">
        <h1 class="text-center mb-20">Category Products</h1>
        
        <div class="product-grid">
          ${products.map(product => `
            <div class="product-card">
              <img src="${product.image_url}" alt="${product.title}" class="product-img">
              <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-desc">${product.description.substring(0, 60)}...</p>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                <a href="#product/${product.id}" class="btn btn-secondary">View Details</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add event listeners to Add to Cart buttons
    const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.dataset.id;
        await addToCart(productId);
      });
    });
    
  } catch (error) {
    console.error('Error loading category page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load category products. Please try again later.</p></div>';
  }
}

function loadCartPage(container) {
  try {
    // Render cart page
    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="container">
          <div class="cart-container">
            <h1 class="text-center mb-20">Your Cart</h1>
            <div class="cart-empty">
              <p>Your cart is empty.</p>
              <a href="#products" class="btn">Shop Now</a>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="container">
          <div class="cart-container">
            <h1 class="text-center mb-20">Your Cart</h1>
            
            ${cart.items.map(item => `
              <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                  <h3>${item.title}</h3>
                  <div class="product-quantity">
                    <button class="quantity-btn decrease-btn">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn increase-btn">+</button>
                  </div>
                </div>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <p class="cart-item-total">$${item.totalPrice.toFixed(2)}</p>
                <button class="cart-item-remove">×</button>
              </div>
            `).join('')}
            
            <div class="cart-summary">
              <div class="cart-total">
                Total: $${cart.totalPrice.toFixed(2)}
              </div>
              <div class="cart-actions">
                <a href="#products" class="btn btn-secondary">Continue Shopping</a>
                <a href="#checkout" class="btn">Proceed to Checkout</a>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners for cart actions
      const cartItems = container.querySelectorAll('.cart-item');
      cartItems.forEach(item => {
        const productId = item.dataset.id;
        const quantityInput = item.querySelector('.quantity-input');
        const decreaseBtn = item.querySelector('.decrease-btn');
        const increaseBtn = item.querySelector('.increase-btn');
        const removeBtn = item.querySelector('.cart-item-remove');
        
        decreaseBtn.addEventListener('click', function() {
          const currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateCartItem(productId, currentValue - 1).then(() => {
              loadCartPage(container);
            });
          }
        });
        
        increaseBtn.addEventListener('click', function() {
          const currentValue = parseInt(quantityInput.value);
          quantityInput.value = currentValue + 1;
          updateCartItem(productId, currentValue + 1).then(() => {
            loadCartPage(container);
          });
        });
        
        quantityInput.addEventListener('change', function() {
          const newValue = parseInt(this.value);
          if (newValue > 0) {
            updateCartItem(productId, newValue).then(() => {
              loadCartPage(container);
            });
          }
        });
        
        removeBtn.addEventListener('click', function() {
          removeFromCart(productId).then(() => {
            loadCartPage(container);
          });
        });
      });
    }
  } catch (error) {
    console.error('Error loading cart page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load cart. Please try again later.</p></div>';
  }
}

function loadCheckoutPage(container) {
  try {
    // Check if user is logged in
    if (!currentUser) {
      container.innerHTML = `
        <div class="container">
          <div class="form-container">
            <h1 class="form-title">Checkout</h1>
            <p class="text-center mb-20">Please login to continue with checkout.</p>
            <div class="text-center">
              <a href="#login" class="btn">Login</a>
              <a href="#register" class="btn btn-secondary">Register</a>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    // Check if cart is empty
    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="container">
          <div class="form-container">
            <h1 class="form-title">Checkout</h1>
            <p class="text-center mb-20">Your cart is empty. Add some products to proceed with checkout.</p>
            <div class="text-center">
              <a href="#products" class="btn">Shop Now</a>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    // Render checkout page
    container.innerHTML = `
      <div class="container">
        <div class="checkout-grid">
          <div class="checkout-form">
            <h1 class="form-title">Checkout</h1>
            
            <form id="checkout-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" name="name" value="${currentUser.name}" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="email" value="${currentUser.email}" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Shipping Address</label>
                <input type="text" class="form-input" name="address" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" class="form-input" name="city" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-input" name="state" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">ZIP Code</label>
                <input type="text" class="form-input" name="zip" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select class="form-input" name="paymentMethod" required>
                  <option value="">Select Payment Method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <button type="submit" class="btn">Place Order</button>
            </form>
          </div>
          
          <div class="order-summary">
            <h2 class="order-summary-title">Order Summary</h2>
            
            ${cart.items.map(item => `
              <div class="summary-item">
                <span>${item.title} (${item.quantity})</span>
                <span>$${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="summary-total">
              <span>Total</span>
              <span>$${cart.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener for checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        paymentMethod: formData.get('paymentMethod')
      };
      
      try {
        await placeOrder(orderData);
      } catch (error) {
        console.error('Error placing order:', error);
      }
    });
    
  } catch (error) {
    console.error('Error loading checkout page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load checkout page. Please try again later.</p></div>';
  }
}

function loadLoginPage(container) {
  // Render login page
  container.innerHTML = `
    <div class="container">
      <div class="form-container">
        <h1 class="form-title">Login</h1>
        
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" name="password" required>
          </div>
          
          <button type="submit" class="btn">Login</button>
        </form>
        
        <p class="text-center mt-20">Don't have an account? <a href="#register">Register</a></p>
      </div>
    </div>
  `;
  
  // Add event listener for login form submission
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = this.email.value;
    const password = this.password.value;
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  });
}

function loadRegisterPage(container) {
  // Render register page
  container.innerHTML = `
    <div class="container">
      <div class="form-container">
        <h1 class="form-title">Register</h1>
        
        <form id="register-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" name="name" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" name="password" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-input" name="confirmPassword" required>
          </div>
          
          <button type="submit" class="btn">Register</button>
        </form>
        
        <p class="text-center mt-20">Already have an account? <a href="#login">Login</a></p>
      </div>
    </div>
  `;
  
  // Add event listener for register form submission
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
      name: this.name.value,
      email: this.email.value,
      password: this.password.value,
      confirmPassword: this.confirmPassword.value
    };
    
    try {
      await register(userData);
    } catch (error) {
      console.error('Error registering:', error);
    }
  });
}

async function loadProfilePage(container) {
  try {
    // Check if user is logged in
    if (!currentUser) {
      container.innerHTML = `
        <div class="container">
          <div class="form-container">
            <h1 class="form-title">Profile</h1>
            <p class="text-center mb-20">Please login to view your profile.</p>
            <div class="text-center">
              <a href="#login" class="btn">Login</a>
              <a href="#register" class="btn btn-secondary">Register</a>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    // Fetch user profile and orders
    const profileResponse = await fetchAPI('/api/users/profile');
    const ordersResponse = await fetchAPI('/api/orders/user');
    
    if (!profileResponse.success) {
      throw new Error(profileResponse.message);
    }
    
    const user = profileResponse.user;
    const orders = ordersResponse.success ? ordersResponse.orders : [];
    
    // Render profile page
    container.innerHTML = `
      <div class="container">
        <div class="profile-container">
          <div class="profile-header">
            <h1 class="profile-title">My Profile</h1>
          </div>
          
          <div class="profile-info">
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          </div>
          
          <h2 class="order-history-title">Order History</h2>
          
          ${orders.length === 0 ? 
            '<p>You have no orders yet.</p>' :
            orders.map(order => `
              <div class="order-card">
                <div class="order-header">
                  <span class="order-id">Order #${order.id}</span>
                  <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div class="order-info">
                  <p class="order-total">Total: $${order.totalAmount.toFixed(2)}</p>
                  <p class="order-status">${order.status}</p>
                </div>
                <a href="#order/${order.id}" class="btn btn-secondary">View Details</a>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading profile page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load profile information. Please try again later.</p></div>';
  }
}

async function loadOrderDetailPage(container, orderId) {
  try {
    // Fetch order details
    const response = await fetchAPI(`/api/orders/${orderId}`);
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    const order = response.order;
    
    // Render order detail page
    container.innerHTML = `
      <div class="container">
        <div class="profile-container">
          <h1 class="profile-title">Order #${order.id}</h1>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="order-status">${order.status}</span></p>
          
          <h2 class="mt-20">Shipping Address</h2>
          <p>${order.shippingAddress.name}</p>
          <p>${order.shippingAddress.address}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
          
          <h2 class="mt-20">Order Items</h2>
          
          <div class="cart-container">
            ${order.items.map(item => `
              <div class="cart-item">
                <div class="cart-item-info">
                  <h3>${item.productTitle}</h3>
                  <p>Quantity: ${item.quantity}</p>
                </div>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <p class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            `).join('')}
            
            <div class="cart-summary">
              <div class="cart-total">
                Total: $${order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div class="text-center mt-20">
            <a href="#profile" class="btn">Back to Profile</a>
          </div>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading order detail page:', error);
    container.innerHTML = '<div class="text-center"><h2>Error</h2><p>Could not load order details. Please try again later.</p></div>';
  }
}