document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Get product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      
      if (!productId) {
        window.location.href = '/products';
        return;
      }
      
      // Fetch product details
      const response = await fetch(`/api/products/${productId}`);
      const product = await response.json();
      
      if (!product || response.status === 404) {
        alert('Product not found');
        window.location.href = '/products';
        return;
      }
      
      // Update product details in the DOM
      document.getElementById('product-image').src = product.image_url;
      document.getElementById('product-image').alt = product.title;
      document.getElementById('product-title').textContent = product.title;
      document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
      document.getElementById('product-description').textContent = product.description;
      document.getElementById('product-stock').textContent = `In Stock: ${product.stock}`;
      document.getElementById('product-quantity').max = product.stock;
      
      // Add event listeners
      const quantityInput = document.getElementById('product-quantity');
      const decreaseBtn = document.querySelector('.decrease-btn');
      const increaseBtn = document.querySelector('.increase-btn');
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      
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
        try {
          const quantity = parseInt(quantityInput.value);
          
          const response = await fetch(`/api/orders/cart/${productId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
          });
          
          const result = await response.json();
          
          if (result.success) {
            alert('Product added to cart');
            // Update cart count in header
            updateCartCount(result.cart.totalQty);
          } else {
            alert(result.message || 'Failed to add product to cart');
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          alert('An error occurred. Please try again.');
        }
      });
      
      // Check if user is logged in
      checkAuth();
      
    } catch (error) {
      console.error('Error loading product:', error);
      alert('An error occurred while loading the product. Please try again.');
    }
  });
  
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
        // User is not logged in
        authLinks.innerHTML = `
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count" id="cart-count">0</span>
          </div>
        `;
        
        // Fetch cart to update count
        getCart();
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
      
      updateCartCount(cart.totalQty || 0);
    } catch (error) {
      console.error('Error getting cart:', error);
    }
  }