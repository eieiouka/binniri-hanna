import "./App.css";
import PuzzleBoard from "./components/PuzzleBoard/PuzzleBoard";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>箱入り娘パズル</h1>
        <p className="app-desc">
          駒を動かして、娘を出口まで導こう
        </p>
      </header>

      <main className="app-main">
        <PuzzleBoard />
      </main>
    </div>
  );
}

export default App;