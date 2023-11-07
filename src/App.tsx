import './App.css';
import FFD from './FFD';

function App() {

  return (
    <>
      <div className="App">
        <div id="instructions">
          HEARTVERSE FFD Demo<br />
          Double click into control points to deform<br />
          "W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
          "X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
        </div>
        <FFD />
      </div></>
  );
}

export default App;
