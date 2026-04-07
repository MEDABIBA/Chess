const GameButton = ({
  img,
  alt,
  setModal,
}: {
  img: string;
  alt: string;
  setModal: (boolean: boolean) => void;
}) => (
  <div
    className="game-btn"
    onClick={() => {
      setModal(true);
      return;
    }}
  >
    <img height={40} width={40} src={img} alt={alt} />
  </div>
);
export default GameButton;
