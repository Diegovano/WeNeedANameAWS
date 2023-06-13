import React, { useState } from "react";

function TriangulateButton() {
  const [isPressed, setIsPressed] = useState(0);

  const handleTriangulateClick = () => {
    fetch("http://54.82.44.87:3001/api/click")
      .then((res) => res.json())
      .then((data) => {
        setIsPressed(data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <button onClick={handleTriangulateClick}>Triangulate</button>
      <p>isPressed: {isPressed}</p>
    </div>
  );
}

export default TriangulateButton;