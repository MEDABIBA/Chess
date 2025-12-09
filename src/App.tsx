import Board from "./components/Board";
import { observer } from "mobx-react-lite";
import Timer from "./components/Timer";
import { useStore } from "./provider/context";
import Modal from "./components/modalWindow";

const App = observer(() => {
  const { board } = useStore();
  const { setModalActive, reloadGame, getModalActive } = board;
  const isModalActive = getModalActive();
  return (
    <div className="app">
      {(board.gameStatus === "checkmate" || board.gameStatus === "timeout") &&
        isModalActive === true && (
          <Modal
            winColor={board.currentPlayer === "black" ? "White" : "Black"}
            reloadGame={reloadGame}
            setIsActive={setModalActive}
          />
        )}
      <div className="main-content">
        {(board.gameStatus === "checkmate" || board.gameStatus === "timeout") && (
          <button
            type="button"
            onClick={() => board.setModalActive(true)}
            className="btn btn-primary btn-lg">
            Open modal
          </button>
        )}
        <div className="board-container">
          <Board />
          <Timer />
        </div>
      </div>
    </div>
  );
});

export default App;
