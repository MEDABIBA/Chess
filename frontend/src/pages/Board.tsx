import BoardComponent from "../components/Board";
import { useStore } from "../provider/context";
import Modal from "../components/modalWindow";
import { observer } from "mobx-react-lite";
import PlayerCard from "../components/PlayerCard";

const Board = () => {
  const { game, timer } = useStore();
  const { setModalActive, reloadGame, getModalActive } = game;
  const isModalActive = getModalActive();
  return (
    <div className="app">
      {(game.gameStatus === "checkmate" || game.gameStatus === "timeout") &&
        isModalActive === true && (
          <Modal
            winColor={game.currentPlayer === "black" ? "White" : "Black"}
            reloadGame={reloadGame}
            setIsActive={setModalActive}
          />
        )}
      <div className="main-content">
        {(game.gameStatus === "checkmate" || game.gameStatus === "timeout") && (
          <button
            type="button"
            onClick={() => game.setModalActive(true)}
            className="btn btn-primary btn-lg">
            Open modal
          </button>
        )}
        <div className="game-container">
          <PlayerCard playerName={game.blackPlayerId} getPlayerTime={timer.getFirstPlayerTime} />
          <BoardComponent />
          <PlayerCard playerName={game.whitePlayerId} getPlayerTime={timer.getSecondPlayerTime} />
        </div>
      </div>
    </div>
  );
};
export default observer(Board);
