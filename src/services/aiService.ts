
type Player = 'X' | 'O' | null;

export class AIService {
  private static winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  static getBestMove(board: Player[], difficulty: 'easy' | 'med' | 'hard', aiPlayer: 'O' | 'X' = 'O'): number {
    const humanPlayer = aiPlayer === 'O' ? 'X' : 'O';

    if (difficulty === 'easy') {
      // 30% random, 70% smart
      if (Math.random() > 0.7) return this.getRandomMove(board);
      return this.getMinimaxMove(board, aiPlayer);
    }

    if (difficulty === 'med') {
      // 5% random, 95% smart
      if (Math.random() > 0.95) return this.getRandomMove(board);
      return this.getMinimaxMove(board, aiPlayer);
    }

    // Hard: 100% smart
    return this.getMinimaxMove(board, aiPlayer);
  }

  private static getRandomMove(board: Player[]): number {
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    return available[Math.floor(Math.random() * available.length)];
  }

  private static getMinimaxMove(board: Player[], aiPlayer: 'O' | 'X'): number {
    let bestScore = -Infinity;
    let moves: number[] = [];

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = aiPlayer;
            let score = this.minimax(board, 0, false, aiPlayer);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                moves = [i];
            } else if (score === bestScore) {
                moves.push(i);
            }
        }
    }
    
    if (moves.length === 0) return this.getRandomMove(board);
    
    // Heuristic: If scores are equal (e.g. both lead to draw), prefer center, then corners, then edges
    const center = 4;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];

    if (moves.includes(center)) return center;
    const availableCorners = moves.filter(m => corners.includes(m));
    if (availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private static checkWinner(board: Player[]): Player | 'Draw' | null {
    for (const [a, b, c] of this.winningLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) return 'Draw';
    return null;
  }

  private static minimax(board: Player[], depth: number, isMaximizing: boolean, aiPlayer: 'O' | 'X'): number {
    const humanPlayer = aiPlayer === 'O' ? 'X' : 'O';
    const result = this.checkWinner(board);

    if (result === aiPlayer) return 10 - depth;
    if (result === humanPlayer) return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = aiPlayer;
          let score = this.minimax(board, depth + 1, false, aiPlayer);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = humanPlayer;
          let score = this.minimax(board, depth + 1, true, aiPlayer);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }
}
