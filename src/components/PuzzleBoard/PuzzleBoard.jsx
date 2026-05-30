import { useRef, useState } from "react";
import "./PuzzleBoard.css";
import initialPieces from "../../data/initialPieces";

const CELL_SIZE = 80;
const COLS = 4;
const ROWS = 5;
const GAME_OVER_MOVE = 120;
const HANNA_IMAGE_STEP = 20;

export default function PuzzleBoard() {
  const [game, setGame] = useState({
    pieces: initialPieces,
    isClear: false,
    isGameOver: false,
    moveCount: 0,
  });

  const [selectedId, setSelectedId] = useState(null);
  const dragRef = useRef(null);

  const checkClear = (pieces) => {
    const hanna = pieces.find((p) => p.id === "hanna");
    return hanna && hanna.x === 1 && hanna.y >= 3;
  };

  const canMove = (targetPiece, dx, dy, pieces) => {
    const nextX = targetPiece.x + dx;
    const nextY = targetPiece.y + dy;

    const isHannaEscaping =
      targetPiece.id === "hanna" &&
      nextX === 1 &&
      nextY + targetPiece.h <= 6;

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

  const movePiece = (pieceId, dx, dy) => {
    setGame((prev) => {
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
      const isClear = checkClear(nextPieces);
      const isGameOver =
        !isClear && nextMoveCount >= GAME_OVER_MOVE;

      return {
        pieces: nextPieces,
        moveCount: nextMoveCount,
        isClear,
        isGameOver,
      };
    });
  };

  const handlePointerDown = (e, piece) => {
    if (game.isClear || game.isGameOver) {
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

  const resetGame = () => {
    setGame({
      pieces: initialPieces,
      isClear: false,
      isGameOver: false,
      moveCount: 0,
    });

    setSelectedId(null);
    dragRef.current = null;
  };

  return (
    <section className="puzzle-area">
      <div className="title-toolbar">
        <p className="move-count">
          手数：{game.moveCount}
        </p>

        <button
          className="reset-button"
          onClick={resetGame}
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

            return (
              <button
                key={piece.id}
                className={`piece ${piece.type} ${
                  selectedId === piece.id ? "selected" : ""
                } ${
                  game.isClear && piece.id === "hanna"
                    ? "escape"
                    : ""
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
                    className={`${getPieceImageClassName(piece)} ${
                      piece.id === "hanna" &&
                      game.moveCount > 0 &&
                      game.moveCount % HANNA_IMAGE_STEP === 0
                        ? "image-change-effect"
                        : ""
                    }`}
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
            <p>クリア！</p>

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
            <p>ゲームオーバー</p>

            <p className="clear-moves">
              120手に到達しました
            </p>

            <button onClick={resetGame}>
              もう一度
            </button>
          </div>
        </div>
      )}
    </section>
  );
}