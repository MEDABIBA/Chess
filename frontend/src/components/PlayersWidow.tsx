import { observer } from 'mobx-react-lite';
import { useStore } from '../provider/context';
import MainInfoModalWindow from './MainInfoModalWindow';
import PlayerWindow from './PlayerWindow';
import { Color } from '../types/types';

const PlayersWindow = ({
  setResignModal,
  setRemoveGameModal,
  setDrawModal,
  topColor,
  bottomColor,
}: {
  setResignModal: (value: boolean) => void;
  setRemoveGameModal: (value: boolean) => void;
  setDrawModal: (value: boolean) => void;
  topColor: Color;
  bottomColor: Color;
}) => {
  const { games } = useStore();
  const { currentGame } = games;
  if (!currentGame) return;
  const { whitePlayerNickname, blackPlayerNickname } = currentGame;

  return (
    <>
      <div className="game-info-window">
        <PlayerWindow
          additionalTime={currentGame.additionalTime}
          color={topColor}
        />
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
          <MainInfoModalWindow
            currentGame={currentGame}
            setDrawModal={setDrawModal}
            setRemoveGameModal={setRemoveGameModal}
            setResignModal={setResignModal}
          />
          <div className="player-name">
            {bottomColor === 'white'
              ? whitePlayerNickname
              : (blackPlayerNickname ?? '...')}
          </div>
        </div>
        <PlayerWindow
          additionalTime={currentGame.additionalTime}
          color={bottomColor}
        />
      </div>
    </>
  );
};
export default observer(PlayersWindow);
