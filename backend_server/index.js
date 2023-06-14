const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.NODE_PORT || 3001;
const path = require('path')
const app = express();

app.use(express.static(path.resolve(__dirname, './eee-bug-app/build')));

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

app.get("/mazeQuery", (_req, res) => {
    con.query("SELECT * FROM Nodes", function (err, result, _fields) {
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
        [NID, X_Coord, Y_Coord], (err, _result) => {
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
app.get("/api/truncate", (_req, _res) => {
    con.query("TRUNCATE TABLE Nodes", (err, _result) => {
        if (err) throw err;
    })
})


// Initialize flag value
let flag = 0;

// Endpoint to receive triangulate request
app.post("/api/triangulate", (req, res) => {
    flag = 1;
    console.log("Triangulate request received. Setting flag to 1.");
    res.sendStatus(200);
});

// Endpoint to receive reset request
app.post("/api/reset", (req, res) => {
    flag = 0;
    console.log("Reset request received. Setting flag to 0.");
    res.sendStatus(200);
});

// Endpoint to get the current flag value
app.get("/api/flag", (req, res) => {
    res.json({ flag });
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Algorithm outline: 

// 1) Get distance to beacon in pixel from camera (D)
// 2) Keep count of the quadrant in which the reading is made (variable angle offset )
// 3) Get angle of beacon with respect to center of quadrant by doing: 
//     alpha = D/340 * 24
//     And add the offset  : 
//     theta_1 = offset + alpha
// 4) Repeat 1, 2, 3 until 3 beacons are found 
// 5) Subtract theta_2 with theta_1 and theta_3 with theta_2 to get theta_AB and theta_BC respectively
// 6) Get distance h_AB and h_BC (from center of side AB and side BC)
//     h_xy = xy / 2 * 1/tan(theta_xy / 2)
// 7) Draw 2 circles and get their intersection 
// 8) Return intersection coordinates as the position of the rover 
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Initialize variables
let coordB = { x: 1, y: 1 }
let coordR = { x: 1, y: 88 }
let coordY = { x: 88, y: 112 }

// Route to handle beacon distance readings
app.get('/beacon', (req, res) => {

    // Getting input data and processing: 
    console.log("GET request received for beacon");
    console.log(req.query)
    beaconsAngles = []
    const DB = Number(req.query.distanceB);
    const DR = Number(req.query.distanceR);
    const DY = Number(req.query.distanceY);

    const rotationNumberB = Number(req.query.rotationB);
    const rotationNumberR = Number(req.query.rotationR);
    const rotationNumberY = Number(req.query.rotationY);

    function getAngle(D, rotation) {
        D -= 320;
        const angle = (D / 320) * 24;
        return beaconsAngles.push((angle + (rotation)));
    }

    getAngle(DY, rotationNumberY);
    getAngle(DR, rotationNumberR);
    getAngle(DB, rotationNumberB);
    // [Y, R, B]
    console.log("list of angles: " + beaconsAngles)

    //thetaRY
    let alpha = beaconsAngles[1] - beaconsAngles[0];
    console.log("alpha: " + alpha)
    // thetaBR
    let gamma = beaconsAngles[2] - beaconsAngles[1];
    console.log("gamma: " + gamma)
    beaconsAngles = []
    // Inputs
    let EB = coordB.x;
    let ER = coordR.x;
    let EY = coordY.x;
    let NB = coordB.y;
    let NR = coordR.y;
    let NY = coordY.y;
    // Radians 
    let ang_alpha = alpha * Math.PI / 180;
    let ang_gamma = gamma * Math.PI / 180;
    let ang_beta = 2 * Math.PI - ang_alpha - ang_gamma;


    // Calculating distances:
    let BR = Math.sqrt((EB - ER) ** 2 + (NB - NR) ** 2);
    let BY = Math.sqrt((EB - EY) ** 2 + (NB - NY) ** 2);
    let RY = Math.sqrt((ER - EY) ** 2 + (NR - NY) ** 2);

    // Calculating angles: 
    angB = Math.acos((Math.pow(BR, 2) + Math.pow(BY, 2) - Math.pow(RY, 2)) / (2 * BR * BY));
    angR = Math.acos((Math.pow(BR, 2) + Math.pow(RY, 2) - Math.pow(BY, 2)) / (2 * BR * RY));
    angY = Math.acos((Math.pow(BY, 2) + Math.pow(RY, 2) - Math.pow(BR, 2)) / (2 * BY * RY));

    // Calculating cotangents of angles: 
    COT_B = 1 / Math.tan(angB);
    COT_R = 1 / Math.tan(angR);
    COT_Y = 1 / Math.tan(angY);
    COT_ALPHA = 1 / Math.tan(ang_alpha);
    COT_BETA = 1 / Math.tan(ang_beta);
    COT_GAMMA = 1 / Math.tan(ang_gamma);

    // Calculating scalers: 
    KB = 1 / (COT_B - COT_ALPHA);
    KR = 1 / (COT_R - COT_BETA);
    KY = 1 / (COT_Y - COT_GAMMA);
    K = KB + KR + KY;

    // Calculating final coordinates: 
    E = (KB * EB + KR * ER + KY * EY)/K;
    N = (KB * NB + KR * NR + KY * NY)/K;

    const currentPosition = { x: E, y: N };
    // Testing purposes:
    let NID = 1;
    let X_Coord = parseInt(currentPosition.x);
    let Y_Coord = parseInt(currentPosition.y);

    con.query("INSERT INTO Nodes (NID, X_Coord, Y_Coord) VALUES (?,?,?)",
        [NID, X_Coord, Y_Coord], (err, _result) => {
            if (err) {
                console.log(err)
            }

        });

    const responseData = {
        NID: parseInt(NID),
        X: X_Coord,
        Y: Y_Coord
    };

    res.json(responseData);
});


app.get('/*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, './eee-bug-app/build', 'index.html'));
})


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});