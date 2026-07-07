import socketio
from schemas.schemas import GameInfo, On_state, On_fetch_board, Color
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

   async def fetch_board(self):
         await self.sio.emit("get-game", {"id": self.gameId})

   async def make_move(self):
     res = generate_best_move(self.board, self.depth, self.color)
     if res is None:
        return
     await self.sio.emit("make-move", {"id": self.gameId, "moveData": self.move_to_payload(res)})
   def move_to_payload(self, move: chess.Move):
      from_pos = {
            "row": chess.square_rank(move.from_square) + 1,
            "col": chess.square_file(move.from_square) + 1
         }
      to_pos = {
            "row": chess.square_rank(move.to_square) + 1,
            "col": chess.square_file(move.to_square) + 1
         }
      promotionPiece = None
      if move.promotion:
         promotionPiece = {
           chess.QUEEN: "queen", chess.ROOK: "rook",
           chess.BISHOP: "bishop", chess.KNIGHT: "knight",
       }[move.promotion]
      return {
         "from": from_pos,
         "to": to_pos,
         "highlightLastMove": {"from": from_pos, "to": to_pos},
         "promotionPiece": promotionPiece
      }
      
   def handleListeners(self):
      async def on_state(data: On_state):
         parsed = On_state.model_validate(data)
         from_square = chess.square(parsed.from_.col - 1, parsed.from_.row - 1)
         to_square = chess.square(parsed.to.col - 1, parsed.to.row - 1)
         promo = None
         moving_piece = self.board.piece_at(from_square)
         if (moving_piece and moving_piece.piece_type == chess.PAWN and 
             parsed.piece.pieceType != "pawn"):
            promo = {"queen": chess.QUEEN, "rook": chess.ROOK,
                "bishop": chess.BISHOP, "knight": chess.KNIGHT}[parsed.piece.pieceType]  
         self.board.push(chess.Move(from_square, to_square, promo))
         if parsed.piece.color != self.color:
            await self.make_move()  

      async def get_board(data: dict):
         parsed_data = On_fetch_board.model_validate(data)
         self.board = chess.Board(parsed_data.fen)
         if self.color == "white" and self.board.turn == True or self.color == "black" and self.board.turn == False:
            await self.make_move()
         
     
      async def on_resign(data):
          pass
         
      async def on_connect():
         print("Connected")
         await self.sio.emit("join-room", {"gameId": self.gameId})
         if not self._connected_once:
          self._connected_once = True
          print(f"Joined to room with id {self.gameId}")
         await self.fetch_board()

      async def on_error(err: dict):
          print("error: ", err)
          if "Unauthorized" in err.get("message", ""):
             await self.reconnect()

      self.sio.on("state", on_state)
      self.sio.on("game-state", get_board)
      self.sio.on("resign", on_resign) # Unsupported
      self.sio.on("connect", on_connect)
      self.sio.on("error", on_error)

   async def run(self):
     print("Try to handle listeners...")
     self.handleListeners()
     print("Try connecting to socket...")
     await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
     while True:
       await self.sio.wait()
       if not self._should_reconnect:
          break
       self._should_reconnect = False
       await self.sio.connect("http://backend:3030", auth={"token": await self.get_token()})
     
