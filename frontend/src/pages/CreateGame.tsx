import { useState } from 'react';
import { useStore } from '../provider/context';

import { ReactComponent as Bullet } from '../assets/icons/bullet.svg';
import { ReactComponent as Blitz } from '../assets/icons/blitz.svg';
import { ReactComponent as Rapid } from '../assets/icons/rapid.svg';
import { Color } from '../types/types';

const CreateGame = () => {
  const { newGame } = useStore();
  const { createNewGame } = newGame;
  const timerValues = {
    Bullet: ['1 min', '1+1', '2+1'],
    Blitz: ['3 min', '3+2', '5 min'],
    Rapid: ['10 min', '15+10', '30 min'],
  };
  const categoryIcons = {
    Bullet: Bullet,
    Blitz: Blitz,
    Rapid: Rapid,
  };
  type TimerValue = (typeof timerValues)[keyof typeof timerValues][number];
  const [timerValue, setTimerValue] = useState<TimerValue>('15+10');
  const [color, setColor] = useState<Color>('white');
  const selectTime = timerValue.replace('min', '').trim();
  return (
    <>
      <div className="backgound-image">
        <div className="modal-window">
          {Object.entries(timerValues).map(([category, values]) => {
            const Icon = categoryIcons[category as keyof typeof timerValues];
            return (
              <div style={{ width: '100%' }} key={category}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <Icon />
                  <h3>{category}</h3>
                </div>

                <ul className="timer-list">
                  {values.map((el, i) => (
                    <li
                      key={i}
                      className={`timer-element ${el === timerValue ? 'timer-element-active' : ''}`}
                      onClick={() => setTimerValue(el)}
                    >
                      {el}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div>
            <button onClick={() => setColor('white')}>white</button>
            <button onClick={() => setColor('black')}>black</button>
          </div>
          <button
            onClick={async () => await createNewGame(selectTime, color)}
            className="submit-button"
          >
            Create game
          </button>
        </div>
      </div>
    </>
  );
};
export default CreateGame;
