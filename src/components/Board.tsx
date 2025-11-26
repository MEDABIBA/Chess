import { useStore } from "../provider/context";
import Square from "./Square";
import { observer } from "mobx-react-lite";

const Board = observer(() => {
  const { board } = useStore();
  const { availableMovesSet } = board;
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
            isActiveField={isActiveField}
          />
        );
      })}
    </div>
  );
});

export default Board;
