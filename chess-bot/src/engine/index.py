from chess import Board, PAWN, KNIGHT, BISHOP, ROOK, KING, QUEEN, WHITE, BLACK, Color, square_mirror, Move
from math import inf
from typing import Tuple
import random

KING_PTS = [0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0, -5,  -5, -5,  0, 0,
            0, 0, 10, -5,  -5, -5, 10, 0]

KING_END_PST  = [-50,-40,-30,-20,-20,-30,-40,-50,
                -30,-20,-10,  0,  0,-10,-20,-30,
                -30,-10, 20, 30, 30, 20,-10,-30,
                -30,-10, 30, 40, 40, 30,-10,-30,
                -30,-10, 30, 40, 40, 30,-10,-30,
                -30,-10, 20, 30, 30, 20,-10,-30,
                -30,-30,  0,  0,  0,  0,-30,-30,
                -50,-30,-30,-30,-30,-30,-30,-50]

QUEEN_PTS = [-20, -10, -10, -5, -5, -10, -10, -20,
             -10,   0,   0,  0,  0,   0,   0, -10,
             -10,   0,   5,  5,  5,   5,   0, -10,
              -5,   0,   5,  5,  5,   5,   0,  -5,
              -5,   0,   5,  5,  5,   5,   0,  -5,
             -10,   5,   5,  5,  5,   5,   0, -10,
             -10,   0,   5,  0,  0,   0,   0, -10,
             -20, -10, -10,  0,  0, -10, -10, -20]

ROOK_PTS = [10,  10,  10,  10,  10,  10,  10,  10,
            10,  10,  10,  10,  10,  10,  10,  10,
             0,   0,   0,   0,   0,   0,   0,   0,
             0,   0,   0,   0,   0,   0,   0,   0,
             0,   0,   0,   0,   0,   0,   0,   0,
             0,   0,   0,   0,   0,   0,   0,   0,
             0,   0,   0,  10,  10,   0,   0,   0,
             0,   0,   0,  10,  10,   5,   0,   0]

BISHOP_PTS = [0,   0,   0,   0,   0,   0,   0,   0,
              0,   0,   0,   0,   0,   0,   0,   0,
              0,   0,   0,   0,   0,   0,   0,   0,
              0,  10,   0,   0,   0,   0,  10,   0,
              5,   0,  10,   0,   0,  10,   0,   5,
              0,  10,   0,  10,  10,   0,  10,   0,
              0,  10,   0,  10,  10,   0,  10,   0,
              0,   0, -10,   0,   0, -10,   0,   0]

KNIGHT_PTS = [-5,  -5, -5, -5, -5, -5,  -5, -5,
              -5,   0,  0, 10, 10,  0,   0, -5,
              -5,   5, 10, 10, 10, 10,   5, -5,
              -5,   5, 10, 15, 15, 10,   5, -5,
              -5,   5, 10, 15, 15, 10,   5, -5,
              -5,   5, 10, 10, 10, 10,   5, -5,
              -5,   0,  0,  5,  5,  0,   0, -5,
              -5, -10, -5, -5, -5, -5, -10, -5]

PAWN_PTS = [ 0,   0,   0,   0,   0,   0,   0,   0,
            30,  30,  30,  40,  40,  30,  30,  30,
            20,  20,  20,  30,  30,  30,  20,  20,
            10,  10,  15,  25,  25,  15,  10,  10,
             5,   5,   5,  20,  20,   5,   5,   5,
             5,   0,   0,   5,   5,   0,   0,   5,
             5,   5,   5, -10, -10,   5,   5,   5,
             0,   0,   0,   0,   0,   0,   0,   0]

MATE_SCORE = 100_000_000

PIECE_VALUES = {
    PAWN: 100,
    KNIGHT: 300,
    BISHOP: 300,
    ROOK: 500,
    QUEEN: 900,
    KING: 0
}

PIECE_PTS = {
    PAWN: PAWN_PTS,
    ROOK: ROOK_PTS,
    KNIGHT: KNIGHT_PTS,
    BISHOP: BISHOP_PTS,
    QUEEN: QUEEN_PTS,
    KING: KING_PTS,
}

PHASE_WEIGHT = { KNIGHT: 1, BISHOP: 1, ROOK: 2, QUEEN: 4} 
TOTAL_PHASE = 24 

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