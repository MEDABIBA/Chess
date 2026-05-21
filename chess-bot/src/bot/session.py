import socketio
from schemas.schemas import GameInfo
from typing import Callable, Awaitable


class Session:
    def __init__(self, body: GameInfo, get_token: Callable[[], Awaitable[str]]):
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
      async def make_move(data):
          pass
      
      async def on_resign(data):
          pass
      
      async def on_error(err: dict):
          if "Unauthorized" in err.get("message", ""):
             await self.reconnect()
             
      self.sio.on("make-move", make_move)
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
      
