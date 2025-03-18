const db = require('../config/db');

class Order {
  static async create(orderData) {
    try {
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // Insert order
        const [orderResult] = await conn.query(
          'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, ?)',
          [orderData.userId || null, orderData.totalAmount, JSON.stringify(orderData.shippingAddress), orderData.paymentMethod, 'pending']
        );
        
        const orderId = orderResult.insertId;
        
        // Insert order items
        for (const item of orderData.items) {
          await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.productId, item.quantity, item.price]
          );
          
          // Update product stock
          await conn.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }
        
        await conn.commit();
        
        return orderId;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      // Get order details
      const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
      
      if (orderRows.length === 0) {
        return null;
      }
      
      const order = orderRows[0];

      // Parse shipping address from JSON
      if (order.shipping_address) {
        order.shipping_address = JSON.parse(order.shipping_address);
      }
      
      // Get order items
      const [itemRows] = await db.query(
        `SELECT oi.*, p.title, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [id]
      );
      
      order.items = itemRows;
      
      return order;
    } catch (error) {
      console.error(`Error fetching order with id ${id}:`, error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

      // Parse shipping address from JSON for each order
      rows.forEach(order => {
        if (order.shipping_address) {
          order.shipping_address = JSON.parse(order.shipping_address);
        }
      });
      
      return rows;
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Order;