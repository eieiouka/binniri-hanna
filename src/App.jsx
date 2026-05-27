import { useRef, useState } from "react";
import "./App.css";
import PuzzleBoard from "./components/PuzzleBoard/PuzzleBoard";

function App() {
  const audioRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);

  const startGame = async () => {
    setIsStarted(true);

    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/bgm_loop.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }

    try {
      await audioRef.current.play();
    } catch (error) {
      console.log("BGMの再生に失敗しました", error);
    }
  };

  return (
    <div className="app">
      <div className={`game-stage ${!isStarted ? "before-start" : ""}`}>
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

        {!isStarted && (
          <div className="start-overlay">
            <div className="start-popup">
              <p className="start-title">
                遠野ハンナを救出する
              </p>

              <button
                className="start-button"
                onClick={startGame}
              >
                ゲーム開始
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;