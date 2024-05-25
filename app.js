const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const data = [];

const downloadUrl = 'https://drive.usercontent.google.com/download?id=1osLQ59pZ93RKo_rp6JKoIEwupCi7Jqak&export=download&confirm=t';

axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'stream',
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
}).then(
    response =>
        new Promise((resolve, reject) => {
            response.data
                .pipe(fs.createWriteStream('nanpa-sorta-thousands.csv'))
                .on('finish', () => resolve())
                .on('error', e => reject(e));
        }),
).then(() => {
    console.log('File downloaded successfully');
    fs.createReadStream('nanpa-sorta-thousands.csv')
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed, ready for use.');
        });
}).catch(error => console.log(`Failed to download file due to error ${error}`));

app.get('/', (req, res) => {
    res.status(200).send("Hello!");
});

app.get('/email', async (req, res) => {
  try {
    const apiUrl = 'http://api.bulkoutlook.com/getEmail?num=1&no=IylenqlvLtSxxNHiLVlmWIuRvrJtFiYEyUjyFgxnHieaiJat&emailType=hotmail&format=txt';
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Set content-type to text/plain if the response is plain text
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

  for (let i = 0; i < data.length; i++) {
    if (data[i]['NPA'] == NPA && data[i]['NXX'] == NXX) {
      for (let b = 1; b < 10; b++) {
        if (data[i + b] && data[i + b]['NXX'] == NXX) {
          if (data[i + b]['Thousands'] == thousands) {
            res.status(200).send(data[i + b]);
            return;
          }
        } else {
          res.status(200).send(data[i]);
          return;
        }
      }
    }
  }
  res.status(200).send({ 'Company': 'phone_lookup_error' });
});

app.listen(PORT, () => console.log("It's alive!"));
