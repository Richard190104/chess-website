const pawn = {
    name: "pawn",
    color: null, 
    position: null, 
    hasMoved: false,
    possibleMoves(board) {
        const moves = [];
        const dir = this.color === "white" ? 1 : -1;
        const [row, col] = this.position;

        const nextRow = row + dir;
        if (
            nextRow >= 0 && nextRow < 8 &&
            !board[nextRow][col]
        ) {
            moves.push([nextRow, col]);

            const startRow = this.color === "white" ? 6 : 1;
            if (!this.hasMoved && !board[nextRow + dir][col]) {
                moves.push([nextRow + dir, col]);
            }
        }

        for (const dCol of [-1, 1]) {
            const captureCol = col + dCol;
            if (
                captureCol >= 0 && captureCol < 8 &&
                nextRow >= 0 && nextRow < 8
            ) {
                const target = board[nextRow][captureCol];
                if (target && target.color && target.color !== this.color) {
                    moves.push([nextRow, captureCol]);
                }
            }
        }

        return moves;
    }
    

};


export default pawn;