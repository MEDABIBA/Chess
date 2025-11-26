import Board from "./components/Board";
import { observer } from "mobx-react-lite";
import Timer from "./components/Timer";

const App = observer(() => {
  return (
    <div className="app">
      <Board />
      <Timer />
    </div>
  );
});

export default App;
