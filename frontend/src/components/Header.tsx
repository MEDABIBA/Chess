import blackIcon from "../assets/icon-black.png";
import { useStore } from "../provider/context";
const Header = () => {
  const { navigate } = useStore();
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
      <div>nickname</div>
    </section>
  );
};
export default Header;
