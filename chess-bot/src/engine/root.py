from engine.ordering import sorted_moves
from engine.search import minmax

from chess import Board, WHITE, BLACK, Move
from math import inf
import random

def generate_best_move(board: Board, depth: int, bot_color, margin = 15):
    bot_chess_color = WHITE if bot_color == "white" else BLACK
    scored: list[tuple[int, Move]] = []
    best_score = -inf
    for move in sorted_moves(board):
        board.push(move)
        score, _ = minmax(board, depth - 1, bot_chess_color, -inf, inf)
        board.pop()
        if score > best_score:
            best_score = score
        scored.append((int(score), move))
    print("Score is: ", score)
    candidate: list[Move] = [m for s, m in scored if s >= best_score - margin]
    return random.choice(candidate)
