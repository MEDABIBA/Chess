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
  createNewGame = async (
    time: string,
    selectedColor: Color,
    isBotGame: boolean,
    depth: number = 1,
  ) => {
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
        isBotGame: isBotGame,
        creatorUserName: nickname,
        selectedColor,
        depth,
        initialTime,
        additionalTime,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      } else {
        notify(String(error), 'error');
      }
    }
  };
}
export default NewGame;
