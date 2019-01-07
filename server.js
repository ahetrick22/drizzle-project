const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'recycling',
  password        : 'password',
  database        : 'recycling-project'
});

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(cors());

app.get('/centers', (req, res) => {
    pool.query('SELECT * FROM center', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        if (error) throw error;

        // results will contain the results of the query
        res.json(results);
        // fields will contain information about the returned results fields (if any)
    });
});

app.use((req, res) => {
    res.status(404)
    .send('404 error! Resource not found.');
  });
  
  app.listen(8000, () => {
    console.log('Node.js listening on port ' + 8000)
  })