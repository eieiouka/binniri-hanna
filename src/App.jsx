import { useState } from "react";
import "./App.css";
import PuzzleBoard from "./components/PuzzleBoard/PuzzleBoard";
import {
  playVoice,
  preloadAudio,
  startBgm,
  unlockAudio,
} from "./audio/audioMixer";

function App() {
  const [isStarted, setIsStarted] = useState(false);

  const startGame = async () => {
    setIsStarted(true);

    try {
      await unlockAudio();

      await startBgm("/sounds/bgm_loop.mp3");
      await playVoice("/sounds/hanna_start.mp3");

      preloadAudio([
        "/sounds/hanna10.mp3",
        "/sounds/hanna20.mp3",
        "/sounds/hanna30.mp3",
        "/sounds/hanna40.mp3",
        "/sounds/hanna50.mp3",
        "/sounds/hanna60.mp3",
        "/sounds/hanna70.mp3",
        "/sounds/hanna80.mp3",
        "/sounds/hanna90.mp3",
        "/sounds/hanna100.mp3",
        "/sounds/hanna110.mp3",
      ]).catch((error) => {
        console.log("音声プリロード失敗", error);
      });
    } catch (error) {
      console.log("音声の再生に失敗しました", error);
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
              <div className="start-message">
                <img
                  className="start-character-icon"
                  src="/images/sherry-icon.png"
                  alt="シェリー"
                />

                <p className="start-dialogue">
                  ハンナさんが魔女化する前に、助けてあげたいです！
                </p>
              </div>

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