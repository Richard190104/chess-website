const knight = {
    name: "knight",
    color: null,
    position: null,
    hasMoved: false,
    possibleMoves(board) {
        const moves = [];
        const [row, col] = this.position;

        const knightMoves = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2],  [1, 2],
            [2, -1],  [2, 1]
        ];

        for (const [dRow, dCol] of knightMoves) {
            const r = row + dRow;
            const c = col + dCol;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = board[r][c];
                if (!target || (target.color && target.color !== this.color)) {
                    moves.push([r, c]);
                }
            }
        }

        return moves;
    }
};

export default knight;