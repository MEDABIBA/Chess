import Piece from '../models/Piece';
import { useStore } from '../provider/context';
import { Color, Position, PropotionPieceType } from '../types/types';

type Promotion = {
  from: Position;
  to: Position;
  color: Color;
};
const PromotionPiece = ({
  from,
  to,
  piece,
}: {
  from: Position;
  to: Position;
  piece: Piece;
}) => {
  const store = useStore();
  return (
    <img
      className={`piece-img`}
      src={piece.getPiece()}
      alt="#"
      draggable={false}
      onPointerDown={(e) => {
        e.preventDefault();
        if (
          (e.pointerType === 'touch' || e.pointerType === 'mouse') &&
          store.games.currentGame
        ) {
          const pending = store.games.currentGame.pendingPromotionPiece;
          if (!pending) return;

          const isPremove =
            store.games.currentGame.currentPlayer !==
            store.games.currentGame.yourColor;

          if (isPremove) {
            store.games.currentGame.setPendingPremove({
              from,
              to,
              promotionPiece: piece.pieceType,
            });
            console.log(store.games.currentGame?.pendingPremove);

            store.games.currentGame.setPendingPromotionPiece(null);
          } else {
            store.games.currentGame.setPendingPromotionPiece({
              piece,
              from,
              to,
              color: piece.color,
            });
            store.games.currentGame.makeMove(from, to, false);
            store.games.currentGame.setPendingPromotionPiece(null);
          }
        }
      }}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    />
  );
};
const PromotionPicker = ({ from, to, color }: Promotion) => {
  const pos = {
    left: `${(color == 'white' ? to.col - 1 : 8 - to.col) * 12.5}%`, // alignment
    top: `${(color === 'white' ? to.row === 8 : to.row === 1) ? 0 : 49.7}%`, // alignment
  };
  return (
    <div className="promotion-window" style={pos}>
      {PropotionPieceType.map((el, i) => {
        const piece = new Piece(el, to, color);
        return (
          <div className={'square propotion-square'} key={i}>
            <PromotionPiece from={from} to={to} piece={piece} />
          </div>
        );
      })}
    </div>
  );
};
export default PromotionPicker;
