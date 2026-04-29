const GameButton = ({
  img,
  text,
  setModal,
}: {
  img: string;
  text: string;
  setModal: (boolean: boolean) => void;
}) => {
  const xy = window.innerWidth > 768 ? 24 : 18;
  return (
    <div
      className="game-btn"
      title={text}
      onClick={() => {
        setModal(true);
        return;
      }}
    >
      <img height={xy} width={xy} src={img} alt={text} />
    </div>
  );
};
export default GameButton;
