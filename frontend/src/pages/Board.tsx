import BoardComponent from '../components/Board';
import { useStore } from '../provider/context';
import Modal from '../components/modalWindow';
import { observer } from 'mobx-react-lite';
import PlayerCard from '../components/PlayerCard';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameButton from '../components/GameButton';

import whiteFlag from '../assets/white-flag.png';
import bin from '../assets/bin.png';

const Board = () => {
  const { id } = useParams();
  const { socket, games, timer, navigate } = useStore();
  games.setCurrentGame(Number(id));
  const { currentGame } = games;
  const [resignModal, setResignModal] = useState<boolean>(false);
  const [removeGameModal, setRemoveGameModal] = useState<boolean>(false);

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
        currentGame.gameStatus === 'stalemate' ||
        currentGame.gameStatus === 'timeout' ||
        currentGame.gameStatus === 'resign') &&
        isModalActive && (
          <Modal
            title={`${currentGame.gameStatus === 'checkmate' ? `Stalemate` : `${currentGame.winner} won`}`}
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
      {removeGameModal && (
        <Modal
          title="Are you sure you want to remove this game?"
          setIsActive={setRemoveGameModal}
          action={() => {
            socket.removeGame({ gameId: currentGame.id });
          }}
          text="Remove game"
        />
      )}
      {(currentGame.gameStatus === 'checkmate' ||
        currentGame.gameStatus === 'stalemate' ||
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
        <div className="game-buttons">
          {currentGame.blackPlayerNickname !== null &&
            currentGame.gameStatus === 'playing' && (
              <GameButton
                img={whiteFlag}
                text="resign"
                setModal={setResignModal}
              />
            )}
          {currentGame.gameStatus === 'waiting' && (
            <GameButton
              img={bin}
              text="remove game"
              setModal={setRemoveGameModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default observer(Board);
