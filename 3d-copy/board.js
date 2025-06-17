const board = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => null)
);


// const whiteRook = { ...rook, color: 'white', position: [0, 0] };
// board[0][0] = whiteRook;

export default board;