import { action, makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { initializeBoard } from '../helpers/initializeBoard';
import notify from '../components/ui/notify';
import parseTimer from '../helpers/parseTimer';
import { Color } from '../types/types';

class NewGame {
  store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action
  createNewGame = async (time: string, selectedColor: Color) => {
    const nickname = this.store.getNickname();
    if (!nickname) {
      notify('You are not logged in', 'error');
      return;
    }
    const { initialTime, additionalTime } = parseTimer(time);

    const board = initializeBoard();
    try {
      this.store.socket?.createGame({
        boardState: board,
        creatorUserName: nickname,
        selectedColor,
        initialTime,
        additionalTime,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        notify(error.message, 'error');
      } else {
        console.log(error);
        notify(String(error), 'error');
      }
    }
  };
}
export default NewGame;
