import { createContext, useContext, useEffect } from "react";
import { RootStore, store } from "../store/RootStore";
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext<RootStore>(store as RootStore);
export const useStore = () => useContext(StoreContext);
export function StoreInitializer() {
  const navigate = useNavigate();
  const store = useStore();

  useEffect(() => {
    store.initNavigate(navigate);
  }, [navigate]);

  return null;
}
