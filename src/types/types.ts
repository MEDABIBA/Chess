
export interface Position {
    row: number,
    col: number
}

export type Color = 'white' | 'black'

export enum PieceType {
    PAWN = 'pawn',
    ROOK = 'rook',
    KNIGHT = 'knight',
    BISHOP = 'bishop',
    QUEEN = 'queen',
    KING = 'king'
}

export type SquareData = {
    color: Color,
    position: Position
}