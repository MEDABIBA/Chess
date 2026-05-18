from schemas.schemas import GameInfo, GameId
from session import Session
import asyncio

class Manager:
    def __init__(self):
        self.sessions: dict[int, asyncio.Task] = {}
    
    def start_game(self, body: GameInfo):
        session = Session(body)
        self.sessions[body.gameId] = asyncio.create_task(session.run())

    def stop_game(self, gameId: GameId):
        task = self.sessions.pop(gameId.gameId, None)
        if task:
            task.cancel()
manager = Manager()