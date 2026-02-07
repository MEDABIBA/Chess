import { observer } from "mobx-react-lite";
import { Navigate, Route, Routes } from "react-router-dom";
import Board from "./pages/Board";
import CreateGame from "./pages/CreateGame";
import AuthForm from "./pages/AuthForm";
import Home from "./pages/Home";
import Header from "./components/Header";

const App = observer(() => {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="home" />} />
        <Route path="/game/:id" element={<Board />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/registration-form" element={<AuthForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
});

export default App;
