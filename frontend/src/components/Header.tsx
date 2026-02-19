import blackIcon from "../assets/icon-black.png";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";
const Header = observer(() => {
  const store = useStore();
  return (
    <section className="header">
      <img
        className="header-icon"
        src={blackIcon}
        alt="icon"
        onClick={() => {
          store.navigate("home");
        }}
      />
      <div className="nickname">Nickname: {store.getNickname() ?? "Not set"}</div>
    </section>
  );
});
export default Header;
