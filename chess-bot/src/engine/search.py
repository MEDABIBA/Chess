from engine.constants import *
from engine.evaluation import evaluate
from engine.ordering import sorted_moves

from chess import Board, Color, Move
from math import inf
from typing import Tuple

def quiescence_search(board: Board, bot_color: Color, alpha, beta) -> int:
    if board.is_checkmate():
        if board.turn == bot_color:
            return -MATE_SCORE
        else:
            return MATE_SCORE
    if board.is_stalemate() or board.is_insufficient_material():
        return 0

    stand_pat = evaluate(board, bot_color)
    best = stand_pat

    if stand_pat >= beta: 
        return beta

    # for move in sorted_moves(board):
    for move in board.generate_legal_captures():
         if bot_color == board.turn:
             board.push(move)
             score = quiescence_search(board, bot_color, alpha, beta)
             board.pop()
             if score >= best:
                 best = score
                 alpha = max(alpha, best)
             if alpha >= beta:
                 break
         else:
             if stand_pat <= alpha:
                 return stand_pat
             board.push(move)
             score = quiescence_search(board, bot_color, alpha, beta)
             board.pop()
             if score < best:
                 best = score
             beta = min(beta, best)
             if alpha >= beta:
                 return best
    return best

def minmax(board: Board, depth: int, bot_color: Color, alpha, beta) -> Tuple[float | int, Move | None]:
    if board.is_checkmate():
        if board.turn == bot_color:
            return (-MATE_SCORE - depth, None)
        else:
            return (MATE_SCORE + depth, None)
    if board.is_stalemate() or board.is_insufficient_material():
        return (0, None)
    if depth == 0 and board.is_check():
        depth = 1
    if depth == 0:
        return (quiescence_search(board, bot_color, alpha, beta), None)
    if bot_color == board.turn:
        best_score = -inf
        best_move = None
        for move in sorted_moves(board):
            board.push(move)
            minmax_score, _ =  minmax(board,depth - 1,bot_color, alpha, beta)
            if best_score < minmax_score:
                best_move = move
                best_score = minmax_score
            board.pop()
            alpha = max(alpha, best_score)
            if alpha >= beta:
                break
        return (best_score, best_move)
    else:
        best_score = inf
        best_move = None      
        for move in sorted_moves(board):
            board.push(move)
            minmax_score, _ =  minmax(board,depth - 1,bot_color, alpha, beta)
            if best_score > minmax_score:
                best_move = move
                best_score = minmax_score
            board.pop()
            beta = min(beta, best_score)
            if alpha >= beta:
                break
        return (best_score, best_move)