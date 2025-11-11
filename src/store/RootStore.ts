import { makeAutoObservable } from "mobx"
import BoardStore from "./BoardStore"

export class RootStore {
    boardStore: BoardStore
    constructor(){
        makeAutoObservable(this)
        this.boardStore = new BoardStore()
    }
}

export const store = new RootStore()