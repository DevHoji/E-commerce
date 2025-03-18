document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Get order ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id');
      
      if (!orderId) {
        alert('Order ID not provided');
        window.location.href = '/';
        return;
      }
      
      // Check if user is logged in
      await checkAuth();
      
      // Load order details
      await loadOrderDetails(orderId);
    } catch (error) {
      console.error('Error initializing order success page:', error);
      alert('An error occurred. Please try again.');
    }
  });
  
  // Function to load order details
  async function loadOrderDetails(orderId) {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      
      if (!result.success) {
        alert(result.message || 'Failed to load order details');
        window.location.href = '/';
        return;
      }
      
      const order = result.order;
      
      // Populate order details
      document.getElementById('order-id').textContent = order.id;
      document.getElementById('order-date').textContent = new Date(order.created_at).toLocaleDateString();
      document.getElementById('order-status').textContent = order.status;
      document.getElementById('order-total').textContent = `$${order.totalAmount.toFixed(2)}`;
      
      // Populate order items
      const orderItemsList = document.getElementById('order-items-list');
      let itemsHTML = '';
      
      order.items.forEach(item => {
        itemsHTML += `
          <div class="order-item">
            <div>${item.productTitle}</div>
            <div>${item.quantity}</div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `;
      });
      
      orderItemsList.innerHTML = itemsHTML;
    } catch (error) {
      console.error('Error loading order details:', error);
      alert('An error occurred while loading order details. Please try again.');
    }
  }
  
  // Function to check if user is logged in
  async function checkAuth() {
    try {
      const response = await fetch('/api/users/current');
      const data = await response.json();
      
      const authLinks = document.getElementById('auth-links');
      
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
        
        // Fetch cart to update count
        getCart();
      } else {
        // User is not logged in (redirect to login as this page should only be accessible to logged in users)
        alert('Please login to view your order');
        window.location.href = '/login';
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
  
  // Function to get cart
  async function getCart() {
    try {
      const response = await fetch('/api/orders/cart');
      const cart = await response.json();
      
      const cartCount = document.getElementById('cart-count');
      if (cartCount) {
        cartCount.textContent = cart.totalQty || 0;
      }
    } catch (error) {
      console.error('Error getting cart:', error);
    }
  }