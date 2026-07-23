import { Color } from '../types/types';
import Timer from './Timer';

const PlayerWindow = ({
  color,
  additionalTime,
  isBotGame,
}: {
  color: Color;
  additionalTime: number;
  isBotGame: boolean;
}) =>
  !isBotGame && (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
      <Timer color={color} />
      {additionalTime ? `+${additionalTime}s` : ''}
    </div>
  );
export default PlayerWindow;
