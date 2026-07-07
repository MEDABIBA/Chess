from typing import Literal
from pydantic import BaseModel, Field

Color = Literal['white', 'black']
PieceType = Literal['pawn','rook', 'knight', 'bishop', 'queen', 'king']
class Position(BaseModel):
  row: int
  col: int

class Piece(BaseModel):
  pieceType: PieceType
  color: Color
  position: Position
  hasMoved: bool

class SquareData(BaseModel):
    color: Color
    position: Position
    piece: Piece | None

class GameInfo(BaseModel):
    gameId: int
    color: Color
    depth: int = Field(ge=1, le=5)

class GameId(BaseModel):
   gameId: int

class On_state(BaseModel):
  from_: Position = Field(alias="from")
  to: Position
  piece: Piece


class On_fetch_board(BaseModel):
   fen: str
