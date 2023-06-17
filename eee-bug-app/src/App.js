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

function MazeComponent() {

  const canvasWidth = 450;
  const canvasHeight = 300;
  
  const [coordData] = useData();
  // console.log(coordData)
  const canvasRef = useCanvas(coordData, canvasWidth, canvasHeight);

  return (
    <main className="App-main" >
      <button onClick={deleteData}>Delete Data</button>
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


