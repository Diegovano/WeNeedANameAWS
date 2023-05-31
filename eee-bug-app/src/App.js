// // client/src/App.js
// import React, { useState } from "react";
// import TableComp from './TableComp';
// //App is a React Function Component
// //Read about it, and React Components in general, here:
// //https://www.w3schools.com/REACT/react_components.asp
// function App() {

//   const [tableData33, updateTable33] = useState([[]]);
//   //Get initial input from the server
//   //Whenever App is invoked
//   //a 'side effect' is that
//   //the initial table data is fetched from the server
//   //useEffect is a hook used to associate such 'side effects'
//   //with components
//   React.useEffect(() => {
//     ///See CORS
//     fetch("http://localhost:3001/tableData33/")
//       .then((res) => res.json())
//       .then((data) => updateTable33(data.tableData33))
//       .catch((err) => alert(err)
//       );
//   }, [updateTable33]);

//   //handleClick is our event handler for the button click
//   const handleClick = (updateMethod) => {
//     fetch("http://localhost:3001/tableData33/")
//       .then((res) => res.json())
//       .then((data) => updateMethod(data.tableData33))
//       .catch((err) => alert(err)
//       // .finally(alert('test'))
//       );
//   };
//   return (
//     <div className="App">
//       <TableComp td={tableData33} />
//       <button onClick={() => handleClick(updateTable33)}>Randomize
//         ages</button>
//     </div>
//   );
// }
// export default App;
// client/src/App.js
import React, {useState} from "react";
import TableComp from './TableComp';
//App is a React Function Component
//Read about it, and React Components in general, here:
//https://www.w3schools.com/REACT/react_components.asp
function App() {
 const [tableData33, updateTable33] = useState(
 [
 ["Ed", 19, "Male"],
 ["Mia", 19, "Female"],
 ["Max", 25, "Male"]
 ]); //useState hooks tableData33 to the state
  //It also provides a callback updateTable33
 //which must be invoked to transmit changes to the state
 ///Randomize ages between 15 and 50
 function randomize(){
  return (
  [
  [tableData33[0][0],15 + Math.floor(Math.random() * 35),tableData33[0][2]],
  [tableData33[1][0],15 + Math.floor(Math.random() * 35),tableData33[1][2]],
  [tableData33[2][0],15 + Math.floor(Math.random() * 35),tableData33[2][2]]
  ]
  );
  }
  return (
  <div className="App">
  <TableComp td = {tableData33}/>
  <button onClick={() => updateTable33(randomize())}>Randomize ages</button>
  </div>
  );
 }
 export default App;