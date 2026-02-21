import { useEffect } from "react";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";

const Timer = observer(({ getPlayerTime }: { getPlayerTime: () => string }) => {
  const { timer, games } = useStore();
  const { currentGame: game } = games;
  const { checkIfTimesUp, deactiveTimer } = timer;
  useEffect(() => {
    if (checkIfTimesUp() && game !== null) {
      deactiveTimer();
      game.gameStatus = "timeout";
      game.setModalActive(true);
    }
  }, [getPlayerTime()]);
  return (
    <div className="parent-timer">
      <div className="timer">{getPlayerTime()}</div>
    </div>
  );
});
export default Timer;
