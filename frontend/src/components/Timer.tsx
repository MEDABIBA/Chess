import { useEffect, useState } from 'react';
import { useStore } from '../provider/context';
import { observer } from 'mobx-react-lite';

import tenSeconds from '../assets/sounds/tenseconds.mp3';
import { Color } from '../types/types';

const Timer = observer(({ color }: { color: Color }) => {
  const [pulsatingFlag, setPulsatingFlag] = useState(false);
  const { timer, games } = useStore();
  const { currentGame: game } = games;
  const { checkIfTimesUp, deactiveTimer, whiteTime, blackTime, getTime } =
    timer;
  useEffect(() => {
    if (game?.isParticipant() && game.currentPlayer === game.yourColor) {
      if (
        (color === 'white' &&
          game.yourColor === color &&
          whiteTime &&
          whiteTime === 10) ||
        (color === 'black' &&
          game.yourColor === color &&
          blackTime &&
          blackTime === 10)
      ) {
        new Audio(tenSeconds).play();
        setPulsatingFlag(true);
        setTimeout(() => setPulsatingFlag(false), 2000);
      }
    }
    if (checkIfTimesUp() && game !== null) {
      deactiveTimer();
    }
  }, [whiteTime, blackTime]);

  return (
    <div className={`timer ${pulsatingFlag ? 'timer-pulsive' : ''}`}>
      {getTime(color)}
    </div>
  );
});
export default Timer;
