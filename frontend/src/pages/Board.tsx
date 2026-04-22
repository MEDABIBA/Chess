import BoardComponent from '../components/Board';
import { useStore } from '../provider/context';
import Modal from '../components/ModalWindow';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import notify from '../components/ui/notify';
import PlayersWindow from '../components/PlayersWidow';

const Board = () => {
  const { id } = useParams();
  const store = useStore();
  const { socket, games, timer, navigate } = store;
  useEffect(() => {
    games.setCurrentGame(Number(id));
  }, [id, games.gamesList]);
  useEffect(() => {
    if (!id || !socket || !socket.isConnected) return;
    socket.joinRoom({ gameId: Number(id) });
    return () => {
      games.currentGame?.annotations.clearAnnoations();
      if (currentGame && currentGame.isFinished()) {
        currentGame.setModalActive(true);
      }
      socket.leaveRoom({ gameId: Number(id) });
    };
  }, [
    games.currentGame,
    games.currentGame?.currentPlayer,
    id,
    socket,
    socket?.isConnected,
  ]);
  useEffect(() => {
    if (games.currentGame && games.currentGame.gameStatus === 'playing') {
      timer.activateTimer(games.currentGame.currentPlayer);
    } else {
      timer.deactiveTimer();
    }
  }, [games.currentGame?.gameStatus, games.currentGame?.currentPlayer]);
  const { currentGame } = games;
  const [resignModal, setResignModal] = useState<boolean>(false);
  const [removeGameModal, setRemoveGameModal] = useState<boolean>(false);
  const [drawModal, setDrawModal] = useState<boolean>(false);

  useEffect(() => {
    if (
      currentGame?.drawOfferedBy &&
      currentGame?.gameStatus === 'playing' &&
      currentGame.drawOfferedBy !== currentGame.playerId
    ) {
      notify('Your opponent offers a draw', 'info', (res: boolean) => {
        socket.drawResponse({ gameId: currentGame.id, response: res });
      });
    }
  }, [currentGame?.drawOfferedBy, currentGame?.gameStatus]);

  if (currentGame === null) return;
  const isModalActive = currentGame.getModalActive();

  return (
    <div className="app">
      {currentGame.isFinished() && isModalActive && (
        <Modal
          title={`${currentGame.gameStatus === 'checkmate' ? `Checkmate` : currentGame.gameStatus === 'stalemate' ? 'Stalemate' : currentGame.gameStatus === 'draw' ? `Draw!` : `${currentGame.winner} won`}`}
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
      {drawModal && (
        <Modal
          title="Do you want to offer a draw?"
          setIsActive={setDrawModal}
          action={() => {
            socket.drawOffer({ gameId: currentGame.id });
          }}
          text="Draw offer"
        />
      )}
      <div className="main-content">
        <div className="game-container">
          <BoardComponent />
        </div>
        <PlayersWindow
          setDrawModal={setDrawModal}
          setRemoveGameModal={setRemoveGameModal}
          setResignModal={setResignModal}
        />
      </div>
    </div>
  );
};
export default observer(Board);
