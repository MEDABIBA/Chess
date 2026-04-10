const GameButton = ({
  img,
  text,
  setModal,
}: {
  img: string;
  text: string;
  setModal: (boolean: boolean) => void;
}) => (
  <div
    className="game-btn"
    title={text}
    onClick={() => {
      setModal(true);
      return;
    }}
  >
    <img height={25} width={25} src={img} alt={text} />
  </div>
);
export default GameButton;
