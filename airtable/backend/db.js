const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "speedspeed",
  database: process.env.DB_NAME || "airclone",
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to MySQL:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = db;
