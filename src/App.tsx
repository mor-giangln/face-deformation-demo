import './App.css';
import FFD from './FFD';

function App() {

  return (
    <>
      <div className="App">
        <div id="instructions">
          HEARTVERSE Free Form Deformation<br />
        </div>
        <div id="instructions-2">
          - Increase radius to make more vertices take effect<br />
          - Click into control points to deform/ double click to detach control<br />
          "W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
          "X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
          "G" to reset model to it's initial state<br />
        </div>
        <FFD />
      </div></>
  );
}

export default App;
