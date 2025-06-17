const rook = {
    name: "rook",
    color: null,
    position: null,
    hasMoved: false,
    possibleMoves(board) {
        const moves = [];
        const [row, col] = this.position;

        const directions = [
            [-1, 0], 
            [1, 0],  
            [0, -1], 
            [0, 1]   
        ];

        for (const [dRow, dCol] of directions) {
            let r = row + dRow;
            let c = col + dCol;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = board[r][c];
                if (!target) {
                    moves.push([r, c]);
                } else {
                    if (target.color && target.color !== this.color) {
                        moves.push([r, c]);
                    }
                    break;
                }
                r += dRow;
                c += dCol;
            }
        }

        return moves;
    }
};

export default rook;