import { useEffect, useRef, useState } from "react";
import "./PuzzleBoard.css";
import initialPieces from "../../data/initialPieces";
import clearMacro from "../../data/clearMacro";
import {
  fadeOutBgm,
  playVoice,
  startBgm,
} from "../../audio/audioMixer";

const CELL_SIZE = 80;
const COLS = 4;
const ROWS = 5;
const GAME_OVER_MOVE = 117;
const HANNA_IMAGE_STEP = 20;
const BGM_SRC = "/sounds/bgm_loop.mp3";
const MACRO_INTERVAL_MS = 35;
const MACRO_LONG_PRESS_MS = 10000;

export default function PuzzleBoard() {
  const [game, setGame] = useState({
    pieces: initialPieces,
    isClear: false,
    isGameOver: false,
    moveCount: 0,
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isMacroRunning, setIsMacroRunning] =
    useState(false);
  const dragRef = useRef(null);
  const macroTimerRef = useRef(null);
  const macroIndexRef = useRef(0);
  const longPressStartAtRef = useRef(null);
  const lastVoiceMoveRef = useRef(0);
  const hasPlayedEndingRef = useRef(false);
  const hasPlayedGameOverRef = useRef(false);

  useEffect(() => {
    initialPieces.forEach((piece) => {
      if (!piece.images) {
        return;
      }

      piece.images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      clearMacroTimer();
    };
  }, []);

  useEffect(() => {
    if (
      game.moveCount > 0 &&
      game.moveCount % 10 === 0 &&
      game.moveCount <= 110 &&
      lastVoiceMoveRef.current !== game.moveCount
    ) {
      lastVoiceMoveRef.current = game.moveCount;

      playVoice(
        `/sounds/hanna${game.moveCount}.mp3`
      ).catch(() => {});
    }
  }, [game.moveCount]);

  useEffect(() => {
    if (!game.isClear) {
      return;
    }

    if (hasPlayedEndingRef.current) {
      return;
    }

    hasPlayedEndingRef.current = true;

    clearMacroTimer();

    fadeOutBgm(2.0);

    playVoice("/sounds/ending.mp3")
      .catch(() => {});
  }, [game.isClear]);

  useEffect(() => {
    if (!game.isGameOver) {
      return;
    }

    if (hasPlayedGameOverRef.current) {
      return;
    }

    hasPlayedGameOverRef.current = true;

    clearMacroTimer();

    fadeOutBgm(2.0);

    playVoice("/sounds/bad_over.mp3")
      .catch(() => {});
  }, [game.isGameOver]);

  const checkClear = (pieces) => {
    const hanna = pieces.find((p) => p.id === "hanna");
    return hanna && hanna.x === 1 && hanna.y >= 3;
  };

  const canMove = (targetPiece, dx, dy, pieces) => {
    const nextX = targetPiece.x + dx;
    const nextY = targetPiece.y + dy;

    const isHannaEscaping =
      targetPiece.id === "hanna" &&
      dx === 0 &&
      dy === 1 &&
      targetPiece.x === 1 &&
      targetPiece.y === 3 &&
      nextX === 1 &&
      nextY === 4;

    const isInsideBoard =
      nextX >= 0 &&
      nextY >= 0 &&
      nextX + targetPiece.w <= COLS &&
      nextY + targetPiece.h <= ROWS;

    if (!isInsideBoard && !isHannaEscaping) {
      return false;
    }

    return !pieces.some((other) => {
      if (other.id === targetPiece.id) {
        return false;
      }

      return (
        nextX < other.x + other.w &&
        nextX + targetPiece.w > other.x &&
        nextY < other.y + other.h &&
        nextY + targetPiece.h > other.y
      );
    });
  };

  const findMacroTarget = (step, pieces) => {
    if (step.id) {
      return pieces.find((piece) => piece.id === step.id);
    }

    return pieces.find(
      (piece) =>
        piece.type === step.type &&
        piece.x === step.x &&
        piece.y === step.y
    );
  };

  const movePieceInState = (prev, pieceId, dx, dy) => {
    if (prev.isClear || prev.isGameOver) {
      return prev;
    }

    const target = prev.pieces.find((p) => p.id === pieceId);

    if (!target) {
      return prev;
    }

    if (!canMove(target, dx, dy, prev.pieces)) {
      return prev;
    }

    const nextPieces = prev.pieces.map((p) =>
      p.id === pieceId
        ? {
            ...p,
            x: p.x + dx,
            y: p.y + dy,
          }
        : p
    );

    const nextMoveCount = prev.moveCount + 1;

    const isClear =
      nextMoveCount < GAME_OVER_MOVE &&
      checkClear(nextPieces);

    const isGameOver =
      nextMoveCount >= GAME_OVER_MOVE;

    return {
      pieces: nextPieces,
      moveCount: nextMoveCount,
      isClear,
      isGameOver,
    };
  };

  const movePiece = (pieceId, dx, dy) => {
    setGame((prev) =>
      movePieceInState(prev, pieceId, dx, dy)
    );
  };

  const clearMacroTimer = () => {
    if (!macroTimerRef.current) {
      return;
    }

    clearInterval(macroTimerRef.current);
    macroTimerRef.current = null;
  };

  const resetGame = () => {
    clearMacroTimer();

    setGame({
      pieces: initialPieces,
      isClear: false,
      isGameOver: false,
      moveCount: 0,
    });

    setSelectedId(null);
    dragRef.current = null;
    macroIndexRef.current = 0;
    lastVoiceMoveRef.current = 0;
    hasPlayedEndingRef.current = false;
    hasPlayedGameOverRef.current = false;

    startBgm(BGM_SRC)
      .then(() => playVoice("/sounds/hanna_start.mp3"))
      .catch(() => {});
  };

  const runClearMacro = () => {
    setIsMacroRunning(true);
    clearMacroTimer();

    macroIndexRef.current = 0;

    setGame({
      pieces: initialPieces,
      isClear: false,
      isGameOver: false,
      moveCount: 0,
    });

    setSelectedId(null);
    dragRef.current = null;
    lastVoiceMoveRef.current = 0;
    hasPlayedEndingRef.current = false;
    hasPlayedGameOverRef.current = false;

    startBgm(BGM_SRC)
      .then(() => playVoice("/sounds/hanna_start.mp3"))
      .catch(() => {});

    setTimeout(() => {
      macroTimerRef.current = setInterval(() => {
        const stepIndex = macroIndexRef.current;
        const step = clearMacro[stepIndex];

        if (!step) {
          clearMacroTimer();
          setIsMacroRunning(false);
          setSelectedId(null);
          return;
        }

        setGame((prev) => {
          const target = findMacroTarget(step, prev.pieces);

          if (!target) {
            console.log(
              "マクロ対象が見つかりません",
              stepIndex + 1,
              step
            );

            clearMacroTimer();
            return prev;
          }

          setSelectedId(target.id);

          const nextState = movePieceInState(
            prev,
            target.id,
            step.dx,
            step.dy
          );

          if (nextState === prev) {
            console.log(
              "マクロ移動に失敗しました",
              stepIndex + 1,
              step,
              "target",
              target
            );

            clearMacroTimer();
            return prev;
          }

          return nextState;
        });

        macroIndexRef.current += 1;
      }, MACRO_INTERVAL_MS);
    }, 100);
  };

  const startResetLongPress = (e) => {
    e.preventDefault();

    longPressStartAtRef.current = Date.now();
  };

  const finishResetPress = (e) => {
    e.preventDefault();

    if (!longPressStartAtRef.current) {
      resetGame();
      return;
    }

    const pressTime =
      Date.now() - longPressStartAtRef.current;

    longPressStartAtRef.current = null;

    console.log("押していた時間", pressTime);

    if (pressTime >= MACRO_LONG_PRESS_MS) {
      console.log("マクロ開始");
      runClearMacro();
      return;
    }

    resetGame();
  };

  const cancelResetLongPress = () => {
    longPressStartAtRef.current = null;
  };

  const handlePointerDown = (e, piece) => {
    if (
      game.isClear ||
      game.isGameOver ||
      isMacroRunning
    ) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(piece.id);

    dragRef.current = {
      pointerId: e.pointerId,
      pieceId: piece.id,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;

    if (!drag || drag.moved || game.isClear || game.isGameOver) {
      return;
    }

    if (drag.pointerId !== e.pointerId) {
      return;
    }

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 20 && absY < 20) {
      return;
    }

    drag.moved = true;

    if (absX > absY) {
      movePiece(drag.pieceId, dx > 0 ? 1 : -1, 0);
    } else {
      movePiece(drag.pieceId, 0, dy > 0 ? 1 : -1);
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const getPieceImageClassName = (piece) => {
    if (piece.type === "main") {
      return "piece-image main-image";
    }

    if (piece.type === "vertical") {
      return "piece-image vertical-image";
    }

    if (piece.type === "horizontal") {
      return "piece-image horizontal-image";
    }

    return "piece-image";
  };

  const getHannaImage = (piece, moveCount) => {
    if (!piece.images || piece.images.length === 0) {
      return piece.image;
    }

    const imageIndex = Math.min(
      piece.images.length - 1,
      Math.floor(moveCount / HANNA_IMAGE_STEP)
    );

    return piece.images[imageIndex];
  };

  return (
    <section className="puzzle-area">
      <div className="title-toolbar">
        <p className="move-count">
          手数：{game.moveCount}
        </p>

        <button
          className="reset-button"
          onMouseDown={startResetLongPress}
          onMouseUp={finishResetPress}
          onMouseLeave={cancelResetLongPress}
          onTouchStart={startResetLongPress}
          onTouchEnd={finishResetPress}
          onTouchCancel={cancelResetLongPress}
        >
          リセット
        </button>
      </div>

      <div className="puzzle-frame">
        <div
          className={`puzzle-board ${
            game.isClear ? "clear" : ""
          } ${game.isGameOver ? "game-over" : ""}`}
        >
          {game.pieces.map((piece) => {
            const imageSrc =
              piece.id === "hanna"
                ? getHannaImage(piece, game.moveCount)
                : piece.image;

            const shouldHannaGlow =
              piece.id === "hanna" &&
              game.moveCount > 0 &&
              game.moveCount % HANNA_IMAGE_STEP === 0;

            return (
              <button
                key={piece.id}
                className={`piece ${piece.type} ${
                  selectedId === piece.id ? "selected" : ""
                } ${
                  game.isClear && piece.id === "hanna"
                    ? "escape"
                    : ""
                } ${
                  shouldHannaGlow ? "hanna-red-glow" : ""
                }`}
                style={{
                  left: piece.x * CELL_SIZE,
                  top: piece.y * CELL_SIZE,
                  width: piece.w * CELL_SIZE,
                  height: piece.h * CELL_SIZE,
                }}
                onPointerDown={(e) =>
                  handlePointerDown(e, piece)
                }
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {imageSrc ? (
                  <img
                    key={
                      piece.id === "hanna"
                        ? Math.floor(
                            game.moveCount / HANNA_IMAGE_STEP
                          )
                        : piece.id
                    }
                    className={getPieceImageClassName(piece)}
                    src={imageSrc}
                    alt=""
                    draggable="false"
                  />
                ) : (
                  piece.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      {game.isClear && (
        <div className="clear-modal">
          <div className="clear-box">
            <div className="gameover-message">
              <img
                className="gameover-character-icon"
                src="/images/sherry-icon.png"
                alt="シェリー"
              />

              <p className="gameover-dialogue">
                置き去りが嫌だって言ったので、一緒に逝きましょう！
              </p>
            </div>

            <p className="clear-moves">
              {game.moveCount}手でクリア
            </p>

            <button onClick={resetGame}>
              もう一度
            </button>
          </div>
        </div>
      )}

      {game.isGameOver && (
        <div className="clear-modal">
          <div className="clear-box">
            <div className="gameover-message">
              <img
                className="gameover-character-icon"
                src="/images/sherry-icon.png"
                alt="シェリー"
              />

              <p className="gameover-dialogue">
                ハンナさん…。手遅れみたいですね…。（117手到達）
              </p>
            </div>

            <button onClick={resetGame}>
              もう一度
            </button>
          </div>
        </div>
      )}
    </section>
  );
}