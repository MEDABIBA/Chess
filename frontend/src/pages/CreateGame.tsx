import { useEffect, useState } from "react";
import arrowUp from "../assets/up-arrow.png";
import downArrow from "../assets/down-arrow.png";
import { useStore } from "../provider/context";

const CreateGame = () => {
  const { newGame } = useStore();
  const { createNewGame } = newGame;
  const timerValues = ["3 min", "5 min", "10 min", "15 min"] as const;
  const [timerValue, setTimerValue] = useState<(typeof timerValues)[number]>("3 min");
  const [activeTimer, setActiveTimer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // const [nicknameError, setNicknameError] = useState(false);
  // const [nickname, setNickname] = useState("");
  const selectTime = Number(timerValue.slice(0, 2));
  useEffect(() => {
    if (activeTimer) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [activeTimer]);
  // useEffect(() => {
  //   if (nickname.length === 0 || /^[A-Za-z0-9 ]{1,30}$/.test(nickname)) setNicknameError(false);
  //   else setNicknameError(true);
  // }, [nickname]);
  return (
    <>
      <div className="backgound-image">
        <div className="modal-window">
          <button
            className="timer-button"
            onClick={() => {
              activeTimer ? setActiveTimer(false) : setActiveTimer(true);
            }}>
            {timerValue} (Rapid){" "}
            <img
              src={activeTimer ? arrowUp : downArrow}
              alt="arrow"
              style={{ width: "16px", height: "16px", marginLeft: "5px" }}
            />
          </button>
          {isVisible && (
            <ul className={`timer-list ${activeTimer ? "timer-list-active" : "timer-list-hidden"}`}>
              {timerValues.map((el, i) => {
                return (
                  <li
                    key={i}
                    className={`timer-element ${el === timerValue ? "timer-element-active" : null}`}
                    onClick={() => setTimerValue(el)}>
                    {el}
                  </li>
                );
              })}
            </ul>
          )}
          {/* <input
          type="text"
          placeholder="Enter your nickname"
          onChange={(e) => setNickname(e.target.value)}
          value={nickname}
          className="input"
        /> */}
          {/* {nicknameError && (
          <div className="input-error">Maximum 30 characters (Latin letters only)</div>
        )} */}
          <button onClick={async () => await createNewGame(selectTime)} className="submit-button">
            Create game
          </button>
        </div>
      </div>
    </>
  );
};
export default CreateGame;
