import whiteKing from '../assets/figures/king-white.svg';
import blackKing from '../assets/figures/king-black.svg';
import { Color } from '../types/types';

const ColorSelector = ({
  color,
  setColor,
}: {
  color: Color;
  setColor: React.Dispatch<Color>;
}) => {
  return (
    <div className="color-selector">
      <button
        style={{ borderRadius: '13% 0 0 13%' }}
        className="color-selector-item"
        onClick={() => setColor('white')}
      >
        <img
          className={`color-selector-white-img ${color === 'white' ? 'color-selector-item-active' : null}`}
          src={whiteKing}
          alt="king"
        />
      </button>
      <button
        style={{ borderRadius: '0 13% 13% 0' }}
        className="color-selector-item"
        onClick={() => setColor('black')}
      >
        <img
          className={`color-selector-black-img ${color === 'black' ? 'color-selector-item-active' : null}`}
          src={blackKing}
          alt="king"
        />
      </button>
    </div>
  );
};
export default ColorSelector;
