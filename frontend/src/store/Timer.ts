import { action, makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { Color } from '../types/types';

class Timer {
  store: RootStore;
  whiteTime: number | null = null; // in seconds
  blackTime: number | null = null; // in seconds
  interval: NodeJS.Timeout | number = 0;
  constructor(store: RootStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  @action
  getTime = (color: Color) => {
    const time = color === 'white' ? this.whiteTime : this.blackTime;

    if (time === null) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return `${minutes > 9 ? '' : 0}${minutes}:${seconds > 9 ? '' : 0}${seconds}`;
  };

  @action
  setTimes = (whiteTime: number, blackTime: number) => {
    this.whiteTime = whiteTime;
    this.blackTime = blackTime;
  };

  activateTimer = (player: Color) => {
    if (this.interval) clearInterval(this.interval);
    return (this.interval = setInterval(
      () => this.decrementTime(player),
      1000,
    ));
  };

  private decrementTime = (player: Color) => {
    if (player === 'white' && this.whiteTime !== null) {
      this.whiteTime -= 1;
    } else if (player === 'black' && this.blackTime !== null) {
      this.blackTime -= 1;
    }
  };

  checkIfTimesUp = () => {
    if (
      (this.whiteTime !== null && this.whiteTime <= 0) ||
      (this.blackTime !== null && this.blackTime <= 0)
    )
      return true;
    return false;
  };

  deactiveTimer = () => {
    clearInterval(this.interval);
  };

  resetTimer = (time: number) => {
    this.whiteTime = time;
    this.blackTime = time;
  };
}

export default Timer;
