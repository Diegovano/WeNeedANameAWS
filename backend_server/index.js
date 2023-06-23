const express = require("express");
const cors = require('cors');
const fs = require('fs')
const bodyParser = require('body-parser');
const PORT = process.env.NODE_PORT || 3001;
const path = require('path')
const app = express();

const { WebSocketServer, WebSocket } = require('ws'); // websocket for vehicle navigation

const wss = new WebSocketServer({ port: 8080 });
wss.on("listening", (ws) => {
  console.log("Websocket Server ready!")
});
wss.on('connection', function connection(ws) {
  console.log("Got Connection!");
  ws.on('error', console.error);
  
  ws.on('message', function message(data) {
      console.log('received: %s', data);
  });
  
  ws.send('something');
});

// const ws1 = new WebSocket("ws://127.0.0.1:8080");

// ws1.on("open", () => {
//   ws1.send("hello local!");
// });

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

app.get("/adjacencyTable", (req, res) => {
    con.query("SELECT * FROM Paths", function (err, result, fields) {
        if (err) throw err;
        res.json(result)
    });
});

// Test endpoint 
app.get("/testQuery", (req, res) => {
    console.log("GET request received");
    const X_Coord = req.query.X_Coord;
    const Y_Coord = req.query.Y_Coord;
    nodeDecision(X_Coord, Y_Coord).then((msg) => {
        console.log(`node decision ${msg}\n`);
    }, err => {
        console.log(err.message);
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
    con.query("TRUNCATE TABLE Paths", (err, _result) => {
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
    for (var object in JSONArray) {
        if (JSONArray[object]["type"] == 'distance') {
            console.log("DISTANCE")
            dist = JSONArray[object]["value"];
            let deltaX = Math.sin((rover_H)) * dist;
            let deltaY = Math.cos((rover_H)) * dist;
            rover_X += deltaX;
            rover_Y += deltaY;
            console.log("Rover moved %f cm, x by %f, y by %f", dist.toFixed(2), deltaX.toFixed(2), deltaY.toFixed(2));
        } else if (JSONArray[object]["type"] == 'angle') {
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

let blueState = false;
app.get("/api/blueBeacon", (req, res) => {
    res.json({ blueBeacon: blueState });
});
app.post("/api/receiveBlue", (req, res) => {
    blueState = true;
    setTimeout(() => {
        blueState = false;
        console.log("Blue beacon is off");
    }, 6000);
    res.sendStatus(200);
});

let redState = false;
app.get("/api/redBeacon", (req, res) => {
    res.json({ redBeacon: redState });
});
app.post("/api/receiveRed", (req, res) => {
    redState = true;
    setTimeout(() => {
        redState = false;
        console.log("Red beacon is off");
    }, 6000);
    res.sendStatus(200);
});

let yellowState = false;
app.get("/api/yellowBeacon", (req, res) => {
    res.json({ yellowBeacon: yellowState });
});
app.post("/api/receiveYellow", (req, res) => {
    yellowState = true;
    setTimeout(() => {
        yellowState = false;
        console.log("Yellow beacon is off");
    }, 6000);
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


    const responseData = {
        X: X_Coord,
        Y: Y_Coord
    };

    res.json(responseData);

    // Go down in state logic 
    nodeDecision(X_Coord, Y_Coord);
});
let previous = {nid: null, xcoord: null, ycoord: null};

async function nodeDecision(X_Coord, Y_Coord) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT Nodes.NID
            FROM Nodes
            WHERE X_Coord BETWEEN (? - 5) AND (? + 5)
              AND Y_Coord BETWEEN (? - 5) AND (? + 5)`;
    
        con.query(query, [X_Coord, X_Coord, Y_Coord, Y_Coord], (err, result) => {
            if (err) {
                console.log(err);
            }
    
            // const nodeExists = result[0]['node_exists'];
            const nodeExists = result.length;
            console.log(X_Coord, previous.xcoord, Y_Coord, previous.ycoord)

            console.log('Node exists:', nodeExists);
        
            
            if (nodeExists) {
                const NID = result[0]['NID'];
                con.query("INSERT INTO Paths (NID_1, NID_2, distance) VALUES (?, ?, ?)", 
                    [NID, previous.nid, Math.sqrt((X_Coord - previous.xcoord) ** 2 + (Y_Coord - previous.ycoord) ** 2) ], (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        console.log(`Inserted path of distance ${Math.sqrt((X_Coord - previous.xcoord) ** 2 + (Y_Coord - previous.ycoord) ** 2)} into adjacency table\n`);
                        previous.nid = NID;
                        previous.xcoord = X_Coord;
                        previous.ycoord = Y_Coord;
                        console.log()
                        dijkstra(1).then((resp)=> {
                            console.log(`End node is ${resp.candidate}, path is ${JSON.stringify(resp.path)}`);
                        }, err => {
                            console.log(err.message);
                        });
                        return resolve('exists');
                    })
                // make func that takes NID and decides what to do : 1) If it has paths not mapped take them 2) Sends rover direction that would lead to that path
                //  
                // DO path linking and get NID
            } else {
                con.query("INSERT INTO Nodes (X_Coord, Y_Coord) VALUES (?,?)",
                    [X_Coord, Y_Coord], async (err, result) => {
                        if (err) {
                            reject(err);
                        } 
                        con.query('SELECT LAST_INSERT_ID();', (err, result) => {
                            NID = result[0]['LAST_INSERT_ID()'];
                            console.log(`Current NID ${NID}, previous ${previous.nid}`);
                            if (previous.nid != null) 
                            {
                                con.query("INSERT INTO Paths (NID_1, NID_2, distance) VALUES (?, ?, ?)", 
                                [NID, previous.nid, Math.sqrt((X_Coord - previous.xcoord) ** 2 + (Y_Coord - previous.ycoord) ** 2) ], (err, result) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    console.log(`Inserted path of distance ${Math.sqrt((X_Coord - previous.xcoord) ** 2 + (Y_Coord - previous.ycoord) ** 2)} into adjacency table\n`);
                                    previous.nid = NID;
                                    previous.xcoord = X_Coord;
                                    previous.ycoord = Y_Coord;
                                    console.log()
                                    dijkstra(1).then((resp)=> {
                                        console.log(`End node is ${resp.candidate}, path is ${JSON.stringify(resp.path)}`);
                                    }, err => {
                                        console.log(err.message);
                                    });
                                })
                            } else {
                                previous.nid = NID;
                                previous.xcoord = X_Coord;
                                previous.ycoord = Y_Coord;
                                dijkstra(1).then((resp)=> {
                                    console.log(`End node is ${resp.candidate}, path is ${JSON.stringify(resp.path)}`);
                                }, err => {
                                    console.log(err.message);
                                });
                                                        }
                        });
                });
                // 1) call function that gives paths --> asks ESP outgoing paths and their angle 
                // 1a) Function call to insert the angle in the DB with approriate offset 
                // 1b) Set the one you came from (-180 deg) as explored (1)
                // 2) Call the generic function choose next path algorithm --> Youre in a node 
                // 2a) Takes NID and heading and figures out : unexplored path ? Turn and set the chosen as explored and tell ESP to turn there
                //                                           : No free ? Look one out, is there an unexplored edge --> YES: Go there 
                //                                           : Repeat and when found make a list of nodes you have to traverse until you get to unexplored (routing table)
                //                                           : Set heading to reach first node in that array and go there and when new request come in make sure you are at the set node IF not achieved start everything from scratch 
                return resolve('new node');
            }
        });
    });
}


// Helper funcitons: 
function getPaths(NID, myHeading) {
    // is this what diego is doing? 
    // if yes then read from endpoint the absolute angles 
    // Offset the angles by doing angle - myHeading = angle rover needs to take to turn in the correct direction 
    // return roverAngles[]
}


// TO CHANGE HERE BECAUSE NO FIELD FOR ANGLE OR ANGLE IN NID
function insertAngleInDB(roverAngles, NID, prevAngle) {
    const insertQuery = 'INSERT INTO Nodes (NID, Angle, Explored) VALUES (?, ?, ?)';

    for (let i = 0; i < roverAngles.length; i++) {
        const angle = roverAngles[i];
        // Setting the one we came from as explored
        const isExplored = angle === prevAngle ? 1 : 0;

        con.query(insertQuery, [NID, angle, isExplored], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Angle ${angle} inserted successfully for NID ${NID}`);
            }
        });
    }
}

async function dijkstra(NID, isUnvisited = false) {
    return new Promise((resolve, reject) => {
        let nodes = new Set(); // contain all connected nodes
        let weights = new Map();
        let distances = new Map();
        let adjacency = new Map();
        let predecessor = new Map();
        let shortest = new Map();
        predecessor.set(NID, null);
        con.query('SELECT * FROM Paths', async (err, result) => {
            if(err || result.length == 0) {
                if (result.length == 0) return reject(Error('No NODES!'))
                return reject(err);
            }
            for (let i = 0 ; i < result.length ; i++){
                let row = result[i];
                let NID_1 = row.NID_1;
                let NID_2 = row.NID_2;
                let distance = row.Distance;
                nodes.add(NID_1);
                nodes.add(NID_2);
                weights.set(JSON.stringify({a: NID_1, b: NID_2}), distance);
                weights.set(JSON.stringify({a: NID_2, b: NID_1}), distance);
                if (adjacency.has(NID_1)) {
                    let existing = adjacency.get(NID_1);
                    adjacency.set(NID_1, [...existing, {NID_2, distance}]);
                } else {
                    adjacency.set(NID_1, [{NID_2, distance}]);
                }
                if (adjacency.has(NID_2)) {
                    let existing = adjacency.get(NID_2);
                    adjacency.set(NID_2, [...existing, {NID_1, distance}]);
                } else {
                    adjacency.set(NID_2, [{NID_1, distance}]);
                }

            }
            for(const node of nodes.values()) {
                distances.set(node, node === NID ? 0 : Infinity);
            }
            while (distances.size > 0) {
                let minimum = Infinity;
                let bestNodeId = 0;
                for(const [key, value] of distances.entries()) {
                    if (value < minimum) {
                        minimum = value;
                        bestNodeId = parseInt(key);
                    }
                }
                distances.delete(bestNodeId);
                shortest.set(bestNodeId, minimum);

                if (!adjacency.get(bestNodeId)) {
                    throw Error('Problem with adjacency list!');
                    reject(Error('Problem with adjacency list!'));
                }

                for(const [_key, next_vertex] of Object.entries(adjacency.get(bestNodeId))) {
                    if (shortest.has(next_vertex.NID_1 || next_vertex.NID_2)) continue;
                    let c = distances.has(next_vertex.NID_1 || next_vertex.NID_2) ? distances.get(next_vertex.NID_1 || next_vertex.NID_2) : Infinity;
                    let e = minimum + weights.get(JSON.stringify({a: bestNodeId, b: next_vertex.NID_1 || next_vertex.NID_2}));
                    if ( e < c ) {
                        distances.set(next_vertex.NID_1 || next_vertex.NID_2, e);
                        predecessor.set(next_vertex.NID_1 || next_vertex.NID_2, bestNodeId);
                    }
                }
            }
            let targetNodeId;
    
            if(isUnvisited) {
                con.query('SELECT * FROM Nodes WHERE Explored = 0', (err, res) => {
                    if (err) return reject(err);
                    else {
                        let shortest = Infinity;
                        let candidate = null;
                        for (const [key, val] of shortest.entries()) {
                            if (res.includes(distances.get(key))) {
                                if (shortest > val) {
                                    candidate = key;
                                    shortest = val;
                                }
                            }
                        }
                        if (candidate) 
                        {
                            let path = new Array();
                            let next = parseInt(candidate);
                            while(predecessor.get(next) != NID) {
                                path.push(predecessor.get(next));
                                next = parseInt(predecessor.get(next));
                            }
                            path.push(NID);
                            return resolve(candidate, path);
                        } else {
                            console.log("FINISHED??");
                        }
                    }
                });
            } else {
                let longest = 0;
                let candidate = null;
                for (const [key, val] of shortest.entries()) {
                    if (longest < val && val != Infinity) { // disconnected node
                        candidate = key;
                        longest = val;
                    }
                }
                if (candidate)
                {
                    let path = new Array();
                    let next = parseInt(candidate);
                    while(predecessor.get(next) != NID) {
                        path.push(predecessor.get(next));
                        next = parseInt(predecessor.get(next));
                    }
                    path.push(NID);
                    return resolve({candidate, path});
                }
            }
        });

    });
}

function chooseNextPath(NID, Heading) {
    // Check if there is an unexplored path from the current node
    con.query('SELECT Angle FROM Nodes WHERE NID = ? AND Explored = 0', [NID], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length > 0) {
          // Unexplored path found, choose the first available angle
          const nextAngle = result[0].Angle;
          console.log('Next angle:', nextAngle);
          
          // Set the chosen path as explored
          con.query('UPDATE Nodes SET Explored = 1 WHERE NID = ? AND Angle = ?', [NID, nextAngle], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`Angle ${nextAngle} marked as explored for NID ${NID}`);
              
              // Tell ESP to turn to the chosen angle
              // (Code for ESP communication goes here)
            }
          });
        } else {
          // No unexplored path, look for a neighboring node with an unexplored edge
          con.query('SELECT NID FROM Nodes WHERE NID != ? AND Explored = 0', [NID], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              if (result.length > 0) {
                dijkstra(result[0]);


                // Unexplored neighboring node found, choose the first available node
                const nextNodeID = result[0].NID;
                console.log('Next node:', nextNodeID);
                
                // Calculate the heading to reach the next node
                // Don't know how to do this ... 
                // const nextHeading = calculateHeading(NID, nextNodeID);
                console.log('Next heading:', nextHeading);
                
                // Update the heading of the current node
                con.query('UPDATE Nodes SET Heading = ? WHERE NID = ?', [nextHeading, NID], (err, result) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(`Heading updated to ${nextHeading} for NID ${NID}`);
                    
                    // Move to the next node
                    // Tell ESP to moveToNode(nextNodeID);
                  }
                });
              } else {
                // No unexplored path or neighboring node, exploration complete
                console.log('Exploration complete!');
              }
            }
          });
        }
      }
    });
  }
  


app.get("/Display", (_req, res) => {
    con.query("SELECT * FROM Display", function (err, result, _fields) {
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

const stdin = process.stdin;

// without this, we would only get streams once enter is pressed
// stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
// stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  
  if ( key === 'd') {
    dijkstra(1).then((resp)=> {
        console.log(`End node is ${resp.candidate}, path is ${JSON.stringify(resp.path)}`);
    }, err => {
        console.log(err.message);
    });
  }
  // write the key to stdout all normal like
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(key);
    }
  })
});
