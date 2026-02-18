import blackIcon from "../assets/icon-black.png";
import { useStore } from "../provider/context";
import { observer } from "mobx-react-lite";
const Header = observer(() => {
  const { navigate, getNickname } = useStore();
  return (
    <section className="header">
      <img
        className="header-icon"
        src={blackIcon}
        alt="icon"
        onClick={() => {
          navigate("home");
        }}
      />
      <div className="nickname">Nickname: {getNickname ?? "Not set"}</div>
    </section>
  );
});
export default Header;
