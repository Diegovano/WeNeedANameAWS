
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
// Required modules
const express = require('express');
const app = express();

// Initialize variables
let beaconsFound = 0;
let angleOffset = 0;
let theta1 = 0;
let theta2, theta3, thetaAB, thetaBC;
let hAB, hBC;

// Route to handle beacon distance readings
app.get('/beacon/:distance', (req, res) => {
  // Get distance to beacon in pixels from camera
  const D = parseFloat(req.params.distance);

  // Calculate angle of beacon with respect to center of quadrant
  const alpha = (D / 340) * 24;
  theta1 = angleOffset + alpha;

  // Repeat steps 1, 2, 3 until 3 beacons are found
  if (beaconsFound < 3) {
    beaconsFound++;

    // Keep count of the quadrant in which the reading is made
    // Increment angleOffset accordingly
    // ...

    // Once 3 beacons are found, calculate theta2 and theta3
    if (beaconsFound === 2) {
      theta2 = theta1;
      // Calculate thetaAB
      thetaAB = theta2 - theta1;
    } else if (beaconsFound === 3) {
      theta3 = theta1;
      // Calculate thetaBC
      thetaBC = theta3 - theta2;
    }

    // Get distance h_AB and h_BC
    if (beaconsFound === 3) {
      hAB = (AB / 2) * (1 / Math.tan(thetaAB / 2));
      hBC = (BC / 2) * (1 / Math.tan(thetaBC / 2));

      // Draw 2 circles and get their intersection
      // ...

      // Return intersection coordinates as the position of the rover
      // ...
      res.send('Position calculated');
    }
  }

  res.send('Beacon reading received');
});


