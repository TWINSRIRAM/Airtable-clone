import mysql from 'mysql';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',          
  database: 'airtable_clone'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

export default db;
