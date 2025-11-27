import { useStore } from "../provider/context";
import Square from "./Square";
import { observer } from "mobx-react-lite";

const Board = observer(() => {
  const { board, chessMoveValidator } = useStore();
  const { availableMovesSet } = board;
  const whiteKingUnerAttack = chessMoveValidator.isKingUnderAttack("white");
  const blackKingUnerAttack = chessMoveValidator.isKingUnderAttack("black");
  return (
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
      {board.board.map(({ color, position, piece }) => {
        const isLastMove =
          "from" in board.highlightLastMoves &&
          "to" in board.highlightLastMoves &&
          ((board.highlightLastMoves?.from.col === position.col &&
            board.highlightLastMoves?.from.row === position.row) ||
            (board.highlightLastMoves?.to.col === position.col &&
              board.highlightLastMoves?.to.row === position.row))
            ? "last-move"
            : "";
        const isActiveField =
          availableMovesSet.has(`${position.row}-${position.col}`) &&
          board.board.find((el) => el.position === position)?.piece !== null
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
          />
        );
      })}
    </div>
  );
});

export default Board;
