import BoardComponent from '../components/Board';
import { useStore } from '../provider/context';
import Modal from '../components/modalWindow';
import { observer } from 'mobx-react-lite';
import PlayerCard from '../components/PlayerCard';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ResignButton from '../components/ResignButton';

const Board = () => {
  const { id } = useParams();
  const { socket, games, timer, navigate } = useStore();
  games.setCurrentGame(Number(id));
  const { currentGame } = games;
  const [resignModal, setResignModal] = useState<boolean>(false);

  useEffect(() => {
    if (currentGame === null || !id || !socket || !socket.isConnected) return;
    currentGame.id = Number(id);
    socket.joinRoom({ gameId: Number(id) });
    if (currentGame.gameStatus === 'playing') {
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
        currentGame.gameStatus === 'timeout' ||
        currentGame.gameStatus === 'resign') &&
        isModalActive && (
          <Modal
            title={`${currentGame.winner} won`}
            setIsActive={currentGame.setModalActive}
            action={() => navigate(`home`)}
            text="Navigate to home"
          />
        )}
      {resignModal && (
        <Modal
          title="Are you sure you want to resign?"
          setIsActive={setResignModal}
          action={() => {
            socket.resign({ id: currentGame.id });
          }}
          text="Resign"
        />
      )}
      {(currentGame.gameStatus === 'checkmate' ||
        currentGame.gameStatus === 'timeout' ||
        currentGame.gameStatus === 'resign') && (
        <button
          type="button"
          onClick={() => currentGame.setModalActive(true)}
          className="btn btn-primary btn-lg"
        >
          Open modal
        </button>
      )}
      <div className="main-content">
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
        {currentGame.blackPlayerNickname !== null &&
          (currentGame.gameStatus === 'waiting' ||
            currentGame.gameStatus === 'playing') && (
            <ResignButton game={currentGame} setResignModal={setResignModal} />
          )}
      </div>
    </div>
  );
};
export default observer(Board);
