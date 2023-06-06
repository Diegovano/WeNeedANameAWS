const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json());

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
con.connect(function (err) {
    if (err) throw err;
    console.log("Successfully connected to the database...\n");
});

app.get("/mazeQuery", (req, res) => {
    con.query("SELECT * FROM Nodes", function (err, result, fields) {
        if (err) throw err;
        res.json(result)
    });
});

// Test endpoint 
app.get("/testQuery", (req, res) => {
    console.log("GET request received");
    console.log(req.query)
    const NID = req.query.NID;
    const X_Coord = req.query.X_Coord;
    const Y_Coord = req.query.Y_Coord;
  
    if (!NID || !X_Coord || !Y_Coord) {
      console.log(NID);
      console.log(X_Coord);
      console.log(Y_Coord);
      res.status(400).json({ error: 'Missing or invalid query parameters' });
      return;
    }

    con.query("INSERT INTO Nodes (NID, X_Coord, Y_Coord) VALUES (?,?,?)", 
                [NID, X_Coord, Y_Coord], (err, result) => {
                  if (err) {
                    console.log(err)
                  } 
                 
                });
  
    const responseData = {
      NID: parseInt(NID),
      X_Coord: parseInt(X_Coord),
      Y_Coord: parseInt(Y_Coord)
    };
  
    res.json(responseData);
  });
  
//Delete DB
app.get("/api/truncate", (req, res)=>{
    con.query("TRUNCATE TABLE Nodes", (err, result) => {
        if (err) throw err; 
    })
})


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});