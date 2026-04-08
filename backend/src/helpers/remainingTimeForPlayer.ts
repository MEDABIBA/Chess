import { Color } from 'src/types/board';

export default function remaningTimeForPlayer(game, player: Color) {
  if (game.currentPlayer === player) {
    return game.gameStatus === 'playing' && game.whiteTurnStarterAt
      ? Math.max(
          0,
          Math.floor(
            game.whiteTimeLeft -
              (Date.now() - game.whiteTurnStarterAt.getTime()) / 1000,
          ),
        )
      : Math.floor(game.whiteTimeLeft);
  } else if (game.currentPlayer === player) {
    return game.gameStatus === 'playing' && game.blackTurnStarterAt
      ? Math.max(
          0,
          Math.floor(
            game.blackTimeLeft -
              (Date.now() - game.blackTurnStarterAt.getTime()) / 1000,
          ),
        )
      : Math.floor(game.blackTimeLeft);
  } else {
    return Math.floor(game[`${player}TimeLeft`]);
  }
}
