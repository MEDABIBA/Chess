const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Convert to chess notation (1a)
export function toChessNotation(row: number, col: number): string {
  return files[col] + (row + 1);
}

// Convert from chess notation({row: 0, col: 0})
export function fromChessNotation(square): {row: number, col: number} {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const col = files.indexOf(square[0]);
  const row = parseInt(square[1]) - 1;
  return { row, col };
}