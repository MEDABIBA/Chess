import { observer } from "mobx-react-lite";
import { Route, Routes } from "react-router-dom";
import Board from "./pages/Board";
import CreateGame from "./pages/CreateGame";
import AuthForm from "./pages/AuthForm";

const App = observer(() => {
  return (
    <div className="app">
      <Routes>
        <Route path="/game/:id" element={<Board />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/registration-form" element={<AuthForm />} />
      </Routes>
    </div>
  );
});

export default App;
