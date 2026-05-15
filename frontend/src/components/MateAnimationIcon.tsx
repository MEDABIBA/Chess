import whiteKing from '../assets/checkmate-white.png';
import blackKing from '../assets/checkmate-black.png';
import checkmateWinner from '../assets/checkmate-winner.png';
import { Color } from '../types/types';
const MateAnimationIcon = ({
  winner,
  kingColor,
}: {
  winner: Color | null;
  kingColor: Color;
}) =>
  !winner ? (
    <div className="animation-mate-icon animation-mate-icon-draw">1/2</div>
  ) : winner === kingColor ? (
    <img
      className="animation-mate-icon animation-mate-icon-winner"
      src={checkmateWinner}
      alt="king"
    />
  ) : winner !== kingColor && kingColor === 'black' ? (
    <img
      className="animation-mate-icon animation-mate-icon-looser"
      src={blackKing}
      alt="king"
    />
  ) : (
    <img
      className="animation-mate-icon animation-mate-icon-looser"
      src={whiteKing}
      alt="king"
    />
  );

export default MateAnimationIcon;
