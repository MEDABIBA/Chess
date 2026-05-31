const BotSelector = ({
  bot,
  setBot,
}: {
  bot: boolean;
  setBot: React.Dispatch<boolean>;
}) => {
  return (
    <div className="select-bot">
      <button
        style={{ borderRadius: '13% 0 0 13%' }}
        className="color-selector-item"
        onClick={() => setBot(true)}
      ></button>
      <button
        style={{ borderRadius: '0 13% 13% 0' }}
        className="color-selector-item"
        onClick={() => setBot(false)}
      ></button>
    </div>
  );
};
export default BotSelector;
