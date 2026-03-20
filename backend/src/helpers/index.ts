import { Chess } from 'chess.js';
import { Piece, SquareData } from '../types/board';
import { getCastlingRights } from './getCastlingRights';

const pieceTypeMap = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};

// Convert to chess fen notation (rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1)
export function boardToFen(
  board: SquareData[],
  currentPlayer: 'white' | 'black',
) {
  let fen = '';
  let emptyPieces = 0;
  for (let i = 0; i < board.length; i++) {
    const piece = board[i];
    if (piece.piece) {
      if (emptyPieces) {
        fen = fen + emptyPieces;
        emptyPieces = 0;
      }
      // White = uppercase, black = lowercase
      const p: (typeof pieceTypeMap)[keyof typeof pieceTypeMap] =
        piece.piece.color === 'black'
          ? pieceTypeMap[piece.piece.pieceType]
          : pieceTypeMap[piece.piece.pieceType].toUpperCase();
      fen = fen + p;
    } else {
      emptyPieces++;
    }
    if (piece.position.col === 8 && piece.position.row !== 1) {
      if (emptyPieces) {
        fen = fen + emptyPieces;
        emptyPieces = 0;
      }
      fen = fen + '/';
    }
  }

  if (emptyPieces) {
    fen = fen + emptyPieces;
  }

  fen += ` ${currentPlayer === 'white' ? 'w' : 'b'}`;
  fen += ` ${getCastlingRights(board)}`;
  fen += ' -';
  fen += ' 0 1';

  if (!new Chess(fen)) {
    console.log('Generated FEN is invalid');
    throw new Error('Generated FEN is invalid');
  }
  return fen;
}

function convertColor(row: number, col: number) {
  return (row + col) % 2 === 0 ? 'black' : 'white';
}

// Determine hasMoved from position + castling rights (can't get exact info from FEN)
function calculateHasMoved(
  pieceType: keyof typeof pieceTypeMap,
  color: 'white' | 'black',
  row: number,
  col: number,
  castling: string,
): boolean {
  if (pieceType === 'king') {
    if (color === 'white') {
      return (
        row !== 1 ||
        col !== 5 ||
        (!castling.includes('K') && !castling.includes('Q'))
      );
    } else {
      return (
        row !== 8 ||
        col !== 5 ||
        (!castling.includes('k') && !castling.includes('q'))
      );
    }
  }

  if (pieceType === 'rook') {
    if (color === 'white' && row === 1) {
      if (col === 1) return !castling.includes('Q');
      if (col === 8) return !castling.includes('K');
    }
    if (color === 'black' && row === 8) {
      if (col === 1) return !castling.includes('q');
      if (col === 8) return !castling.includes('k');
    }
  }

  if (pieceType === 'pawn') {
    if (color === 'white') return row !== 2;
    if (color === 'black') return row !== 7;
  }

  return true;
}

export function fenToBoard(fen: string): SquareData[] {
  const [position, , castling] = fen.split(' ');
  const res: SquareData[] = [];
  let row = 8; // FEN starts from row 8 going down
  let col = 1;

  position.split('').forEach((e: string) => {
    if (e === '/') {
      row--;
      col = 1;
      return;
    }

    if (!isNaN(Number(e))) {
      let emptyPieces = Number(e);
      while (emptyPieces > 0) {
        res.push({
          color: convertColor(row, col),
          position: { row, col },
          piece: null,
        });
        col++;
        emptyPieces--;
      }
      return;
    }

    const lowerChar = e.toLowerCase();
    const pieceKey = Object.keys(pieceTypeMap).find(
      (key) => pieceTypeMap[key] === lowerChar,
    ) as keyof typeof pieceTypeMap | undefined;
    let piece: Piece | null = null;
    if (pieceKey) {
      const color = e === e.toUpperCase() ? 'white' : 'black';
      const hasMoved = calculateHasMoved(pieceKey, color, row, col, castling);

      piece = {
        pieceType: pieceKey,
        color: color,
        position: { row, col },
        hasMoved: hasMoved,
      };
    }
    res.push({
      color: convertColor(row, col),
      position: { row, col },
      piece: piece,
    });
    col++;
  });

  return res;
}
