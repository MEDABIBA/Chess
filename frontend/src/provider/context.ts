import { createContext, useContext } from "react";
import { RootStore, store } from "../store/RootStore";

export const StoreContext = createContext<RootStore>(store as RootStore)
export const useStore = () => useContext(StoreContext)