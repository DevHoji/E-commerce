const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'ecommerce_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection(); // Use async/await
    console.log('Connected to MySQL');
    connection.release(); // Release connection
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
  }
})();


module.exports = pool;