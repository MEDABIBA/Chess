import { useParams } from "react-router-dom";
import { useStore } from "../provider/context";
import PromotionPicker from "./PromotionPicker";
import Square from "./Square";
import { observer } from "mobx-react-lite";
import { GameInterface } from "../types/types";
import { useEffect, useState } from "react";

const Board = observer(() => {
  const { id } = useParams();
  const { socket, game, chessMoveValidator } = useStore();
  const { availableMovesSet, pendingPromotionValue } = game;
  const whiteKingUnerAttack = chessMoveValidator.isKingUnderAttack("white");
  const blackKingUnerAttack = chessMoveValidator.isKingUnderAttack("black");
  const grab = game.getGrab();
  useEffect(() => {
    if (!id) return;
    socket?.getGame({ id: Number(id) });
  }, [id, socket, socket?.isConnected]);
  return (
    <>
      <div className="board">
        <div className="numeration">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
        <div className="alphanumeric-numbering">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
        {pendingPromotionValue && (
          <PromotionPicker
            oldPiece={pendingPromotionValue.piece}
            color={pendingPromotionValue.color}
            position={pendingPromotionValue.position}
          />
        )}
        {game.board.map(({ color, position, piece }) => {
          const grabbed = grab?.col === position.col && grab.row === position.row;
          const isLastMove =
            "from" in game.highlightLastMoves &&
            "to" in game.highlightLastMoves &&
            ((game.highlightLastMoves?.from.col === position.col &&
              game.highlightLastMoves?.from.row === position.row) ||
              (game.highlightLastMoves?.to.col === position.col &&
                game.highlightLastMoves?.to.row === position.row))
              ? "last-move"
              : "";
          const isActiveField =
            availableMovesSet.has(`${position.row}-${position.col}`) &&
            game.board.find((el) => el.position === position)?.piece !== null
              ? "square-attack"
              : availableMovesSet.has(`${position.row}-${position.col}`)
                ? "square-active"
                : "";
          return (
            <Square
              key={`${position.row}-${position.col}`}
              color={color}
              position={position}
              piece={piece}
              isLastMove={isLastMove}
              isActiveField={isActiveField}
              hightlightKingAttacked={
                piece?.color === "white" && piece.pieceType === "king"
                  ? whiteKingUnerAttack
                  : piece?.color === "black" && piece.pieceType === "king"
                    ? blackKingUnerAttack
                    : false
              }
              grabbed={grabbed}
              animationTarget={
                game.animateMove &&
                game.animateMove.from.col === position.col &&
                game.animateMove.from.row === position.row
                  ? game.animateMove
                  : null
              }
            />
          );
        })}
      </div>
    </>
  );
});

export default Board;
