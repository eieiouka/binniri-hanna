import { useState } from "react";
import "./PuzzleBoard.css";
import initialPieces from "../../data/initialPieces";

const CELL_SIZE = 80;

export default function PuzzleBoard() {
  const [pieces, setPieces] = useState(initialPieces);
  const [selectedId, setSelectedId] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isClear, setIsClear] = useState(false);

  const checkClear = (nextPieces) => {
    const musume = nextPieces.find((p) => p.id === "musume");
    return musume && musume.x === 1 && musume.y >= 3;
  };

  const canMove = (targetPiece, dx, dy, currentPieces) => {
    const nextX = targetPiece.x + dx;
    const nextY = targetPiece.y + dy;

    return !currentPieces.some((other) => {
      if (other.id === targetPiece.id) return false;

      return (
        nextX < other.x + other.w &&
        nextX + targetPiece.w > other.x &&
        nextY < other.y + other.h &&
        nextY + targetPiece.h > other.y
      );
    });
  };

  const movePiece = (pieceId, dx, dy) => {
    if (isClear) return;

    setPieces((prev) => {
      const target = prev.find((p) => p.id === pieceId);
      if (!target) return prev;
      if (!canMove(target, dx, dy, prev)) return prev;

      const nextPieces = prev.map((p) =>
        p.id === pieceId ? { ...p, x: p.x + dx, y: p.y + dy } : p
      );

      if (checkClear(nextPieces)) {
        setIsClear(true);
      }

      return nextPieces;
    });
  };

  const handlePointerDown = (e, piece) => {
    if (isClear) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    setSelectedId(piece.id);
    setDragStart({
      pieceId: piece.id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handlePointerUp = (e) => {
    if (!dragStart || isClear) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 20 && absY < 20) {
      setDragStart(null);
      return;
    }

    if (absX > absY) {
      movePiece(dragStart.pieceId, dx > 0 ? 1 : -1, 0);
    } else {
      movePiece(dragStart.pieceId, 0, dy > 0 ? 1 : -1);
    }

    setDragStart(null);
  };

  const resetGame = () => {
    setPieces(initialPieces);
    setSelectedId(null);
    setDragStart(null);
    setIsClear(false);
  };

  return (
    <section className="puzzle-area">
      <div className="puzzle-frame">
        <div className={`puzzle-board ${isClear ? "clear" : ""}`}>
          {pieces.map((piece) => (
            <button
              key={piece.id}
              className={`piece ${piece.type} ${
                selectedId === piece.id ? "selected" : ""
              } ${isClear && piece.id === "musume" ? "escape" : ""}`}
              style={{
                left: piece.x * CELL_SIZE,
                top: piece.y * CELL_SIZE,
                width: piece.w * CELL_SIZE,
                height: piece.h * CELL_SIZE,
              }}
              onPointerDown={(e) => handlePointerDown(e, piece)}
              onPointerUp={handlePointerUp}
            >
              {piece.label}
            </button>
          ))}
        </div>
      </div>

      {/* モーダル */}
      {isClear && (
        <div className="clear-modal">
          <div className="clear-box">
            <p>クリア！</p>
            <button onClick={resetGame}>もう一度</button>
          </div>
        </div>
      )}
    </section>
  );
}