from schemas.schemas import GameInfo, GameId
from bot.session import Session
from datetime import datetime
import asyncio
import os
import httpx
import base64, json
from chess import Board



class Manager:
    def __init__(self):
        self.username: str = os.environ["BOT_USERNAME"]
        self.password: str = os.environ["BOT_PASSWORD"]
        self.access_token: str = ""
        self.refresh_token: str = ""
        self.sessions: dict[int, asyncio.Task] = {}
        self.http = httpx.AsyncClient()
        self.lock = asyncio.Lock()

    async def login(self):
        try:
            print("login into system")
            res = await self.http.post("http://backend:3030/auth/login", json={"username": self.username, "password": self.password})
            self.access_token: str = res.json()["accessToken"]
            self.refresh_token = res.cookies["refreshToken"]

        except Exception as e:
            print("Error while loggining system:", e)
            raise 

    def _is_token_valid(self) -> bool:
        if not self.access_token:
            return False
        payload = self.access_token.split(".")[1]
        payload += "=" * (4 - len(payload) % 4)  # base64 padding
        data = json.loads(base64.b64decode(payload))
        return datetime.fromtimestamp(data["exp"]) > datetime.now()

    async def get_token(self):
        print("get token func")
        if self._is_token_valid():
            return self.access_token
        async with self.lock:
            if self._is_token_valid():
                return self.access_token
            if self.refresh_token:
                res = await self.http.post("http://backend:3030/auth/refresh", cookies={"refreshToken": self.refresh_token})
                data: str = res.json()["accessToken"]
                self.access_token = data
                return data
            else:
                await self.login()
                return self.access_token
    
    async def start_game(self, body: GameInfo):
        session = Session(body, self.get_token)
        print("start new session", body.gameId)
        try:
            self.sessions[body.gameId] = asyncio.create_task(session.run())
            print("Task created successfully")
        except Exception as e:
            print("Error creating task", e)
            raise

    def stop_game(self, gameId: GameId):
        task = self.sessions.pop(gameId.gameId, None)
        if task:
            task.cancel()
manager = Manager()