import { useState } from 'react';
import { useStore } from '../provider/context';

const CreateGame = () => {
  const { newGame } = useStore();
  const { createNewGame } = newGame;
  const timerValues = {
    bullet: ['1 min', '1+1', '2+1'],
    blitz: ['3 min', '3+2', '5 min'],
    rapid: ['10 min', '15+10', '30 min'],
  };
  type TimerValue = (typeof timerValues)[keyof typeof timerValues][number];
  const [timerValue, setTimerValue] = useState<TimerValue>('3 min');
  const selectTime = timerValue.replace('min', '').trim();
  return (
    <>
      <div className="backgound-image">
        <div className="modal-window">
          {Object.entries(timerValues).map(([category, values]) => (
            <div key={category}>
              <h3>{category}</h3>
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
          ))}
          <button
            onClick={async () => await createNewGame(selectTime)}
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
