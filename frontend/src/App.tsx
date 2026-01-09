import { observer } from "mobx-react-lite";
import { Route, Routes } from "react-router-dom";
import Board from "./pages/Board";
import CreateGame from "./pages/CreateGame";

const App = observer(() => {
  return (
    <div className="app">
      <Routes>
        <Route path="/board" element={<Board />} />
        <Route path="/create-game" element={<CreateGame />} />
      </Routes>
    </div>
  );
});

export default App;
