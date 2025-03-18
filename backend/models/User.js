const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Insert user into database
      const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [userData.name, userData.email, hashedPassword]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  }

  static async authenticate(email, password) {
    try {
      const user = await this.getByEmail(email);
      
      if (!user) {
        return null;
      }
      
      const match = await bcrypt.compare(password, user.password);
      
      if (match) {
        // Don't return the password
        delete user.password;
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = User;