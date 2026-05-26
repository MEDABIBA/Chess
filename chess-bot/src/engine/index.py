from chess import Board, PAWN, KNIGHT, BISHOP, ROOK, KING, QUEEN, WHITE, BLACK, Color
from math import inf

PIECE_VALUES = {
    PAWN: 100,
    KNIGHT: 300,
    BISHOP: 300,
    ROOK: 500,
    QUEEN: 900,
    KING: 0
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
    if depth == 0 or board.is_checkmate():
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

def evaluate(board: Board, bot_color: Color) -> int:
    opponent_chess_notation_color = not bot_color
    score = 0
    for piece_type, value in PIECE_VALUES.items():
        score += len(board.pieces(piece_type, bot_color)) * value
        score -= len(board.pieces(piece_type, opponent_chess_notation_color)) * value
    return score