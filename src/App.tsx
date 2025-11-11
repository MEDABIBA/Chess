import Board from "./components/Board";
import { useStore } from "./provider/context";
import { observer } from "mobx-react-lite";

const App = observer(() => {
  const store = useStore();
  return (
    <div className="app">
      <Board />
    </div>
  );
});

export default App;
