const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "air",
  connectTimeout: 60000,
});

db.connect((e) => {
  if (e) {
    console.error("❌ DB fail:", e.code);
    return;
  }
  console.log("✅ DB ok");
});

db.on("error", (e) => {
  console.error("DB err:", e.code);
});

module.exports = db;
