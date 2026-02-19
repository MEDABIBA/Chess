import BoardComponent from "../components/Board";
import { useStore } from "../provider/context";
import Modal from "../components/modalWindow";
import { observer } from "mobx-react-lite";
import PlayerCard from "../components/PlayerCard";

const Board = () => {
  const { games, timer } = useStore();
  const { currentGame } = games;
  const isModalActive = currentGame.getModalActive();
  return (
    <div className="app">
      {(currentGame.gameStatus === "checkmate" || currentGame.gameStatus === "timeout") &&
        isModalActive === true && (
          <Modal
            winColor={currentGame.currentPlayer === "black" ? "White" : "Black"}
            reloadGame={currentGame.reloadGame}
            setIsActive={currentGame.setModalActive}
          />
        )}
      <div className="main-content">
        {(currentGame.gameStatus === "checkmate" || currentGame.gameStatus === "timeout") && (
          <button
            type="button"
            onClick={() => currentGame.setModalActive(true)}
            className="btn btn-primary btn-lg">
            Open modal
          </button>
        )}
        <div className="game-container">
          <PlayerCard
            playerName={currentGame.blackPlayerNickname}
            getPlayerTime={timer.getFirstPlayerTime}
          />
          <BoardComponent />
          <PlayerCard
            playerName={currentGame.whitePlayerNickname}
            getPlayerTime={timer.getSecondPlayerTime}
          />
        </div>
      </div>
    </div>
  );
};
export default observer(Board);
