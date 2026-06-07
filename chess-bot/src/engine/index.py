from chess import Board, PAWN, KNIGHT, BISHOP, ROOK, KING, QUEEN, WHITE, BLACK, Color, square_mirror
from math import inf

KING_PTS = [0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0,  0,   0,  0,  0, 0,
            0, 0,  0, -5,  -5, -5,  0, 0,
            0, 0, 10, -5,  -5, -5, 10, 0]

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

# KING_MIDDLE_PST
# KING_END_PST 

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

def generate_best_move(board: Board, depth: int, bot_color):
    best_move = None
    best_score = -inf
    for move in board.legal_moves:
        board.push(move)
        bot_chess_color = WHITE if bot_color == "white" else BLACK
        score = minmax(board, depth, bot_chess_color, -inf, inf)
        board.pop()
        if score > best_score:
            best_score = score
            best_move = move
    return best_move
        
def minmax(board: Board, depth: int, bot_color: Color, alpha, beta) -> float:
    if board.is_checkmate():
        if board.turn == bot_color:
            return -MATE_SCORE - depth
        else:
            return MATE_SCORE -+ depth
    if board.is_stalemate() or board.is_insufficient_material():
        return 0
    if depth == 0:
        return evaluate(board, bot_color)
    if bot_color == board.turn:
        best = -inf
        for move in board.legal_moves:
            board.push(move)
            best = max(best, minmax(board,depth - 1,bot_color, alpha, beta))
            board.pop()
            alpha = max(alpha, best)
            if alpha >= beta:
                break
        return best
    else:
        best = inf
        for move in board.legal_moves:
            board.push(move)
            best = min(best, minmax(board,depth - 1,bot_color, alpha, beta))
            board.pop()
            beta = min(beta, best)
            if alpha >= beta:
                break
        return best

def evaluate(board: Board, color: Color) -> int:
    opponent_chess_notation_color = not color
    score = 0
    for piece_type, value in PIECE_VALUES.items():
        pst = PIECE_PTS[piece_type]
        for square in board.pieces(piece_type, color):
            idx = square_mirror(square) if color else square
            score += pst[idx]
        for square in board.pieces(piece_type, opponent_chess_notation_color):
            idx = square_mirror(square) if opponent_chess_notation_color else square
            score -= pst[idx]

        score += len(board.pieces(piece_type, color)) * value
        score -= len(board.pieces(piece_type, opponent_chess_notation_color)) * value
    return score