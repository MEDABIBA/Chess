from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from bot.manager import manager
from schemas.schemas import GameInfo, GameId

app = FastAPI()

@app.get("/")
def read_root():
    return {"Info": "Chess bot"}


@app.post("/start-bot-game")
async def start_bot_game(body: GameInfo):
    await manager.start_game(body=body)

@app.post("/stop-bot-game")
def stop_bot_game(gameId: GameId):
    manager.stop_game(gameId=gameId)