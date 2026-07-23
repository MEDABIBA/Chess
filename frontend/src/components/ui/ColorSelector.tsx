import whiteKing from '../../assets/figures/king-white.svg';
import blackKing from '../../assets/figures/king-black.svg';
import { Color } from '../../types/types';

const ColorSelector = ({
  color,
  setColor,
}: {
  color: Color;
  setColor: React.Dispatch<Color>;
}) => {
  return (
    <div className="selector">
      <button
        style={{ borderRadius: '13% 0 0 13%' }}
        className={`selector-item ${color === 'white' ? 'selector-item-active' : null}`}
        onClick={() => setColor('white')}
      >
        <img className={`selector-left-img`} src={whiteKing} alt="king" />
      </button>
      <button
        style={{ borderRadius: '0 13% 13% 0' }}
        className={`selector-item ${color === 'black' ? 'selector-item-active' : null}`}
        onClick={() => setColor('black')}
      >
        <img className={`selector-right-img`} src={blackKing} alt="king" />
      </button>
    </div>
  );
};
export default ColorSelector;
