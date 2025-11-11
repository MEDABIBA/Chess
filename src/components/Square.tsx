import React from "react";
import { useStore } from "../provider/context";
import Piece from "../models/Piece";
import { observer } from "mobx-react-lite";

interface SquareProps {
  color: string;
  position: { row: number; col: number };
  piece?: Piece | null;
}

const Square: React.FC<SquareProps> = observer(({ color, position, piece }) => {
  const { row, col } = position;
  const { boardStore } = useStore();
  const { movePiece } = boardStore;

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
    if (!piece || piece == null) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("fromRow", String(row));
    e.dataTransfer.setData("fromCol", String(col));
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromRow = parseInt(e.dataTransfer.getData("fromRow"), 10);
    const fromCol = parseInt(e.dataTransfer.getData("fromCol"), 10);

    movePiece({ row: fromRow, col: fromCol }, position);
  };

  return (
    <div
      className={`square ${color}`}
      data-row={row}
      data-col={col}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      {piece && (
        <img
          className="piece-img"
          src={piece.getPiece()}
          alt="#"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      )}
    </div>
  );
});

export default Square;
