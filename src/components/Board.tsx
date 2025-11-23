import { useStore } from "../provider/context";
import Square from "./Square";
import { observer } from "mobx-react-lite";

const Board = observer(() => {
  const { boardStore } = useStore();
  const { board, availableMovesSet } = boardStore;
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
      {board.map(({ color, position, piece }) => {
        const isActiveField = availableMovesSet.has(`${position.row}-${position.col}`);
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
