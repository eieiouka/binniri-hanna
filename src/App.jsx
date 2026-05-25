import "./App.css";
import PuzzleBoard from "./components/PuzzleBoard/PuzzleBoard";

function App() {
  return (
    <div className="app">
      <div className="game-title">
        <span className="title-green">
          遠野ハンナ
        </span>

        <span className="title-rest">
          を砂時計から救出しよう！
        </span>
      </div>

      <main className="app-main">
        <PuzzleBoard />
      </main>
    </div>
  );
}

export default App;