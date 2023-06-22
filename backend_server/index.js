const express = require("express");
const cors = require('cors');
const fs = require('fs')
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
    if (err) {
      console.log("Successfully failed to connect to the database...\n");
      throw err;
    }
    else {
      console.log("Successfully connected to the database...\n");
    }
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
    const X_Coord = req.query.X_Coord;
    const Y_Coord = req.query.Y_Coord;
    con.query("INSERT INTO Nodes (X_Coord, Y_Coord) VALUES (?,?)",
        [X_Coord, Y_Coord], (err, _result) => {
            if (err) {
                console.log(err)
            }

        });
    const responseData = {
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
    con.query("TRUNCATE TABLE Positions", (err, _result) => {
	if (err) throw err;
   }) 
   con.query("TRUNCATE TABLE Display", (err, _result) => {
    if (err) throw err;
   })
});


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

app.get("/LDR", (req, res) => {
    let L = req.query.L; //Left
    let R = req.query.R; //Right
    let F = req.query.F; // Forward 
    let FR = req.query.FR; // Forward Left 
    let FL = req.query.FL; // Forward Right
}); 

// Keep track of motor position
let rover_X = 0, rover_Y = 0, rover_H = 0, dist = 0, delta_H = 0;

app.post("/api/motor", (req, res) => {
    console.log("Recevied from rover:");
    let JSONArray = req.body;
    console.log(req.body);
    res.sendStatus(200);
    for (var object in JSONArray){
        if (JSONArray[object]["type"] == 'distance'){
	    console.log("DISTANCE")
            dist = JSONArray[object]["value"];
            let deltaX = Math.sin((rover_H)) * dist;
            let deltaY = Math.cos((rover_H)) * dist;
            rover_X += deltaX;
            rover_Y += deltaY;
            console.log("Rover moved %f cm, x by %f, y by %f", dist.toFixed(2), deltaX.toFixed(2), deltaY.toFixed(2));
        } else if (JSONArray[object]["type"] == 'angle'){
            console.log("ANGLE")
            delta_H = JSONArray[object]["value"];
            rover_H += delta_H;
            console.log("Rover turned by %f", delta_H.toFixed(2));
        }

        console.log("New Rover position: X %f, Y %f, H %f", rover_X.toFixed(2), rover_Y.toFixed(2), rover_H.toFixed(2));

        con.query("INSERT INTO Display (X_Coord, Y_Coord, Steps, Heading) VALUES (?, ?, ?, ?)", 
            [rover_X, rover_Y, dist.toFixed(2), delta_H.toFixed(2)], (err, _result) => {
                if (err) {
                    console.log(err);
                }
        });

        con.query("INSERT INTO Positions (X_Coord, Y_Coord, Heading) VALUES (?, ?, ?)",
        [rover_X.toFixed(2), rover_Y.toFixed(2), rover_H.toFixed(2)], (err, _result) => {
            if (err) {
                console.log(err)
            }
        });

    };
})

app.get("/estimateMazeQuery", (_req, res) => {
    con.query("SELECT X_Coord, Y_Coord FROM Positions", function (err, result, _fields) {
        if (err) throw err;
        res.json(result)
    });
});

let blueBeacon, redBeacon, yellowBeacon;
let flagBlueTimeout;
app.post("/api/receiveBlue", (req, res) => {
    blueBeacon = true;
    clearTimeout(flagBlueTimeout);
    flagBlueTimeout = setTimeout(() => {
        setBlueState(false);
        console.log("blue is off");
  }, 3000);

  res.sendStatus(200);
});

let flagRedTimeout;
app.post("/api/receiveRed", (req, res) => {
  
  clearTimeout(flagRedTimeout);
  setRedState(true);
  flagRedTimeout = setTimeout(() => {
    setRedState(false);
    console.log("red is off");
  }, 3000);

  res.sendStatus(200);
});

let flagYellowTimeout;
app.post("/api/receiveYellow", (req, res) => {
  clearTimeout(flagYellowTimeout);
  setYellowState(true);
  flagYellowTimeout = setTimeout(() => {
    setYellowState(false);
    console.log("yellow is off");
  }, 3000);

  res.sendStatus(200);
});



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Driving Algorithm Outline: 
// RSLB
// TODO: Keep track of visited nodes in DB, when all nodes are visited at least twice (Tremaux) the maze is mapped 
//     : OR keep count of unvisited edges at each node and maze is mapped when counter is 0 for each node 

