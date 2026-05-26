import socketio
from schemas.schemas import GameInfo, On_state, Color
from engine.index import generate_best_move
from typing import Callable, Awaitable
import chess


class Session:    
    def __init__(self, body: GameInfo, get_token: Callable[[], Awaitable[str]]):
      self.board = chess.Board()
      self.sio = socketio.AsyncClient()
      self.gameId = body.gameId
      self.color: Color = body.color
      self.depth = body.depth
      self.get_token = get_token
      self._should_reconnect = False
      self._connected_once = False
      
    async def reconnect(self):
         self._should_reconnect = True
         await self.sio.disconnect()

    async def make_move(self):
       res = generate_best_move(self.board, self.depth, self.color)
        # socket emit to backend

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
          if parsed.piece.color != self.color:
             await self.make_move()  
      
      async def on_resign(data):
          pass
      
      async def on_connect():
        if not self._connected_once:
          self._connected_once = True
          if self.color == "white":
             await self.make_move()

      async def on_error(err: dict):
          if "Unauthorized" in err.get("message", ""):
             await self.reconnect()
             
      self.sio.on("state", on_state)
      self.sio.on("resign", on_resign)
      self.sio.on("connect", on_connect)
      self.sio.on("error", on_error)
      
    async def run(self):
      self.handleListeners()
      await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
      while True:
        await self.sio.wait()
        if not self._should_reconnect:
           break
        self._should_reconnect = False
        await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
      
