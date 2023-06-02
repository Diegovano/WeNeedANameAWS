const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));


var mysql = require('mysql');
var con = mysql.createConnection(
{
 host: "54.82.44.87",
 user: "username",
 password: "usrpwd",
 database: "MazeDB"
});
con.connect(function(err) {
 if (err) throw err;
 console.log("Successfully connected to the database...\n");
});

app.get("/mazeQuery", (req, res) => {
    con.query("SELECT * FROM Nodes", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
    });
    });


app.get("/tableData33", (req, res) => {

    res.json(
        {
            "tableData33": [
                ['Ed', 15 + Math.floor(Math.random() * 35), 'Male'],
                ['Mia', 15 + Math.floor(Math.random() * 35), 'Female'],
                ['Max', 15 + Math.floor(Math.random() * 35), 'Male']
            ]
        })
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});