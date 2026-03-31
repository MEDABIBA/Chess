import { action, makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { Color } from '../types/types';

class Timer {
  store: RootStore;
  p2: number | null = null; // in seconds
  p1: number | null = null; // in seconds
  interval: NodeJS.Timeout | number = 0;
  constructor(store: RootStore) {
    makeAutoObservable(this);
    this.store = store;
  }

  @action
  getFirstPlayerTime = () => {
    if (this.p1 === null) return '00:00';
    const minutes = Math.floor(this.p1 / 60);
    const seconds = Math.floor(this.p1 - minutes * 60);
    return `${minutes > 9 ? '' : 0}${minutes}:${seconds > 9 ? '' : 0}${seconds}`;
  };

  @action
  setFirstPlayerTime = (time: number) => {
    this.p1 = time;
  };

  @action
  getSecondPlayerTime = () => {
    if (this.p2 === null) return '00:00';
    const minutes = Math.floor(this.p2 / 60);
    const seconds = Math.floor(this.p2 - minutes * 60);
    return `${minutes > 9 ? '' : 0}${minutes}:${seconds > 9 ? '' : 0}${seconds}`;
  };

  @action
  setSecondPlayerTime = (time: number) => {
    this.p2 = time;
  };

  activateTimer = (player: Color) => {
    if (this.interval) clearInterval(this.interval);
    return (this.interval = setInterval(
      () => this.decrementTime(player),
      1000,
    ));
  };

  private decrementTime = (player: Color) => {
    if (player === 'white' && this.p1 !== null) {
      this.p1 -= 1;
    } else if (player === 'black' && this.p2 !== null) {
      this.p2 -= 1;
    }
  };

  checkIfTimesUp = () => {
    if (
      (this.p1 !== null && this.p1 <= 0) ||
      (this.p2 !== null && this.p2 <= 0)
    )
      return true;
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
