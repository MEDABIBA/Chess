import socketio
from schemas.schemas import GameInfo, On_state
from typing import Callable, Awaitable
import chess


class Session:    
    def __init__(self, body: GameInfo, get_token: Callable[[], Awaitable[str]]):
      self.board = chess.Board()
      self.sio = socketio.AsyncClient()
      self.gameId = body.gameId
      self.color = body.color
      self.level = body.level
      self.get_token = get_token
      self._should_reconnect = False
      
    async def reconnect(self):
         self._should_reconnect = True
         await self.sio.disconnect()

    def handleListeners(self):
      async def on_state(data: On_state):
          parsed = On_state.model_validate(data)
          from_square = chess.square(parsed.from_.col, parsed.from_.row)
          to_square = chess.square(parsed.to.col, parsed.to.row)
          promo = None
          moving_piece = self.board.piece_at(from_square)
          if (moving_piece and moving_piece.piece_type == chess.PAWN and 
              parsed.piece.pieceType != "pawn"):
             promo = {"queen": chess.QUEEN, "rook": chess.ROOK,
                 "bishop": chess.BISHOP, "knight": chess.KNIGHT}[parsed.piece.pieceType]
          self.board.push(chess.Move(from_square, to_square, promo))          
      
      async def on_resign(data):
          pass
      
      async def on_error(err: dict):
          if "Unauthorized" in err.get("message", ""):
             await self.reconnect()
             
      self.sio.on("state", on_state)
      self.sio.on("resign", on_resign)
      self.sio.on("error", on_error)
      
    async def run(self):
      await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
      self.handleListeners()
      while True:
        await self.sio.wait()
        if not self._should_reconnect:
           break
        self._should_reconnect = False
        await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
      
