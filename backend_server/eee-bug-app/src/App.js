import React, { useEffect, useState } from "react";
import "./styles.css";
import { useCanvas } from "./Canvas";

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

  const canvasWidth = 360;
  const canvasHeight = 240;

  const [coordData] = useData();
  // console.log(coordData)
  const canvasRef = useCanvas(coordData, canvasWidth, canvasHeight);

  return (
    <main className="App-main" >
      <button onClick={deleteData}>Delete Data</button>
      <button onClick={handleClick}>Triangulate</button>
      <canvas
        className="App-canvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
    </main>
  );
}

export default MazeComponent;


