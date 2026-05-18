from typing import Literal
from pydantic import BaseModel, Field

Color = Literal['white', 'black']
PieceType = Literal['pawn','rook', 'knight', 'bishop', 'queen', 'king']
class Position:
  row: int
  col: int

class Piece(BaseModel):
  pieceType: PieceType
  color: Color
  position: Position
  hasMoved: bool

class Move(BaseModel):
    color: Color
    position: Position
    piece: Piece | None

class GameInfo(BaseModel):
    gameId: int
    color: Color
    level: int = Field(ge=1, le=5)

class GameId(BaseModel):
   gameId: int


