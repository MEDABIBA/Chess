import { matchPath, useLocation } from 'react-router-dom';
import blackIcon from '../assets/icon-black.png';
import { useStore } from '../provider/context';
import { observer } from 'mobx-react-lite';
const Header = observer(() => {
  const store = useStore();
  const location = useLocation();
  const match = matchPath('/game/:id', location.pathname);
  const { currentGame: game } = store.games;
  const showInviteCode =
    match?.params.id &&
    game?.inviteCode &&
    game?.whitePlayerNickname === store.getNickname() &&
    game?.blackPlayerNickname === null;
  const { canNavigate } = store;
  return (
    <section className="header">
      <img
        className="header-icon"
        src={blackIcon}
        alt="icon"
        onClick={() => {
          if (canNavigate) {
            store.games.currentGame = null;
            store.navigate('home');
          }
        }}
      />
      <div>
        <div className="nickname">
          Nickname: {store.getNickname() ?? 'Not set'}
        </div>
        {showInviteCode && (
          <div>Invite your friend by this code: {game.inviteCode}</div>
        )}
      </div>
    </section>
  );
});
export default Header;
