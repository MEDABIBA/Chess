from chess import Board, Color, square_mirror
from constants import *
from pst_data import *

def game_phase(board: Board):
    current_phase = sum(w * len(board.pieces(piece_type, True )) + w * len(board.pieces(piece_type, False )) for piece_type, w in PHASE_WEIGHT.items())
    return min(TOTAL_PHASE, current_phase)

def king_pst_score(idx, mg, eg):
    return int(KING_PTS[idx] * mg + KING_END_PST[idx] * eg)

def evaluate(board: Board, color: Color) -> int:
    opponent_chess_notation_color = not color
    score = 0
    phase = game_phase(board)
    mg = phase / TOTAL_PHASE
    eg = 1 - mg

    for piece_type, value in PIECE_VALUES.items():
        pst = PIECE_PTS[piece_type]
        for square in board.pieces(piece_type, color):
            idx = square_mirror(square) if color else square
            score += pst[idx] if piece_type != KING else king_pst_score(idx, mg ,eg)
        for square in board.pieces(piece_type, opponent_chess_notation_color):
            idx = square_mirror(square) if opponent_chess_notation_color else square
            score -= pst[idx] if piece_type != KING else king_pst_score(idx, mg ,eg)

        score += len(board.pieces(piece_type, color)) * value
        score -= len(board.pieces(piece_type, opponent_chess_notation_color)) * value
    return score