// def mapMaze():
//    steps = x
//    turnAngle = y
//    rightWall = IR.readingR
//    frontWall = IR.readingF
//    while (!complete):
//      if (rightWall)
//          if(frontWall):
//              turnLeft(45)
//          elif(leftWall in IR range):
//              turnRight(turnAngle)
//              moveForward(steps)
//          else:
//              moveForward(steps)
//      else: 
//          moveForward(steps) 
//          triangulate() & createNode()
//          moveBack(steps)
//          turnRight(turnAngle) & moveForward(steps)   
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Triangulation Algorithm Outline: 

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
let coordB = { x: 0, y: 0 }
let coordR = { x: 0, y: 360 }
let coordY = { x: 240, y: 360 }

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
        let computedAngle = angle + rotation
        if (computedAngle < 0) {
            computedAngle += 360
        }
        return beaconsAngles.push(computedAngle);
    }

    getAngle(DY, rotationNumberY);
    getAngle(DR, rotationNumberR);
    getAngle(DB, rotationNumberB);
    // [Y, R, B]
    console.log("list of angles: " + beaconsAngles)

    //thetaYR
    let alpha = Math.abs(beaconsAngles[1] - beaconsAngles[0]);
    if (alpha > 180) { alpha = 360 - alpha; }
    console.log("alpha: " + alpha)
    // thetaBR
    let gamma = Math.abs(beaconsAngles[2] - beaconsAngles[1]);
    if (gamma > 180) { gamma = 360 - gamma; }
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
    console.log("BR: " + BR)
    console.log("BY: " + BY)
    console.log("RY: " + RY)

    // Calculating angles: 
    angB = Math.acos((Math.pow(BR, 2) + Math.pow(BY, 2) - Math.pow(RY, 2)) / (2 * BR * BY));
    angR = Math.acos((Math.pow(BR, 2) + Math.pow(RY, 2) - Math.pow(BY, 2)) / (2 * BR * RY));
    angY = Math.acos((Math.pow(BY, 2) + Math.pow(RY, 2) - Math.pow(BR, 2)) / (2 * BY * RY));
    console.log("angB: " + angB)
    console.log("angR: " + angR)
    console.log("angY: " + angY)

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
    E = (KB * EB + KR * ER + KY * EY) / K;
    N = (KB * NB + KR * NR + KY * NY) / K;

    // calculate distances from point P
    BP = Math.sqrt(Math.pow((EB - E), 2) + Math.pow((NB - N), 2));
    RP = Math.sqrt(Math.pow((ER - E), 2) + Math.pow((NR - N), 2));
    YP = Math.sqrt(Math.pow((EY - E), 2) + Math.pow((NY - N), 2));


    // calculate angles in degrees
    RBY = angB * 180 / Math.PI
    BRY = angR * 180 / Math.PI
    BYR = angY * 180 / Math.PI

    const currentPosition = { x: E, y: N };


    // DEBUG
    console.log("BR: " + BR)
    console.log("BY: " + BY)
    console.log("RY: " + RY)
    console.log("BP: " + BP)
    console.log("RP: " + RP)
    console.log("YP: " + YP)
    console.log("RBY: " + RBY)
    console.log("BRY: " + BRY)
    console.log("BYR: " + BYR)
    console.log("Position found: x: " + currentPosition.x + ", y: " + currentPosition.y);

    // Logging data for heatmap:   
    const content = {
        timestamp: Date.now(),
        distanceB: DB,
        headingB: rotationNumberB,
        distanceR: DR,
        headingR: rotationNumberR,
        distanceY: DY,
        headingY: rotationNumberY,
        PositionFoundX: currentPosition.x,
        PositionFoundY: currentPosition.y,
        startAngleY: beaconsAngles[0],
        startAngleR: beaconsAngles[1],
        startAngleB: beaconsAngles[2],
        thetaYR: alpha,
        thetaBR: gamma,
        distanceBP: BP,
        distanceRP: RP,
        distanceYP: YP,
        _thetaRBY: RBY,
        _thetaBRY: BRY,
        _thetaBYR: BYR,
        _distanceBR: BR,
        _distanceBY: BY,
        _distanceRY: RY,
    };
    // Testing purposes:
    let X_Coord = parseInt((currentPosition.x));
    let Y_Coord = parseInt((currentPosition.y));

    
    con.query("INSERT INTO Nodes (X_Coord, Y_Coord) VALUES (?,?)",
        [X_Coord, Y_Coord], (err, _result) => {
            if (err) {
                console.log(err)
            }

        });

    const responseData = {
        X: X_Coord,
        Y: Y_Coord
    };

    res.json(responseData);
});

app.get("/Display", (_req, res) => {
    con.query("SELECT * FROM Display", function(err, result, _fields) {
        if (err) throw err;
        res.json(result)
    });
});





app.get('/*', (_req, res) => {
    res.sendFile(path.join(__dirname, './eee-bug-app/build', 'index.html'));
})


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
