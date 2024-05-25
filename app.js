const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Define the directory and database file path
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'nanpa.db');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create SQLite database
let db;

// Function to initialize the database connection
function initializeDatabase() {
  db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error('Failed to open database:', err);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
}

// Function to download the database file
async function downloadDatabase() {
  try {
    const response = await axios({
      url: 'https://drive.usercontent.google.com/download?id=1_lbNMi52EO1Xqy-mt_BN9BM1ccME9a7U&export=download&confirm=t',
      method: 'GET',
      responseType: 'stream',
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dbFile);
      response.data.pipe(file);
      file.on('finish', resolve);
      file.on('error', reject);
    });

    console.log('Database file downloaded successfully.');
    initializeDatabase();
  } catch (error) {
    console.error(`Failed to download database file due to error: ${error}`);
  }
}

// Check if the database file exists and download if needed
if (!fs.existsSync(dbFile)) {
  downloadDatabase();
} else {
  initializeDatabase();
}

app.get('/', (req, res) => {
  res.status(200).send("Hello!");
});

app.get('/email', async (req, res) => {
  try {
    const apiUrl = 'http://api.bulkoutlook.com/getEmail?num=1&no=IylenqlvLtSxxNHiLVlmWIuRvrJtFiYEyUjyFgxnHieaiJat&emailType=hotmail&format=txt';
    const response = await axios.get(apiUrl);
    const data = response.data;

    res.header("Content-Type", 'text/plain');
    res.send(data);
  } catch (error) {
    res.status(500).send('Error fetching email');
  }
});

app.get('/lookup/:phonenumber', (req, res) => {
  let phonenumber = req.params['phonenumber'];
  phonenumber = phonenumber.replace('%20', '+');
  phonenumber = phonenumber.replace(' ', '+');
  console.log(phonenumber);

  if (phonenumber.slice(0, 2) != "+1" && phonenumber.length != 11) {
    res.status(200).send({ 'Company': 'country_not_supported' });
    return;
  }

  const NPA = phonenumber.slice(2, 5);
  const NXX = phonenumber.slice(5, 8);
  const thousands = phonenumber.slice(8, 9);

  db.get("SELECT * FROM nanpa WHERE NPA = ? AND NXX = ? AND Thousands = ?", [NPA, NXX, thousands], (err, row) => {
    if (err) {
      res.status(500).send({ 'Company': 'database_error' });
    } else if (row) {
      res.status(200).send(row);
    } else {
      db.get("SELECT * FROM nanpa WHERE NPA = ? AND NXX = ?", [NPA, NXX], (err, row) => {
        if (err) {
          res.status(500).send({ 'Company': 'database_error' });
        } else if (row) {
          res.status(200).send(row);
        } else {
          res.status(200).send({ 'Company': 'phone_lookup_error' });
        }
      });
    }
  });
});

app.listen(PORT, () => console.log("It's alive!"));
