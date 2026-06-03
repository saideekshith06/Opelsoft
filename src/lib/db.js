import mysql from 'mysql2/promise';

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'opelsoft',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  if (!global.dbPool) {
    global.dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'opelsoft',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  pool = global.dbPool;
}

export default pool;
