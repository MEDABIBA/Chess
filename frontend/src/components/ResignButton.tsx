import whiteFlag from '../assets/white-flag.png';
import Game from '../models/Game';
const ResignButton = ({
  game,
  setResignModal,
}: {
  game: Game;
  setResignModal: (boolean: boolean) => void;
}) => (
  <div
    className="resign-btn"
    onClick={() => {
      if (game.gameStatus === 'waiting' || game.gameStatus === 'playing') {
        setResignModal(true);
      }
      return;
    }}
  >
    <img height={40} width={40} src={whiteFlag} alt="resign" />
  </div>
);
export default ResignButton;
