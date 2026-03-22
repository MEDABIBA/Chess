import BoardComponent from '../components/Board';
import { useStore } from '../provider/context';
import Modal from '../components/modalWindow';
import { observer } from 'mobx-react-lite';
import PlayerCard from '../components/PlayerCard';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = () => {
  const { id } = useParams();
  const { socket, games, timer } = useStore();
  games.setCurrentGame(Number(id));
  const { currentGame } = games;

  useEffect(() => {
    if (currentGame === null || !id || !socket || !socket.isConnected) return;
    currentGame.id = Number(id);
    socket.joinRoom({ gameId: Number(id) });
    if (
      currentGame.gameStatus === 'playing' ||
      currentGame.gameStatus === 'check'
    ) {
      timer.activateTimer(currentGame.currentPlayer);
    }
    return () => {
      socket.leaveRoom({ gameId: Number(id) });
    };
  }, [currentGame, timer, games.currentGame, id, socket, socket?.isConnected]);

  if (currentGame === null) return;
  const isModalActive = currentGame.getModalActive();

  return (
    <div className="app">
      {(currentGame.gameStatus === 'checkmate' ||
        currentGame.gameStatus === 'timeout') &&
        isModalActive === true && (
          <Modal
            winColor={currentGame.currentPlayer === 'black' ? 'White' : 'Black'}
            reloadGame={currentGame.reloadGame}
            setIsActive={currentGame.setModalActive}
          />
        )}
      <div className="main-content">
        {(currentGame.gameStatus === 'checkmate' ||
          currentGame.gameStatus === 'timeout') && (
          <button
            type="button"
            onClick={() => currentGame.setModalActive(true)}
            className="btn btn-primary btn-lg"
          >
            Open modal
          </button>
        )}
        <div className="game-container">
          <PlayerCard
            playerName={currentGame.blackPlayerNickname}
            getPlayerTime={timer.getSecondPlayerTime}
          />
          <BoardComponent />
          <PlayerCard
            playerName={currentGame.whitePlayerNickname}
            getPlayerTime={timer.getFirstPlayerTime}
          />
        </div>
      </div>
    </div>
  );
};
export default observer(Board);
