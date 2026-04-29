import Game from '../models/Game';
import GameButton from '../components/GameButton';

import whiteFlag from '../assets/white-flag.png';
import bin from '../assets/bin.png';
import draw from '../assets/draw.png';
import info from '../assets/info.png';
const MainInfoModalWindow = ({
  currentGame,
  setResignModal,
  setRemoveGameModal,
  setDrawModal,
}: {
  currentGame: Game;
  setResignModal: (value: boolean) => void;
  setRemoveGameModal: (value: boolean) => void;
  setDrawModal: (value: boolean) => void;
}) => (
  <>
    <div className="game-info-window-main-info">
      <img
        src={info}
        height={window.innerWidth > 768 ? 40 : 28}
        width={window.innerWidth > 768 ? 40 : 28}
        style={{ marginRight: '10px' }}
        alt="info"
      />
      {currentGame.gameStatus === 'playing' ||
      currentGame.gameStatus === 'waiting'
        ? currentGame.isParticipant()
          ? `You play ${currentGame.yourColor} pieces`
          : `It's ${currentGame.currentPlayer}'s turn`
        : currentGame.gameStatus === 'checkmate'
          ? `${currentGame.winner} won`
          : currentGame.gameStatus === 'draw'
            ? `Draw`
            : currentGame.gameStatus === 'resign'
              ? `${currentGame.winner} won, opponent resigned`
              : currentGame.gameStatus === 'stalemate'
                ? `Stalemate`
                : currentGame.gameStatus === 'timeout'
                  ? `Timeout win, ${currentGame.winner} won`
                  : null}
    </div>
    {currentGame.isParticipant() &&
      (currentGame.gameStatus === 'playing' ||
        currentGame.gameStatus === 'waiting') && (
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
          {currentGame.gameStatus === 'playing' &&
            currentGame.drawOfferedBy === null && (
              <GameButton img={draw} text="draw" setModal={setDrawModal} />
            )}
        </div>
      )}
  </>
);
export default MainInfoModalWindow;
