import { action, makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";

class Timer {
  store: RootStore;
  p2: number = 180; // in seconds
  p1: number = 180; // in seconds
  interval: number = 0;
  constructor(store: RootStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  @action
  getFirstPlayerTime = () => {
    const minutes = Math.floor(this.p1 / 60);
    const seconds = this.p1 - minutes * 60;
    return `${minutes > 9 ? "" : 0}${minutes}:${seconds > 9 ? "" : 0}${seconds}`;
  };

  @action
  getSecondPlayerTime = () => {
    const minutes = Math.floor(this.p2 / 60);
    const seconds = this.p2 - minutes * 60;
    return `${minutes > 9 ? "" : 0}${minutes}:${seconds > 9 ? "" : 0}${seconds}`;
  };

  activateTimer = (player: "p1" | "p2") => {
    return (this.interval = setInterval(() => this.decrementTime(player), 1000));
  };

  private decrementTime = (player: "p1" | "p2") => {
    if (player === "p1") {
      this.p1 -= 1;
    } else if (player === "p2") {
      this.p2 -= 1;
    }
  };

  checkIfTimesUp = () => {
    if (this.p1 <= 0 || this.p2 <= 0) return true;
    return false;
  };

  deactiveTimer = () => {
    clearInterval(this.interval);
  };

  resetTimer = (time: number) => {
    this.p1 = time;
    this.p2 = time;
  };
}

export default Timer;
