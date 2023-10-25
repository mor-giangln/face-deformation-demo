import './App.css';
import LoadModel from './LoadModel';
import CubeDemo from './CubeDemo';

function App() {

  return (
    <div className="App">
      <div id="instructions">
        HEARTVERSE FFD Demo<br />
        "W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
        "X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
      </div>
      <CubeDemo/>
    </div>
  );
}

export default App;
