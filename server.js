const express = require('express');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const port = 3000;

// Set AWS region
AWS.config.update({ region: 'us-east-1' });
const secretsManager = new AWS.SecretsManager();

// Global db variable
let db;

async function getDbCredentials() {
    const secretName = "must-watch-anime-db-creds";
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

async function initializeDbConnection() {
    try {
        const credentials = await getDbCredentials();
        const dbConfig = {
            host: "must-watch-anime-db.cf8u4ugo4i4i.us-east-1.rds.amazonaws.com",
            user: "admin",
            password: "EdMuNd123456",
            database: "animedb"
        };

        console.log("Resolved DB config:", dbConfig);

        db = mysql.createConnection(dbConfig);

        db.connect((err) => {
            if (err) {
                console.error("Error connecting to the database:", err);
                setTimeout(initializeDbConnection, 5000);
            } else {
                console.log("Connected to the database.");
            }
        });
    } catch (err) {
        console.error("Failed to fetch database credentials:", err);
        process.exit(1);
    }
}

initializeDbConnection().then(() => {
    // Serve the index.html on "/"
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    // Provide data via /api/anime
    app.get('/api/anime', (req, res) => {
        if (!db) {
            return res.status(500).send('Database connection not established');
        }

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

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
