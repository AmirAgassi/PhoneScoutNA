const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const downloadUrl = 'https://drive.usercontent.google.com/download?id=1osLQ59pZ93RKo_rp6JKoIEwupCi7Jqak&export=download&confirm=t';
const dbFile = 'nanpa.db';

// Create SQLite database
const db = new sqlite3.Database(dbFile);

// Function to initialize database
function initializeDatabase() {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS nanpa (NPA TEXT, NXX TEXT, Thousands TEXT, Company TEXT)", (err) => {
      if (err) {
        console.error('Failed to create table:', err);
      }
    });
  });
}

// Function to insert data into SQLite database
function insertDataIntoDatabase(data) {
  const stmt = db.prepare("INSERT INTO nanpa (NPA, NXX, Thousands, Company) VALUES (?, ?, ?, ?)");
  data.forEach(row => {
    stmt.run(row['NPA'], row['NXX'], row['Thousands'], row['Company']);
  });
  stmt.finalize();
  console.log('Data inserted into SQLite database.');
}

// Function to download and process CSV file
async function downloadAndProcessCSV() {
  try {
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream',
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    const csvData = [];
    response.data
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', () => {
        insertDataIntoDatabase(csvData);
      });

    await new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream('nanpa-sorta-thousands.csv'))
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log('File downloaded successfully and CSV data processed.');
  } catch (error) {
    console.error(`Failed to download file due to error: ${error}`);
  }
}

// Initialize the database
initializeDatabase();

// Download and process the CSV file
downloadAndProcessCSV();

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
