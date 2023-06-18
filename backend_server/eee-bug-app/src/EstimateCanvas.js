import React, { useEffect, useRef, useState } from 'react';

function draw(ctx, coordinates) {
  console.log("attempting to draw");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = 'purple';

  let currentX = 0;
  let currentY = 0;
  let currentHeading = 0;
  
  for (const coordinate of coordinates) {
    const { steps, heading } = coordinate;

    if (heading !== currentHeading) {
      ctx.beginPath();
      ctx.arc(currentX, currentY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    const deltaY = Math.sin((currentHeading + heading)) * steps;
    const deltaX = Math.cos((currentHeading + heading)) * steps;
    
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;
    
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
    
    currentX = newX;
    currentY = newY;
    currentHeading += heading;
  }
}

function useCanvas(coordData, canvasWidth, canvasHeight) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasObj = canvasRef.current;
    if (canvasObj) {
      const ctx = canvasObj.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        draw(ctx, coordData);
      } else {
        console.log('getContext() returned null');
      }
    } else {
      console.log('canvasRef.current is null');
    }
  }, [coordData]);

  return canvasRef;
}

function App() {
  const canvasWidth = 240;
  const canvasHeight = 360;
  const [coordData, setCoordData] = useState([]);

  const canvasRef = useCanvas(coordData, canvasWidth, canvasHeight);

  useEffect(() => {
    // Fetch data for the second canvas from the endpoint
    fetch('http://api.example.com/second-canvas-data')
      .then((res) => res.json())
      .then((data) => {
        setCoordData(data);
      })
      .catch((err) => alert(err));
  }, []);

  return (
    <div className="App">
      <h1>Second Canvas Example</h1>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
    </div>
  );
}

export default App;
