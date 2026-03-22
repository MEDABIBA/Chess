import { observer } from 'mobx-react-lite';
import { Navigate, Route, Routes } from 'react-router-dom';
import Board from './pages/Board';
import CreateGame from './pages/CreateGame';
import AuthForm from './pages/AuthForm';
import Home from './pages/Home';
import Header from './components/Header';
import { useStore } from './provider/context';
import { useEffect } from 'react';

const App = observer(() => {
  const store = useStore();
  const { games, navigate } = store;
  useEffect(() => {
    const activeGame = games.activeGame;
    if (activeGame) {
      games.setCurrentGame(activeGame);
      navigate(`game/${activeGame}`);
    }
  }, [games.activeGame]);

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
