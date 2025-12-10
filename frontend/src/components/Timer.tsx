import { useEffect } from "react";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";

const Timer = observer(() => {
  const { timer, board } = useStore();
  const { getFirstPlayerTime, getSecondPlayerTime, checkIfTimesUp, deactiveTimer } = timer;
  useEffect(() => {
    if (checkIfTimesUp()) {
      deactiveTimer();
      board.gameStatus = "timeout";
      board.setModalActive(true);
    }
  }, [getFirstPlayerTime(), getSecondPlayerTime()]);
  return (
    <div className="parent-timer">
      <div className="timer">{getSecondPlayerTime()}</div>
      <div className="timer">{getFirstPlayerTime()}</div>
    </div>
  );
});
export default Timer;
