import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'tracking',
  password: 'Loginamd@321',
  database: 'tracking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
