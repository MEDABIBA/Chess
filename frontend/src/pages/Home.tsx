import { useState } from 'react';
import { useStore } from '../provider/context';
import { observer } from 'mobx-react-lite';

const Home = () => {
  const store = useStore();
  const { navigate, games } = store;
  const [friendCode, setFriendCode] = useState('');
  const [isError, setIsError] = useState(false);
  const allGames = games.getAllGames();
  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);
  const paginated =
    allGames.length > 0
      ? allGames.slice((page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE * page)
      : [];
  const totalPages = Math.ceil((allGames.length ?? 0) / ITEMS_PER_PAGE);
  return (
    <>
      <div className="backgound-image">
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
                  setIsError(false);
                }}
              />
              {isError && <div className="input-error">Error</div>}

              <button
                className="button"
                onClick={() => {
                  if (friendCode.length === 6) {
                    games.joinGameByCode(friendCode);
                  } else {
                    setIsError(true);
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
          <table className="home-table">
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
              {paginated?.length ? (
                paginated.map((game, key) => {
                  const isParticipant = games.isParticipant(game);
                  const date = Date.now() - new Date(game.createdAt).getTime();
                  const totalSeconds = Math.floor(date / 1000);
                  const minutes = Math.floor(totalSeconds / 60) % 60;
                  const hours = Math.floor(totalSeconds / 60 / 60) % 60;
                  return (
                    <tr key={key}>
                      <td>
                        {hours ? hours + 'h' : ''}{' '}
                        {minutes || hours
                          ? minutes + 'm'
                          : 'A couple of seconds'}{' '}
                        ago
                      </td>
                      <td>{game.initialTime / 60}:00</td>
                      <td>
                        {game.whitePlayerNickname} |{' '}
                        {game.blackPlayerNickname ?? '...'}
                      </td>
                      <td>{game.gameStatus}</td>
                      <td>
                        <button
                          className="connect-game-btn"
                          onClick={() => {
                            if (isParticipant) {
                              games.setCurrentGame(game.id);
                              navigate(`game/${game.id}`);
                            } else {
                              games.joinGame(game);
                            }
                          }}
                        >
                          {isParticipant ? 'Enter' : 'Join game'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td>There is no games yet</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
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
    </>
  );
};
export default observer(Home);
