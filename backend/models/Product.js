const db = require('../config/db');

class Product {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM products');
      return rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  }

  static async getFeatured() {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE featured = 1 LIMIT 4');
      return rows;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  static async getByCategory(categoryId) {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching products from category ${categoryId}:`, error);
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id]);
    } catch (error) {
      console.error(`Error updating stock for product ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Product;