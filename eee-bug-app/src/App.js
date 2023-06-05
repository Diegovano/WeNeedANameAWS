import React, { Component, useState, useRef } from "react";
import "./styles.css";
import { useCanvas } from "./Canvas";



function useData() {
  const [NID, setNID] = useState([]);
  const [X_Coord, setXCoord] = useState([]);
  const [Y_Coord, setYCoord] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  var myCoord = []


  React.useEffect(() => {
    fetch("http://localhost:3001/mazeQuery/")
      .then((res) => res.json())
      .then((data) => {
        setNID(data.map(item => item.NID));
        setXCoord(data.map(item => item.X_Coord));
        setYCoord(data.map(item => item.Y_Coord));
        setCoordinates(data.map(item => ({ x: item.X_Coord, y: item.Y_Coord })));
      })
      .catch((err) => alert(err));
  }, []);
  const coordData = coordinates.length > 0 ? coordinates : [];
  return [ NID, X_Coord, Y_Coord, coordData ];
}

function MazeComponent() {
  const [ NID, X_Coord, Y_Coord, coordData ] = useData();
  console.log(coordData)
  const [coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight] = useCanvas();



  const handleCanvasClick = (event) => {
    // on each click get current mouse location 
    const currentCoord = { x: event.clientX, y: event.clientY };
    // add the newest mouse location to an array in state 
    setCoordinates([...coordinates, currentCoord]);
  };

  const handleClearCanvas = () => {
    setCoordinates([]);
  };

  return (
    <main className="App-main" >
      {/* <canvas
        className="App-canvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick} />
      <div className="button" >
        <button onClick={handleClearCanvas} > CLEAR </button>
      </div> */}
      <div>
      {coordData.map((item, index) => (
        
        <div key={index}>
          <p>X_Coord: {item.x}</p>
          <p>Y_Coord: {item.y}</p>
        </div>
      ))}
    </div>
    </main>
  );
}


// export default App;
export default MazeComponent;




// const _generate = (height, width, x, y) => {
//   const maze = {};
//   _range(height).forEach((y) => {
//     _range(width).forEach((x) => {
//       maze[`${x}-${y}`] = Math.random() < 0.3;
//     });
//   });

//   return maze;
// };

// class Maze extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       height: HEIGHT,
//       width: WIDTH,
//       maze: _generate(HEIGHT, WIDTH)
//     };

//     this.handleClickGenerate = this.handleClickGenerate.bind(this);
//   }

//   handleClickGenerate(event) {
//     this.setState({ maze: _generate(HEIGHT, WIDTH) });
//   }

//   render() {
//     return (
//       <div>
//         <Stage width={WIDTH * RECT_SIZE} height={HEIGHT * RECT_SIZE}>
//           <Layer>
//             {_range(this.state.height).map((y) =>
//               _range(this.state.width).map((x) => (
//                 <Rect
//                   key={`${x}-${y}`}
//                   x={x * RECT_SIZE}
//                   y={y * RECT_SIZE}
//                   width={RECT_SIZE}
//                   height={RECT_SIZE}
//                   fill={this.state.maze[`${x}-${y}`] ? "grey" : "white"}
//                   stroke="black"
//                   strokeWidth={1}
//                 />
//               ))
//             )}
//           </Layer>
//         </Stage>
//         <input
//           type="button"
//           value="Regenerate"
//           onClick={this.handleClickGenerate}
//         />
//       </div>
//     );
//   }
// }
