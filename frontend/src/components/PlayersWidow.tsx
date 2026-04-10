import { observer } from 'mobx-react-lite';
import { useStore } from '../provider/context';
import Timer from './Timer';
import GameButton from '../components/GameButton';

import whiteFlag from '../assets/white-flag.png';
import bin from '../assets/bin.png';
import draw from '../assets/draw.png';
import info from '../assets/info.png';
const PlayersWindow = ({
  setResignModal,
  setRemoveGameModal,
  setDrawModal,
}: {
  setResignModal: (value: boolean) => void;
  setRemoveGameModal: (value: boolean) => void;
  setDrawModal: (value: boolean) => void;
}) => {
  const { games, timer } = useStore();
  const { currentGame } = games;
  if (!currentGame) return;
  const { getFirstPlayerTime, getSecondPlayerTime } = timer;
  const { whitePlayerNickname, blackPlayerNickname } = currentGame;
  return (
    <>
      <div className="game-info-window">
        <Timer getPlayerTime={getFirstPlayerTime} />
        <div className="game-info-window-main">
          <div className="player-name">{whitePlayerNickname}</div>
          {currentGame.isParticipant() && (
            <>
              <div className="game-info-window-main-info">
                <img
                  src={info}
                  height={40}
                  width={40}
                  style={{ marginRight: '10px' }}
                  alt="info"
                />
                You play {currentGame.yourColor} pieces
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
                {currentGame.gameStatus === 'playing' &&
                  currentGame.drawOfferedBy === null && (
                    <GameButton
                      img={draw}
                      text="draw"
                      setModal={setDrawModal}
                    />
                  )}
              </div>
            </>
          )}

          <div className="player-name">{blackPlayerNickname ?? '...'}</div>
        </div>
        <Timer getPlayerTime={getSecondPlayerTime} />
      </div>
    </>
  );
};
export default observer(PlayersWindow);
