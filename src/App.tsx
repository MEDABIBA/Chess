import Board from "./components/Board";
import { useStore } from "./provider/context";

function App() {
  const store = useStore()
  return (
    <div className="app">
      <Board/>
    </div>
  );
}

export default App;
