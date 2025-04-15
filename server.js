const express = require('express');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const app = express();
const port = 3000;

// Set up AWS SDK
const secretsManager = new AWS.SecretsManager();

// Function to retrieve credentials from Secrets Manager
async function getDbCredentials() {
    const secretName = "must-watch-anime-db-creds"; // The name of your secret in Secrets Manager
    try {
        const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        if (data.SecretString) {
            return JSON.parse(data.SecretString);
        } else {
            const buff = Buffer.from(data.SecretBinary, 'base64');
            return JSON.parse(buff.toString('ascii'));
        }
    } catch (err) {
        console.log("Error retrieving secrets:", err);
        throw err;
    }
}

// Fetch the credentials asynchronously
let dbConfig;
async function initializeDbConnection() {
    try {
        const credentials = await getDbCredentials();
        dbConfig = {
            host: credentials.host,
            user: credentials.username,
            password: credentials.password,
            database: credentials.database
        };

        // Initialize MySQL connection with the fetched credentials
        db = mysql.createConnection(dbConfig);
        db.connect((err) => {
            if (err) {
                console.error("Error connecting to the database:", err);
                setTimeout(initializeDbConnection, 5000);  // Retry if connection fails
            } else {
                console.log("Connected to the database.");
            }
        });
    } catch (err) {
        console.error("Failed to fetch database credentials:", err);
        process.exit(1);  // Stop the app if we can't get credentials
    }
}

// Call the initialization function before starting the server
initializeDbConnection().then(() => {
    // Define your API and other routes
    app.get('/', (req, res) => {
        res.send("Welcome to Must Watch Anime");
    });

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

    // Start the server after successful DB connection
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
