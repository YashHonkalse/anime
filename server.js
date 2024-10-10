const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'must-watch-anime.c7eeki0amd7u.ap-south-1.rds.amazonaws.com',  // Replace with your RDS endpoint
    user: 'admin',   // Replace with your database username
    password: 'EdMuNd123456', // Replace with your database password
    database: 'animedb'     // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection error: ' + err);
        return;
    }
    console.log('Connected to the database.');
});

// Serve static files (e.g., CSS)
app.use(express.static('public'));

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
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

