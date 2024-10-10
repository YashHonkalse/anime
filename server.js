const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Database connection configuration
const db = mysql.createConnection({
    host: 'must-watch-anime.c7eeki0amd7u.ap-south-1.rds.amazonaws.com', // Replace with your RDS endpoint
    user: 'admin', // Replace with your RDS username
    password: 'EdMuNd123456', // Replace with your RDS password
    database: 'animedb' // Replace with your RDS database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to fetch anime data from the database
app.get('/api/anime', (req, res) => {
    db.query('SELECT * FROM anime', (err, results) => {
        if (err) {
            console.error('Error fetching anime data: ' + err);
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

