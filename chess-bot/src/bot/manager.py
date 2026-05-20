from schemas.schemas import GameInfo, GameId
from session import Session
import asyncio
import os
import httpx

class Manager:
    def __init__(self):
        self.username: str = os.environ["BOT_USERNAME"]
        self.password: str = os.environ["BOT_PASSWORD"]
        self.accessToken: str = ""
        self.sessions: dict[int, asyncio.Task] = {}
        self.http = httpx.AsyncClient()

    async def get_access_token(self):
        res = await self.http.post("/auth/login", json={"username": self.username, "password": self.password})
        data = res.json()["accessToken"]
        self.accessToken = data
    
    async def start_game(self, body: GameInfo):
        await self.get_access_token()
        session = Session(body, self.accessToken)
        self.sessions[body.gameId] = asyncio.create_task(session.run())

    def stop_game(self, gameId: GameId):
        task = self.sessions.pop(gameId.gameId, None)
        if task:
            task.cancel()
manager = Manager()