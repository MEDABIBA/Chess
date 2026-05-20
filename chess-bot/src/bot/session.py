import socketio
from schemas.schemas import GameInfo

class Session:
    def __init__(self, body: GameInfo, accessToken: str):
      self.sio = socketio.AsyncClient()
      self.gameId = body.gameId
      self.color = body.color
      self.level = body.level
      self.accessToken = accessToken

    def handleListeners(self):
      async def on_state(data):
          pass
      self.sio.on("state", on_state)
      
    async def run(self):
      await self.sio.connect("http://backend:3030", auth={"token": self.accessToken})
      self.handleListeners()
      await self.sio.wait()
      
