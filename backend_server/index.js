const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.NODE_PORT || 3001;
const env = process.env;
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
app.get("/api/truncate", (req, res) => {
    con.query("TRUNCATE TABLE Nodes", (err, result) => {
        if (err) throw err;
    })
})


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
let angleOffset = 45;
let thetaAB, thetaBC, thetaAC;
let hAB, hBC, hAC;
let coordA = { x: 1, y: 1 }
let coordB = { x: 1, y: 10 }
let coordC = { x: 14, y: 10 }

// Route to handle beacon distance readings
app.get('/beacon', (req, res) => {
    console.log("GET request received for beacon");
    console.log(req.query)
    beaconsAngles = []
    const D1 = req.query.distance1;
    const D2 = req.query.distance2;
    const D3 = req.query.distance3;

    const rotationNumber1 = req.query.rotation1;
    const rotationNumber2 = req.query.rotation2;
    const rotationNumber3 = req.query.rotation3;

    function alpha(D, rotation) {
        const angle = (D / 340) * 24
        return beaconsAngles.push((rotation * angleOffset) + angle);
    }

    alpha(D1, rotationNumber1);
    alpha(D2, rotationNumber2);
    alpha(D3, rotationNumber3);

    console.log("list of angles: " + beaconsAngles)

    // 5)
    thetaAB = beaconsAngles[1] - beaconsAngles[0];
    console.log("thetaAB: " + thetaAB)
    thetaBC = beaconsAngles[2] - beaconsAngles[1];
    console.log("thetaBC: " + thetaBC)
    thetaAC = 360 - thetaAB - thetaBC
    console.log("thetaAC: " + thetaAC)
    beaconsAngles = []

    // 6)
    let AB = Math.sqrt((coordB.x - coordA.x) ** 2 + (coordB.y - coordA.y) ** 2);
    let BC = Math.sqrt((coordC.x - coordB.x) ** 2 + (coordC.y - coordB.y) ** 2);
    let AC = Math.sqrt((coordC.x - coordA.x) ** 2 + (coordC.y - coordA.y) ** 2);
    console.log("AC: " + AC);
    hAB = (AB / 2) * (1 / Math.tan(thetaAB / 2));
    hBC = (BC / 2) * (1 / Math.tan(thetaBC / 2));
    hAC = (AC / 2) * (1 / Math.tan(thetaAC / 2));
    console.log("hAB: " + hAB);
    console.log("hBC: " + hBC);
    console.log("hAC: " + hAC);

    // Get point for circle
    let coordArcAB = { x: coordB.x + hAB, y: coordB.y - AB / 2 };
    let coordArcBC = { x: coordB.x + BC / 2, y: coordB.y - hBC };
    console.log("coordArcAB X: " + coordArcAB.x)
    console.log("coordArcAB Y: " + coordArcAB.y)

    console.log("coordArcBC X: " + coordArcBC.x)
    console.log("coordArcBC Y: " + coordArcBC.y)



    function findPerpendicularPoint(distance) {
        const vectorAC = { x: coordC.x - coordA.x, y: coordC.y - coordA.y };

        // Calculate the length of vector AC
        const lengthAC = Math.sqrt(vectorAC.x ** 2 + vectorAC.y ** 2);
        
        // Normalize the vector AC to get the unit vector
        const unitVectorAC = { x: vectorAC.x / lengthAC, y: vectorAC.y / lengthAC };
        
        // Calculate the perpendicular vector to AC
        const perpendicularVector = { x: -unitVectorAC.y, y: unitVectorAC.x };
        
        // Calculate the midpoint of AC
        const midpointX = (coordA.x + coordC.x) / 2;
        const midpointY = (coordA.y + coordC.y) / 2;
        
        // Calculate the coordinates where the perpendicular line ends
        const perpendicularX = midpointX + (perpendicularVector.x * distance);
        const perpendicularY = midpointY + (perpendicularVector.y * distance);

        return { x: perpendicularX, y: perpendicularY };
    }

    let AC_Coord = findPerpendicularPoint(hAC)
    let coordArcAC = { x: AC_Coord.x, y: AC_Coord.y };
    console.log("coordArcAC X: " + coordArcAC.x)
    console.log("coordArcAC Y: " + coordArcAC.y)

    // 7) 
    function circleIntersection(p1, p2, p3, q1, q2, q3) {
        const circle1 = circleFromPoints(p1, p2, p3);
        const circle2 = circleFromPoints(q1, q2, q3);

        const d = Math.sqrt((circle2.center.x - circle1.center.x) ** 2 + (circle2.center.y - circle1.center.y) ** 2);

        // Check if the circles are separate or identical
        if (d > circle1.radius + circle2.radius || d < Math.abs(circle1.radius - circle2.radius)) {
            return []; // No intersection
        }

        // Find the intersection points
        const a = (circle1.radius ** 2 - circle2.radius ** 2 + d ** 2) / (2 * d);
        const h = Math.sqrt(circle1.radius ** 2 - a ** 2);

        const intersectionX1 = circle1.center.x + (a * (circle2.center.x - circle1.center.x)) / d;
        const intersectionY1 = circle1.center.y + (a * (circle2.center.y - circle1.center.y)) / d;

        const intersectionX2 = intersectionX1 + (h * (circle2.center.y - circle1.center.y)) / d;
        const intersectionY2 = intersectionY1 - (h * (circle2.center.x - circle1.center.x)) / d;

        const intersectionX3 = intersectionX1 - (h * (circle2.center.y - circle1.center.y)) / d;
        const intersectionY3 = intersectionY1 + (h * (circle2.center.x - circle1.center.x)) / d;

        return [
            { x: intersectionX2, y: intersectionY2 },
            { x: intersectionX3, y: intersectionY3 },
        ];
    }
  
    // Helper function to calculate circle from 3 points
    function circleFromPoints(p1, p2, p3) {
        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        const x3 = p3.x;
        const y3 = p3.y;

        const A = x2 - x1;
        const B = y2 - y1;
        const C = x3 - x1;
        const D = y3 - y1;

        const E = A * (x1 + x2) + B * (y1 + y2);
        const F = C * (x1 + x3) + D * (y1 + y3);

        const G = 2 * (A * (y3 - y2) - B * (x3 - x2));

        const centerX = (D * E - B * F) / G;
        const centerY = (A * F - C * E) / G;

        const radius = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);

        return { center: { x: centerX, y: centerY }, radius: radius };
    }


    const intersections = circleIntersection(coordA, coordB, coordArcAB, coordB, coordC, coordArcBC);
    const confirmation = circleIntersection(coordB, coordC, coordArcBC, coordA, coordC, coordArcAC);
    console.log(intersections)
    console.log(confirmation)

    res.send('Beacon reading received');
});


app.get('/*', (req,res) => {
    res.sendFile(path.resolve(__dirname, './eee-bug-app/build', 'index.html'));
})


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});