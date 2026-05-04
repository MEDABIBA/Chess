import { useState } from 'react';
import { useStore } from '../provider/context';
import { observer } from 'mobx-react-lite';
import notify from '../components/ui/notify';
import Header from '../components/Header';

const Home = () => {
  const store = useStore();
  enum filters {
    all = '0',
    active = '1',
    waiting = '2',
    archive = '3',
  }
  const { navigate, games } = store;
  const [filter, setFilter] = useState<keyof typeof filters>('all');
  const [friendCode, setFriendCode] = useState('');
  const [animClass, setAnimClass] = useState<'slide-left' | 'slide-right'>(
    'slide-left',
  );
  const allGames = games.getAllGames();
  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);
  const filteredGames = allGames.filter(
    (game) =>
      filter === 'all' ||
      (filter === 'active' && game.gameStatus === 'playing') ||
      (filter === 'waiting' && game.gameStatus === 'waiting') ||
      (filter === 'archive' && game.isFinished()),
  );
  const paginated =
    filteredGames.length > 0
      ? filteredGames.slice((page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE * page)
      : [];
  const totalPages = Math.ceil((filteredGames.length ?? 0) / ITEMS_PER_PAGE);
  return (
    <>
      <div className="backgound-image">
        <Header />
        <div className="container">
          <section className="home">
            <div className="home-buttons">
              <div className="home-input-wrapper">
                <input
                  className="home-input"
                  type="text"
                  value={friendCode}
                  placeholder="Enter friend code"
                  onChange={(el) => {
                    setFriendCode(el.target.value);
                  }}
                />

                <button
                  className="button"
                  onClick={() => {
                    if (friendCode.length === 6) {
                      games.joinGameByCode(friendCode);
                    } else {
                      notify('Game code must be 6 symbols!', 'error');
                    }
                  }}
                >
                  Find game!
                </button>
              </div>
              <button
                className="home-button"
                onClick={() => navigate('/create-game')}
              >
                Create game!
              </button>
            </div>
            <div className="filter">
              <span className="filter-title">FILTER: </span>
              {(
                [
                  'all',
                  'active',
                  'waiting',
                  'archive',
                ] as (keyof typeof filters)[]
              ).map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (filters[filter] > filters[f]) {
                      setAnimClass('slide-left');
                    } else if (filters[filter] < filters[f]) {
                      setAnimClass('slide-right');
                    }
                    setFilter(f);
                  }}
                  className={`${filter === f ? 'filter-btn-active' : 'filter-btn'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ overflow: 'auto' }}>
              {paginated?.length ? (
                <table key={filter} className={`home-table ${animClass}`}>
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Timer</th>
                      <th>Nicknames</th>
                      <th>Game status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((game, key) => {
                      const isParticipant = games.isParticipant(game);
                      const date =
                        Date.now() - new Date(game.createdAt).getTime();
                      const totalSeconds = Math.floor(date / 1000);
                      const minutes = Math.floor(totalSeconds / 60) % 60;
                      const hours = Math.floor(totalSeconds / 3600) % 24;
                      const days = Math.floor(totalSeconds / 3600 / 24);
                      return (
                        <tr key={key}>
                          <td>
                            {days > 0 ? (
                              <>
                                {days + `${days > 1 ? ' days ' : ' day '}`}
                                {hours ? hours + 'h ' : ''}
                                ago
                              </>
                            ) : (
                              <>
                                {hours > 0 ? hours + 'h ' : ''}
                                {minutes > 0
                                  ? minutes + 'm '
                                  : hours > 0
                                    ? ''
                                    : 'A couple of seconds '}
                                ago
                              </>
                            )}
                          </td>

                          <td>
                            {game.initialTime / 60}
                            {game.additionalTime
                              ? `+${game.additionalTime}`
                              : `:00`}
                          </td>
                          <td>
                            {game.whitePlayerNickname} |
                            {game.blackPlayerNickname ?? '...'}
                          </td>
                          <td>{game.gameStatus}</td>
                          <td>
                            <button
                              className="connect-game-btn"
                              onClick={() => {
                                if (isParticipant) {
                                  navigate(`game/${game.id}`);
                                } else if (
                                  !game.blackPlayerNickname ||
                                  !game.whitePlayerNickname
                                ) {
                                  games.joinGame(game);
                                } else {
                                  navigate(`game/${game.id}`);
                                }
                              }}
                            >
                              {isParticipant
                                ? 'Enter'
                                : game.blackPlayerNickname &&
                                    game.whitePlayerNickname
                                  ? 'Watch'
                                  : 'Join'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <h2>There is no games:"</h2>
              )}
            </div>
            <div className="pagination">
              {totalPages > 1 && (
                <>
                  <button
                    className="button"
                    onClick={() => {
                      if (page < 2) return;
                      setPage(page - 1);
                    }}
                  >
                    Prev
                  </button>
                  <span>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="button"
                    onClick={() => {
                      if (page >= totalPages) return;
                      setPage(page + 1);
                    }}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
export default observer(Home);
