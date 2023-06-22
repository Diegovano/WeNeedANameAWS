import React, { useEffect, useState } from "react";
import "./styles.css";
import { useCanvas } from "./BeaconCanvas";
import { DebugTerminal } from "./DebugTerminal"
import { useEstimateCanvas } from "./EstimateCanvas";

function useEstimateData() {
  const [estimateCoordinates, setEstimateCoordinates] = useState([]);

  const fetchData = () => {
    fetch("http://54.82.44.87:3001/estimateMazeQuery")
      .then((res) => res.json())
      .then((data) => {
        setEstimateCoordinates(data.map(item => ({ x: item.X_Coord, y: item.Y_Coord })));
      })
      .catch((err) => alert("ESTIMATE CANVAS ERROR"));
  };


  useEffect(() => {
    fetchData();
    // Set interval to fetch data every 3000 milliseconds
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  const estimateData = estimateCoordinates.length > 0 ? estimateCoordinates : [];
  return [estimateData];
}

function useData() {
  const [coordinates, setCoordinates] = useState([]);

  const fetchData = () => {
    fetch("http://54.82.44.87:3001/mazeQuery")
      .then((res) => res.json())
      .then((data) => {
        setCoordinates(data.map(item => ({ x: item.X_Coord, y: item.Y_Coord })));
      })
      .catch((err) => alert(err));
  };


  useEffect(() => {
    fetchData();
    // Set interval to fetch data every 3000 milliseconds
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  const coordData = coordinates.length > 0 ? coordinates : [];
  return [coordData];
}

function deleteData() {
  return fetch("http://54.82.44.87:3001/api/truncate");
}

// Function to send a request to /api/triangulate with value 1
function sendTriangulateRequest() {
  fetch("http://54.82.44.87:3001/api/triangulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ value: 1 })
  })
    .then(_response => {
      console.log("Triangulate request sent.");
    })
    .catch(error => {
      console.error("Error sending triangulate request:", error);
    });
}

// Function to send a request to reset the value to 0
function sendResetRequest() {
  fetch("http://54.82.44.87:3001/api/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ value: 0 })
  })
    .then(_response => {
      console.log("Reset request sent.");
    })
    .catch(error => {
      console.error("Error sending reset request:", error);
    });
}

// Function to handle button click
function handleClick() {
  sendTriangulateRequest();
  setTimeout(() => {
    sendResetRequest();
  }, 3000);
  return console.log('Clicked!')
}

function MazeComponent() {

  const canvasWidth = 240;
  const canvasHeight = 360;

  const [blueState, setBlueState] = useState(false);
  const [redState, setRedState] = useState(false);
  const [yellowState, setYellowState] = useState(false);

  useEffect(() => {
    fetch("http://54.82.44.87:3001/api/receiveBlue")
      .then((res) => res.json())
      .then((data) => {
        const blueBeacon = data.blueBeacon;
        setBlueState(blueBeacon);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    fetch("http://54.82.44.87:3001/api/receiveRed")
      .then((res) => res.json())
      .then((data) => {
        const redBeacon = data.redBeacon;
        setRedState(redBeacon);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    fetch("http://54.82.44.87:3001/api/receiveYellow")
      .then((res) => res.json())
      .then((data) => {
        const yellowBeacon = data.yellowBeacon;
        setYellowState(yellowBeacon);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, []);


  const [coordData] = useData();
  const [estimateData] = useEstimateData();
  const canvasRef = useCanvas(coordData, canvasWidth, canvasHeight);
  const canvasRefEstimate = useEstimateCanvas(estimateData, canvasWidth, canvasHeight);

  const [activeCanvas, setActiveCanvas] = useState("canvas1");

  const handleToggleCanvas = () => {
    setActiveCanvas(activeCanvas === "canvas1" ? "canvas2" : "canvas1");
  };


  return (
    <main className="App-main">
      <div id="header">
        <center>
          <button onClick={deleteData}>Delete Data</button>
          <button onClick={handleClick}>Triangulate</button>
          <button onClick={handleToggleCanvas}>Toggle Canvas</button>
        </center>
      </div>
      <div id="beacons">
        <center>
          <p>
            Blue Beacon: <span className={blueState ? "dot blue" : "dot black"}></span> Red Beacon: <span className={redState ? "dot red" : "dot black"}></span> Yellow Beacon: <span className={yellowState ? "dot yellow" : "dot black"}></span>
          </p>
        </center>
      </div>
      <div id="container">
        <div id="debugTerminal">
          <DebugTerminal />
        </div>
        <div id="canvas">
          {activeCanvas === "canvas1" ? (
            <canvas
              className="App-canvas"
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
            />
          ) : (
            <canvas
              className="App-canvas"
              ref={canvasRefEstimate}
              width={canvasWidth}
              height={canvasHeight}
            />
          )}
        </div>
        <div id="clear"></div>
      </div>
    </main>

  );
}

export default MazeComponent;


