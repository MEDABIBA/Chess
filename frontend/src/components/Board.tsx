import maybeReverse from '../helpers/maybeReverse';
import Piece from '../models/Piece';
import { useStore } from '../provider/context';
import PromotionPicker from './PromotionPicker';
import Square from './Square';
import { observer } from 'mobx-react-lite';

const Board = observer(() => {
  const store = useStore();
  const { games, chessMoveValidator } = store;
  const { currentGame: game } = games;
  if (game === null) return;
  const { availableMovesSet } = game;
  const whiteKingUnerAttack = chessMoveValidator.isKingUnderAttack('white');
  const blackKingUnerAttack = chessMoveValidator.isKingUnderAttack('black');
  const grab = game.getGrab();
  return (
    <>
      <div className="board">
        <div className="numeration">
          {maybeReverse(
            [1, 2, 3, 4, 5, 6, 7, 8],
            game.blackPlayerNickname === store.getNickname(), // useStore because of loss of context (this)
          ).map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
        <div className="alphanumeric-numbering">
          {maybeReverse(
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            game.blackPlayerNickname === store.getNickname(), // useStore because of loss of context (this)
          ).map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
        {store.games.currentGame &&
          store.games.currentGame.pendingPromotionPiece &&
          !store.games.currentGame.pendingPremove && (
            <PromotionPicker
              from={store.games.currentGame.pendingPromotionPiece.from}
              to={store.games.currentGame.pendingPromotionPiece.to}
              color={store.games.currentGame.pendingPromotionPiece.color}
            />
          )}
        {maybeReverse(
          game.board,
          game.blackPlayerNickname === store.getNickname(), // useStore because of loss of context (this)
        ).map(({ color, position, piece }) => {
          const grabbed =
            grab?.col === position.col && grab.row === position.row;
          const isLastMove =
            game.highlightLastMove &&
            'from' in game.highlightLastMove &&
            'to' in game.highlightLastMove &&
            ((game.highlightLastMove?.from.col === position.col &&
              game.highlightLastMove?.from.row === position.row) ||
              (game.highlightLastMove?.to.col === position.col &&
                game.highlightLastMove?.to.row === position.row))
              ? 'last-move'
              : '';
          const isActiveField =
            availableMovesSet.has(`${position.row}-${position.col}`) &&
            game.board.find((el) => el.position === position)?.piece !== null
              ? 'square-attack'
              : availableMovesSet.has(`${position.row}-${position.col}`)
                ? 'square-active'
                : '';
          const activePiece = game.activePiece;
          const premove = !game.pendingPremove
            ? ''
            : game.pendingPremove.from.col === position.col &&
                game.pendingPremove.from.row === position.row
              ? 'square-premove-from'
              : game.pendingPremove.to.col === position.col &&
                  game.pendingPremove.to.row === position.row
                ? 'square-premove-to'
                : '';
          const premovePiece =
            game.pendingPremove &&
            game.pendingPremove.from.col === position.col &&
            game.pendingPremove.from.row === position.row
              ? null
              : game.pendingPremove &&
                  game.pendingPremove.to.col === position.col &&
                  game.pendingPremove.to.row === position.row
                ? game.pendingPremove.promotionPiece
                  ? new Piece(
                      game.pendingPremove.promotionPiece,
                      position,
                      game.yourColor ?? 'white',
                    )
                  : game.getPiece(game.pendingPremove.from)
                : piece;
          return (
            <Square
              key={`${position.row}-${position.col}`}
              color={color}
              position={position}
              piece={premovePiece}
              isLastMove={isLastMove}
              isActiveField={isActiveField}
              activePiece={activePiece}
              premove={premove}
              hightlightKingAttacked={
                piece?.color === 'white' && piece.pieceType === 'king'
                  ? whiteKingUnerAttack
                  : piece?.color === 'black' && piece.pieceType === 'king'
                    ? blackKingUnerAttack
                    : false
              }
              grabbed={grabbed}
              animationTarget={
                game.animateMove &&
                game.animateMove.from.col === position.col &&
                game.animateMove.from.row === position.row
                  ? game.animateMove
                  : null
              }
            />
          );
        })}
      </div>
    </>
  );
});

export default Board;
