import { useEffect } from "react";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";

const Timer = observer(({ getPlayerTime }: { getPlayerTime: () => string }) => {
  const { timer, game } = useStore();
  const { getFirstPlayerTime, getSecondPlayerTime, checkIfTimesUp, deactiveTimer } = timer;
  useEffect(() => {
    if (checkIfTimesUp()) {
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
