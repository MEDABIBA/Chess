from chess import Board, Move
from constants import *

def mvv_lva(board: Board, move: Move) -> int:
    score = 0
    if move.promotion:
        score += 1000 + PIECE_VALUES[move.promotion]
    if board.is_capture(move):
        if board.is_en_passant(move):
            score += PIECE_VALUES[PAWN]
        else:
            victim = board.piece_at(move.to_square)
            attacker = board.piece_at(move.from_square)
            if victim and attacker:
                score += PIECE_VALUES[victim.piece_type] * 10 + PIECE_VALUES[attacker.piece_type]
    if board.is_castling(move):
        score += 600
    return score

def sorted_moves(board: Board):
    return sorted(board.legal_moves, key=lambda m: mvv_lva(board, m), reverse=True)