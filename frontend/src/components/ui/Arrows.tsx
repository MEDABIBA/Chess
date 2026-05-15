import Game from '../../models/Game';
import { Position } from '../../types/types';

const Arrows = ({
  game,
  isFlipped,
  previewArrow,
}: {
  game: Game;
  isFlipped: boolean;
  previewArrow: { from: Position; to: Position } | null;
}) => {
  const arrows = [
    ...game.annotations.arrows,
    ...(previewArrow ? [previewArrow] : []),
  ];
  return arrows.map((arrow, i) => {
    const fromCol = isFlipped ? 9 - arrow.from.col : arrow.from.col;
    const fromRow = isFlipped ? 9 - arrow.from.row : arrow.from.row;
    const toCol = isFlipped ? 9 - arrow.to.col : arrow.to.col;
    const toRow = isFlipped ? 9 - arrow.to.row : arrow.to.row;

    const x1 = fromCol + 0.5 - 1;
    const y1 = 8 - fromRow + 0.5;
    const x2 = toCol + 0.5 - 1;
    const y2 = 8 - toRow + 0.5;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const x2t = x2 - (dx / len) * 0.3;
    const y2t = y2 - (dy / len) * 0.3;

    return (
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 20,
        }}
        viewBox="0 0 8 8"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="2"
            markerHeight="2"
            refX="0.2"
            refY="1"
            orient="auto"
          >
            <polygon points="0 0, 2 1, 0 2" fill="forestgreen" />
          </marker>
        </defs>

        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2t}
          y2={y2t}
          stroke="forestgreen"
          strokeWidth="0.18"
          markerEnd="url(#arrowhead)"
        />
      </svg>
    );
  });
};
export default Arrows;
