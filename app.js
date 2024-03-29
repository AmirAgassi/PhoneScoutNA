const app = require('express')();
const csv = require('csv-parser');
const fs = require('fs');

const cheerio = require('cheerio');


const PORT = process.env.PORT;
const cors = require('cors');

app.use(cors());
function numberWithSpaces(value, pattern) {
    var i = 0,
      phone = value.toString();
    return pattern.replace(/#/g, _ => phone[i++]);
}
  
const axios = require('axios');
const https = require('https');

const fileId = '1osLQ59pZ93RKo_rp6JKoIEwupCi7Jqak';
const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
axios.get(url).then(response => {
    const $ = cheerio.load(response.data);
    const confirmToken = $('a').first().attr('href').split('=')[2];

    const downloadUrl = `${url}&confirm=${confirmToken}`;
    
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
        console.log('File downloaded successfully')
        fs.createReadStream('nanpa-sorta-thousands.csv')
          .pipe(csv())
          .on('data', (row) => {
            data.push(row)
          })
          .on('end', () => {
            console.log('CSV file successfully processed, ready for use.');
        });

    })
    .catch(error => console.log(`Failed to download file due to error ${error}`));
}).catch(error => console.log(`Failed to get the confirm token due to error ${error}`));

app.get('/', (req,res) => {
    res.status(200).send("Hello!")
})

app.get('/email', async (req, res) => {
  try {
    const apiUrl = 'http://api.bulkoutlook.com/getEmail?num=1&no=IylenqlvLtSxxNHiLVlmWIuRvrJtFiYEyUjyFgxnHieaiJat&emailType=hotmail&format=txt';
    const response = await fetch(apiUrl);
    const data = await response.text();
    
    // Set content-type to text/plain if the response is plain text
    res.header("Content-Type",'text/plain');
    res.send(data);
  } catch (error) {
    res.status(500).send('Error fetching email');
  }
});

app.get('/lookup/:phonenumber', (req,res) => {
    var phonenumber = req.params['phonenumber'];
    phonenumber = phonenumber.replace('%20', '+');
    phonenumber = phonenumber.replace(' ', '+');
    console.log(phonenumber)
    if (phonenumber.slice(0,2) != "+1" && phonenumber.length != 11) {
        res.status(200).send({'Company':'country_not_supported'}) 
    }
    var NPA = phonenumber.slice(2, 5)
    var NXX = phonenumber.slice(5, 8)
    var thousands = phonenumber.slice(8,9)
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i]['NPA'] == NPA && data[i]['NXX'] == NXX) {
            for (var b = 1; b < 10; b++) {
                if (data[i+b]['NXX'] == NXX) {
                    if (data[i+b]['Thousands'] == thousands) {
                        res.status(200).send(data[i+b])
                        return
                    }
                }
                else {
                    res.status(200).send(data[i])
                    return
                }
            }
        }
    }
    res.status(200).send({'Company':'phone_lookup_error'}) 
})



var data = [];

app.listen(
    PORT,
    () => console.log("It's alive!")
)
