import React, { useRef } from "react";
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
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { boardStore } = useStore();
  const { movePiece } = boardStore;

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!piece || !imgRef.current) return;
    e.preventDefault();

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;

    img.style.opacity = "0.3";
    document.body.style.cursor = "grabbing";

    const clone = document.createElement("img");
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.transform = `translate3d(${e.clientX - shiftX}px, ${
      e.clientY - shiftY
    }px, 0)`;
    document.body.appendChild(clone);

    const handleMouseMove = (event: MouseEvent) => {
      clone.style.transform = `translate3d(${event.clientX - shiftX}px, ${
        event.clientY - shiftY
      }px, 0)`;
    };

    const handleMouseUp = (event: MouseEvent) => {
      document.body.style.cursor = "default";
      img.style.opacity = "1";

      const dropTarget = document.elementFromPoint(
        event.clientX,
        event.clientY
      ) as HTMLElement | null;
      const square = dropTarget?.closest(".square") as HTMLElement | null;
      if (!square) return;
      if (dropTarget?.closest(".square")) {
        const toRow = Number(square.dataset.row);
        const toCol = Number(square.dataset.col);
        movePiece(position, { row: toRow, col: toCol });
      }

      clone.remove();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    if (!piece || !imgRef.current) return;
    e.preventDefault();

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const shiftX = touch.clientX - rect.left;
    const shiftY = touch.clientY - rect.top;

    img.style.opacity = "0.3";

    const clone = document.createElement("img");
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.transform = `translate3d(${touch.clientX - shiftX}px, ${
      touch.clientY - shiftY
    }px, 0)`;
    document.body.appendChild(clone);

    const handleTouchMove = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) {
        return;
      }
      clone.style.transform = `translate3d(${t.clientX - shiftX}px, ${
        t.clientY - shiftY
      }px, 0)`;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      img.style.opacity = "1";

      const t = event.changedTouches[0];
      if (!t) {
        return;
      }
      const dropTarget = document.elementFromPoint(
        t.clientX,
        t.clientY
      ) as HTMLElement | null;
      if (dropTarget?.classList.contains("square")) {
        const toRow = Number(dropTarget.dataset.row);
        const toCol = Number(dropTarget.dataset.col);
        movePiece(position, { row: toRow, col: toCol });
      }

      clone.remove();
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className={`square ${color}`}
      data-row={row}
      data-col={col}
      style={{ position: "relative" }}>
      {piece && (
        <img
          ref={imgRef}
          className="piece-img"
          src={piece.getPiece()}
          alt="#"
          draggable={false}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: "grab", userSelect: "none" }}
        />
      )}
    </div>
  );
});

export default Square;
