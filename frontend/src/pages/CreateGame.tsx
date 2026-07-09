import { useState } from 'react';
import { useStore } from '../provider/context';

import { ReactComponent as Bullet } from '../assets/icons/bullet.svg';
import { ReactComponent as Blitz } from '../assets/icons/blitz.svg';
import { ReactComponent as Rapid } from '../assets/icons/rapid.svg';
import ColorSelector from '../components/ColorSelector';
import { Color } from '../types/types';
import Header from '../components/Header';
import BotSelector from '../components/ui/BotSelect';

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
  const [bot, setBot] = useState<boolean>(true);
  const selectTime = timerValue.replace('min', '').trim();
  return (
    <div className="appearance-animation">
      <div className="backgound-image">
        <Header />
        <div className="container">
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
            <ColorSelector color={color} setColor={setColor} />
            <BotSelector bot={bot} setBot={setBot} />
            <button
              onClick={async () =>
                await createNewGame(selectTime, color, true, 5)
              }
              className="submit-button"
            >
              Create game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateGame;
