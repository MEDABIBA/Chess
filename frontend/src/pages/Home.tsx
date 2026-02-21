import { useState } from "react";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";

const Home = () => {
  const store = useStore();
  const { navigate, games } = store;
  const [friendCode, setFriendCode] = useState("");
  const [isError, setIsError] = useState(false);
  const allGames = games.getAllGames();
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
                className="home-input-button"
                onClick={() => {
                  if (friendCode.length === 6) {
                    games.joinGameByCode(friendCode);
                  } else {
                    setIsError(true);
                  }
                }}>
                Find game!
              </button>
            </div>
            <a href="create-game" className="home-button">
              Create game!
            </a>
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
              {allGames?.length ? (
                allGames?.map((game, key) => {
                  const isParticipant = games.isParticipant(game);
                  const date = Date.now() - new Date(game.createdAt).getTime();
                  const totalSeconds = Math.floor(date / 1000);
                  const minutes = Math.floor(totalSeconds / 60) % 60;
                  const hours = Math.floor(totalSeconds / 60 / 60) % 60;
                  return (
                    <tr key={key}>
                      <td>
                        {hours ? hours + "h" : ""}{" "}
                        {minutes || hours ? minutes + "m" : "A couple of seconds"} ago
                      </td>
                      <td>{game.initialTime / 60}:00</td>
                      <td>
                        {game.whitePlayer?.username} | {game.blackPlayer?.username ?? "..."}
                      </td>
                      <td>{game.gameStatus}</td>
                      <td>
                        <button
                          className="connect-game-btn"
                          onClick={() => {
                            if (isParticipant) {
                              navigate(`game/${game.id}`);
                            } else {
                              games.joinGame(game);
                            }
                          }}>
                          {isParticipant ? "Enter" : "Join game"}
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
        </section>
      </div>
    </>
  );
};
export default observer(Home);
