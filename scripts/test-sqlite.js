const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'ponder.db');

console.log('Testing SQLite database...');
console.log(`Database path: ${dbPath}`);

// Check if the database file exists
if (fs.existsSync(dbPath)) {
  console.log('Database file exists.');
} else {
  console.log('Database file does not exist. Creating a new one.');
}

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Create a test table
  db.run(`
    CREATE TABLE IF NOT EXISTS test_table (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `, function(err) {
    if (err) {
      console.error('Error creating test table:', err.message);
      return;
    }
    
    console.log('Test table created successfully.');
    
    // Insert a test record
    const timestamp = new Date().toISOString();
    db.run(`
      INSERT INTO test_table (name, created_at) VALUES (?, ?)
    `, ['Test Record', timestamp], function(err) {
      if (err) {
        console.error('Error inserting test record:', err.message);
        return;
      }
      
      console.log(`Test record inserted with ID: ${this.lastID}`);
      
      // Query the test record
      db.get(`
        SELECT * FROM test_table WHERE id = ?
      `, [this.lastID], function(err, row) {
        if (err) {
          console.error('Error querying test record:', err.message);
          return;
        }
        
        console.log('Test record retrieved successfully:');
        console.log(row);
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
});
