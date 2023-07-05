const app = require('express')();
const csv = require('csv-parser');
const fs = require('fs');

const PORT = 8080;
const cors = require('cors');

app.use(cors());
function numberWithSpaces(value, pattern) {
    var i = 0,
      phone = value.toString();
    return pattern.replace(/#/g, _ => phone[i++]);
}
  

app.get('/', (req,res) => {
    res.status(200).send("Hello!")
})

app.get('/lookup/:phonenumber', (req,res) => {
    var phonenumber = req.params['phonenumber'];
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

fs.createReadStream('test_sample.csv')
  .pipe(csv())
  .on('data', (row) => {
    data.push(row)
  })
  .on('end', () => {
    console.log('CSV file successfully processed, ready for use.');
});


app.listen(
    PORT,
    () => console.log("It's alive!")
)