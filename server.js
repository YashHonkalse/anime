// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.static('public'));

// MySQL database connection
const db = mysql.createConnection({
  host: 'must-watch-anime.c7eeki0amd7u.ap-south-1.rds.amazonaws.com', 
  user: 'admin',
  password: 'EdMuNd123456',
  database: 'animedb',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Define the root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API route to fetch anime data
app.get('/api/anime', (req, res) => {
  const query = 'SELECT * FROM anime';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

