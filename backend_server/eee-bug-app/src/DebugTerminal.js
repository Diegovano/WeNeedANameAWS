import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import "./styles.css";

export function DebugTerminal() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Change to relevant endpoint --> for now dev purpose 
    fetch(`http://54.82.44.87:3001/Display`)
      .then(response => response.json())
      .then(newData => {
        setData(prevData => [...prevData, ...newData]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  };

  return (
    <div className="window">
      <h1 className="title">&#9673; Real-Time</h1>
      <div className="content">
        <InfiniteScroll
          dataLength={data.length}
          next={fetchData}
          // Set to true to loop infinetly through data array
          hasMore={false}
          loader={<h4>Loading...</h4>}
        >
          {data.map((item, index) => (
            <div key={index} className="item">
              <p className="item-title">Steps: {item.Steps} - Heading: {item.Heading}</p>
              <p className="item-description">Position: X: {item.X_Coord}, Y: {item.Y_Coord}</p>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );

}


