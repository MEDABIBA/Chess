import human from '../../assets/human.png';
import robot from '../../assets/bot.png';
const BotSelector = ({
  bot,
  setBot,
}: {
  bot: boolean;
  setBot: React.Dispatch<boolean>;
}) => {
  return (
    <div className="selector">
      <button
        style={{ borderRadius: '13% 0 0 13%' }}
        className={`selector-item ${!bot ? 'selector-item-active' : null}`}
        onClick={() => setBot(false)}
      >
        <img className={`selector-left-img`} src={human} alt="human" />
      </button>
      <button
        style={{ borderRadius: '0 13% 13% 0' }}
        className={`selector-item ${bot ? 'selector-item-active' : null}`}
        onClick={() => setBot(true)}
      >
        <img
          style={{ transform: `translate(-52%, -3%)` }}
          className={`selector-right-img`}
          src={robot}
          alt="bot"
        />
      </button>
    </div>
  );
};
export default BotSelector;
