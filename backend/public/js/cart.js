document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Check if user is logged in
      await checkAuth();
      
      // Load cart
      await loadCart();
    } catch (error) {
      console.error('Error initializing cart page:', error);
      alert('An error occurred. Please refresh the page and try again.');
    }
  });
  
  // Function to load cart
  async function loadCart() {
    try {
      const response = await fetch('/api/orders/cart');
      const cart = await response.json();
      
      const cartItems = document.getElementById('cart-items');
      const cartSummary = document.getElementById('cart-summary');
      const cartTotal = document.getElementById('cart-total');
      
      if (cart.items.length === 0) {
        // Cart is empty
        cartItems.innerHTML = `
          <div class="cart-empty">
            <p>Your cart is empty.</p>
            <a href="/products" class="btn">Shop Now</a>
          </div>
        `;
        cartSummary.style.display = 'none';
      } else {
        // Cart has items
        let itemsHTML = '';
        
        cart.items.forEach(item => {
          itemsHTML += `
            <div class="cart-item" data-id="${item.id}">
              <img src="${item.image}" alt="${item.title}" class="cart-item-img">
              <div class="cart-item-info">
                <h3>${item.title}</h3>
                <div class="product-quantity">
                  <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                  <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                  <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                </div>
              </div>
              <p class="cart-item-price">$${item.price.toFixed(2)}</p>
              <p class="cart-item-total">$${item.totalPrice.toFixed(2)}</p>
              <button class="cart-item-remove" data-id="${item.id}">×</button>
            </div>
          `;
        });
        
        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = `Total: $${cart.totalPrice.toFixed(2)}`;
        cartSummary.style.display = 'flex';
        
        // Add event listeners for cart actions
        addCartEventListeners();
      }
      
      // Update cart count in header
      updateCartCount(cart.totalQty || 0);
    } catch (error) {
      console.error('Error loading cart:', error);
      alert('An error occurred while loading your cart. Please try again.');
    }
  }
  
  // Function to add event listeners to cart items
  function addCartEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.id;
        const quantityInput = document.querySelector(`.quantity-input[data-id="${productId}"]`);
        const currentValue = parseInt(quantityInput.value);
        
        if (currentValue > 1) {
          updateCartItemQuantity(productId, currentValue - 1);
        }
      });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.id;
        const quantityInput = document.querySelector(`.quantity-input[data-id="${productId}"]`);
        const currentValue = parseInt(quantityInput.value);
        
        updateCartItemQuantity(productId, currentValue + 1);
      });
    });
    
    // Quantity input change
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', function() {
        const productId = this.dataset.id;
        const newValue = parseInt(this.value);
        
        if (newValue > 0) {
          updateCartItemQuantity(productId, newValue);
        } else {
          // Reset to 1 if invalid value
          this.value = 1;
          updateCartItemQuantity(productId, 1);
        }
      });
    });
    
    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.id;
        removeFromCart(productId);
      });
    });
  }
  
  // Function to update cart item quantity
  async function updateCartItemQuantity(productId, quantity) {
    try {
      const response = await fetch(`/api/orders/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload cart to update UI
        loadCart();
      } else {
        alert(result.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('An error occurred while updating your cart. Please try again.');
    }
  }
  
  // Function to remove item from cart
  async function removeFromCart(productId) {
    try {
      const response = await fetch(`/api/orders/cart/${productId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload cart to update UI
        loadCart();
      } else {
        alert(result.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('An error occurred while removing the item from your cart. Please try again.');
    }
  }
  
  // Function to update cart count in header
  function updateCartCount(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = count;
    }
  }
  
  // Function to check if user is logged in
  async function checkAuth() {
    try {
      const response = await fetch('/api/users/current');
      const data = await response.json();
      
      const authLinks = document.getElementById('auth-links');
      const checkoutBtn = document.getElementById('checkout-btn');
      
      if (data.success && data.user) {
        // User is logged in
        authLinks.innerHTML = `
          <a href="/profile">${data.user.name}</a>
          <a href="#" id="logout-link">Logout</a>
          <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count" id="cart-count">0</span>
          </div>
        `;
        
        // Add logout event listener
        document.getElementById('logout-link').addEventListener('click', function(e) {
          e.preventDefault();
          logout();
        });
        
        // Enable checkout button
        if (checkoutBtn) {
          checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/checkout';
          });
        }
      } else {
        // User is not logged in
        authLinks.innerHTML = `
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count" id="cart-count">0</span>
          </div>
        `;
        
        // Modify checkout button to redirect to login
        if (checkoutBtn) {
          checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Please login to proceed with checkout');
            window.location.href = '/login';
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  }
  
  // Function to logout
  async function logout() {
    try {
      const response = await fetch('/api/users/logout');
      const data = await response.json();
      
      if (data.success) {
        alert('Logged out successfully');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out. Please try again.');
    }
  }