import BoardComponent from "../components/Board";
import Timer from "../components/Timer";
import { useStore } from "../provider/context";
import Modal from "../components/modalWindow";
import { observer } from "mobx-react-lite";
import PlayerCard from "../components/PlayerCard";

const Board = () => {
  const { board, timer } = useStore();
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
          <PlayerCard playerName={board.whitePlayerId} getPlayerTime={timer.getFirstPlayerTime} />
          <BoardComponent />
          <PlayerCard playerName={board.blackPlayerId} getPlayerTime={timer.getSecondPlayerTime} />
        </div>
      </div>
    </div>
  );
};
export default observer(Board);
