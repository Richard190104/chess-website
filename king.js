const king = {
    name: "king",
    color: null,
    position: null,
    hasMoved: false,
    possibleMoves(board) {
        const moves = [];
        const [row, col] = this.position;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dRow, dCol] of directions) {
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

export default king;