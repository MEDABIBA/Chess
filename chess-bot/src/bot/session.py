from schemas.schemas import GameInfo

class Session:
    def __init__(self, body: GameInfo):
      self.gameId = body.gameId
      self.color = body.color
      self.level = body.level

    async def run(self):
    #   socket connection here
      return
