import React, { useEffect, useState } from "react";
import "./styles.css";
import { useCanvas } from "./Canvas";



function useData() {
 
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/mazeQuery/")
      .then((res) => res.json())
      .then((data) => {
        setCoordinates(data.map(item => ({ x: item.X_Coord, y: item.Y_Coord })));
      })
      .catch((err) => alert(err));
  }, []);
  const coordData = coordinates.length > 0 ? coordinates : [];
  return [ coordData ];
}


function MazeComponent() {
  const canvasWidth = window.innerWidth * 0.85;
  const canvasHeight = window.innerHeight * 0.85;
  
  const [coordData] = useData();
  // console.log(coordData)
  const canvasRef = useCanvas(coordData, canvasWidth, canvasHeight);

  return (
    <main className="App-main" >
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


