// db.js

const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'n3u3da!',
  database: 'finance_portfolio_manager'
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ MySQL database connected successfully');
    connection.release(); // release the connection back to the pool
  }
});

module.exports = pool;
