import { useEffect } from "react";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";

const Timer = observer(() => {
  const { timer } = useStore();
  const { getFirstPlayerTime, getSecondPlayerTime, activateTimer } = timer;
  return (
    <div className="parent-timer">
      <div className="timer">{getSecondPlayerTime()}</div>
      <div className="timer">{getFirstPlayerTime()}</div>
    </div>
  );
});
export default Timer;
