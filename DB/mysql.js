require("dotenv").config();

const mysql = require('mysql2');

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

// MySQL connect
const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database
});

// Connect to MySQL
connection.connect(function (err) {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to the MySQL server.');
});

// Log errors during queries
connection.on('error', function (err) {
  console.error('MySQL error:', err);
});

// Promisify the query method
const util = require('util');
connection.query = util.promisify(connection.query);

// Export the connection
module.exports = connection;
