import React, { Component, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import "./styles.css";

const HEIGHT = 15,
  WIDTH = 15,
  RECT_SIZE = Math.min(window.innerHeight, window.innerWidth) / Math.max(HEIGHT, WIDTH);

const _range = (n) => [...Array(n).keys()];

function useData(){
  const [maze, updateMaze] = useState([[]]);
  React.useEffect(() => {
  fetch("http://localhost:3001/mazeQuery/")
    .then((res) => res.json())
    .then((data) => alert(JSON.stringify(data)))
    .catch((err) => alert(err));
}, []);

  return maze;
}

function MazeComponent() {
  const maze = useData();
  let data = JSON.stringify(maze)
  console.log(data)

  // Rest of the component's code

  return <div>{JSON.stringify(maze)}</div>;
}




const _generate = (height, width) => {
  
  // React.useEffect(() => {
  //   fetch("http://localhost:3001/mazeQuery/")
  //     .then((res) => res.json())
  //     .then((data) => alert(JSON.stringify(data)))
  //     .catch((err) => alert(err));
  // }, []);

  const maze = {};

  _range(height).forEach((y) => {
    _range(width).forEach((x) => {
      maze[`${x}-${y}`] = Math.random() < 0.3;
    });
  });

  return maze;
};

class Maze extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: HEIGHT,
      width: WIDTH,
      maze: _generate(HEIGHT, WIDTH)
    };

    this.handleClickGenerate = this.handleClickGenerate.bind(this);
  }

  handleClickGenerate(event) {
    this.setState({ maze: _generate(HEIGHT, WIDTH) });
  }

  render() {
    return (
      <div>
        <Stage width={WIDTH * RECT_SIZE} height={HEIGHT * RECT_SIZE}>
          <Layer>
            {_range(this.state.height).map((y) =>
              _range(this.state.width).map((x) => (
                <Rect
                  key={`${x}-${y}`}
                  x={x * RECT_SIZE}
                  y={y * RECT_SIZE}
                  width={RECT_SIZE}
                  height={RECT_SIZE}
                  fill={this.state.maze[`${x}-${y}`] ? "grey" : "white"}
                  stroke="black"
                  strokeWidth={1}
                />
              ))
            )}
          </Layer>
        </Stage>
        <input
          type="button"
          value="Regenerate"
          onClick={this.handleClickGenerate}
        />
      </div>
    );
  }
}

// export default App;
export default function App() {
  return <Maze />, <MazeComponent />;
}
