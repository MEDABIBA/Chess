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
  const { games } = useStore();
  const { currentGame } = games;
  if (!currentGame) return;
  const { whitePlayerNickname, blackPlayerNickname } = currentGame;
  const topColor = !currentGame.isParticipant()
    ? 'black'
    : currentGame.yourColor === 'white'
      ? 'black'
      : 'white';
  const bottomColor = !currentGame.isParticipant()
    ? 'white'
    : currentGame.yourColor === 'white'
      ? 'white'
      : 'black';
  return (
    <>
      <div className="game-info-window">
        <div style={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
          <Timer color={topColor} />
          {currentGame.additionalTime ? `+${currentGame.additionalTime}s` : ''}
        </div>
        <div className="game-info-window-main">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="player-name">
              {topColor === 'white' ? whitePlayerNickname : blackPlayerNickname}
            </div>
            {currentGame.isParticipant() &&
              currentGame.gameStatus === 'playing' && (
                <button
                  className="exta-time-btn"
                  title="Add 15s to your opponent"
                  onClick={() => currentGame.addExtraTimeToOpponent()}
                >
                  <span>+</span>
                </button>
              )}
          </div>
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

          <div className="player-name">
            {bottomColor === 'white'
              ? whitePlayerNickname
              : (blackPlayerNickname ?? '...')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
          <Timer color={bottomColor} />
          {currentGame.additionalTime ? `+${currentGame.additionalTime}s` : ''}
        </div>
      </div>
    </>
  );
};
export default observer(PlayersWindow);
