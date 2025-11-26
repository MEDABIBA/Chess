import { action, computed, makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";

class Timer {
  store: RootStore;
  p1: number = 1800;
  p2: number = 1800;
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

  deactiveTimer = () => {
    clearInterval(this.interval);
  };
}

export default Timer;
