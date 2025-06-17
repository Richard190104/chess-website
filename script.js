import board from "./board.js";
import rook from "./rook.js";
import bishop from "./bishop.js";
import king from "./king.js";
import queen from "./queen.js";
import knight from "./knight.js";
import pawn from "./pawn.js";
const AiColor = "black";
const playerColor = "white";
var turn = "white";
var aiMove = getBestMove(board, "black", 3);
let isRotated = false;
function makearea(width = 3, height = 40, depth = 40, cl = "white") {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.transformStyle = 'preserve-3d';

  function createFace(w, h, bgColor, transform) {
    const face = document.createElement('div');
    face.style.position = 'absolute';
    face.style.width = `${w}px`;
    face.style.height = `${h}px`;
    face.classList.add(`${cl}`);
    if(bgColor === "top"){
      if(cl === "white"){
        face.classList.add("border-black");
      }
      else{
        face.classList.add("border-white");
      }
    }
    face.style.transform = transform;
    face.style.backfaceVisibility = 'visible';
    return face;
  }

  container.appendChild(createFace(width, height, "top", `translateZ(${depth / 2}px)`));
  container.appendChild(createFace(width, height, "top", `translateZ(${-depth / 2}px) `));
  container.appendChild(createFace(depth, height, cl, `rotateY(-90deg) translateZ(-${width / 2}px) translateZ(${depth/2 - width/2}px)`));
  container.appendChild(createFace(depth, height,cl, `rotateY(-90deg) translateZ(${width / 2}px) translateZ(${depth/2- width/2}px)`));
  container.appendChild(createFace(width, depth, "top", `rotateX(90deg) translateZ(${depth / 2}px)`)); 
  container.appendChild(createFace(width, depth, "top", `rotateX(90deg) translateZ(${depth / 2 - height}px)`)); 

  return container;
}

function clearBoardElement(boardElement) {
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
}

function renderChessBoard(selectedPiece = null, possibleMoves = []) {
  const boardElement = document.getElementById("board");
  clearBoardElement(boardElement);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      const lightSquare = (row + col) % 2 === 0;
      square.classList.add(lightSquare ? "light" : "dark");

      if (possibleMoves.some(([r, c]) => r === row && c === col)) {
        square.classList.add("possible-move");
      }

      if (selectedPiece && selectedPiece.position[0] === row && selectedPiece.position[1] === col) {
        square.classList.add("selected-piece");
      }

      const piece = board[row][col];
      if (piece) {
        if(piece.type === "rook") {
            const piecetop = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
            const piecebot = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-rook");
          piecebot.classList.add("bottom-rook");
          piecebase.classList.add("base");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
        }
        else if(piece.type === "bishop") {
          const piecerig =  makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecelef =  makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecerig.classList.add("right-bishop");
          piecelef.classList.add("left-bishop");
          piecebase.classList.add("base");
          square.appendChild(piecelef);
          square.appendChild(piecerig);
          square.appendChild(piecebase);
        }
        else if(piece.type === "king") {
            const piecetop = makearea(3, 30, 70, piece.color === "white" ? "white" : "black");
            const piecebot = makearea(3, 30, 70, piece.color === "white" ? "white" : "black");
            const piecelef = makearea(3, 30, 70, piece.color === "white" ? "white" : "black");
            const piecerig = makearea(3, 30, 70, piece.color === "white" ? "white" : "black");
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-king");
          piecelef.classList.add("left-king");
          piecerig.classList.add("right-king");
          piecebot.classList.add("bottom-king");
          piecebase.classList.add("base");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
          square.appendChild(piecelef);
          square.appendChild(piecerig);

        }
        else if(piece.type === "queen") {
          const piecetop = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecebot = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecelef = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecerig = makearea(3, 40, 70, piece.color === "white" ? "white" : "black");
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-queen");
          piecelef.classList.add("left-queen");
          piecerig.classList.add("right-queen");
          piecebot.classList.add("bottom-queen");
          piecebase.classList.add("base");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
          square.appendChild(piecelef);
          square.appendChild(piecerig);
        }
        else if(piece.type === "knight") {
          for (let k = 1; k <= 6; k++) {
            const knightPart = makearea(3, 20.94395, 70, piece.color === "white" ? "white" : "black");
            knightPart.classList.add(`k${k}`);
            square.appendChild(knightPart);
          }
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecebase.classList.add("base");
          square.appendChild(piecebase);
        }
        else if(piece.type === "pawn") {
          const piecebot = makearea(10, 10, 70, piece.color === "white" ? "white" : "black");
          const piecebase = document.createElement("div");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecebot.classList.add("bottom-pawn");
          piecebase.classList.add("base");
          square.appendChild(piecebot);
          square.appendChild(piecebase);
        }
      }
      
      square.dataset.row = row;
      square.dataset.col = col;

      boardElement.appendChild(square);
    }
  }
}

function initiateChessBoard() {
  board[0][0] = { ...rook, type: 'rook', color: 'white', position: [0, 0] };
  board[0][7] = { ...rook, type: 'rook', color: 'white', position: [0, 7] };
  board[7][0] = { ...rook, type: 'rook', color: 'black', position: [7, 0] };
  board[7][7] = { ...rook, type: 'rook', color: 'black', position: [7, 7] };
  board[0][1] = { ...knight, type: 'knight', color: 'white', position: [0, 1] };
  board[0][6] = { ...knight, type: 'knight', color: 'white', position: [0, 6] };
  board[7][1] = { ...knight, type: 'knight', color: 'black', position: [7, 1] };
  board[7][6] = { ...knight, type: 'knight', color: 'black', position: [7, 6] };
  board[0][2] = { ...bishop, type: 'bishop', color: 'white', position: [0, 2] };
  board[0][5] = { ...bishop, type: 'bishop', color: 'white', position: [0, 5] };
  board[7][2] = { ...bishop, type: 'bishop', color: 'black', position: [7, 2] };
  board[7][5] = { ...bishop, type: 'bishop', color: 'black', position: [7, 5] };
  board[0][3] = { ...king, type: 'king', color: 'white', position: [0, 3] };
  board[7][3] = { ...king, type: 'king', color: 'black', position: [7, 3] };
  board[0][4] = { ...queen, type: 'queen', color: 'white', position: [0, 4] };
  board[7][4] = { ...queen, type: 'queen', color: 'black', position: [7, 4] };

  for (let i = 0; i < 8; i++) {
    board[1][i] = { ...pawn, type: 'pawn', color: 'white', position: [1, i], hasMoved: false };
    board[6][i] = { ...pawn, type: 'pawn', color: 'black', position: [6, i], hasMoved: false };
    for (let j = 2; j < 6; j++) {
      board[j][i] = null;
    }
  }
  renderChessBoard();
}

function move(to, board, piece) {
  const possible = piece.possibleMoves(board);

  if (!possible.some(move => move[0] === to[0] && move[1] === to[1])) {
    console.error("Invalid move", to, "for piece", piece.position, possible);
    return false;
  }
  const [toRow, toCol] = to;
  board[piece.position[0]][piece.position[1]] = null;
  piece.position = [toRow, toCol];
  board[toRow][toCol] = piece;
  piece.hasMoved = true;
  turn = turn === "white" ? "black" : "white";
  aiMove = getBestMove(board, AiColor, 4);
  console.log("AI move:", aiMove);
  if (aiMove && turn === AiColor) {
    move(aiMove.to, board, board[aiMove.from[0]][aiMove.from[1]]);
    renderChessBoard();
}
  return true;
}

initiateChessBoard();

let isDragging = false;
let lastY = 0;
let rotationX = 0;

const boardElement = document.getElementById("board");
let targetRotationX = 60; 
rotationX = targetRotationX;
let animationFrame = null;

function animateRotation() {
  rotationX += (targetRotationX - rotationX) * 0.15;
  let deg = 180
  if (isRotated) {
    deg = 0
  }
  boardElement.style.transform = `rotateX(${rotationX}deg) rotateZ(${deg}deg)`;
  if (Math.abs(targetRotationX - rotationX) > 0.1) {
    animationFrame = requestAnimationFrame(animateRotation);
  } else {
    animationFrame = null; 
  }
}

boardElement.addEventListener("wheel", (e) => {
  e.preventDefault();
  const deltaY = e.deltaY;
  targetRotationX += deltaY * 0.1;
  targetRotationX = Math.max(30, Math.min(60, targetRotationX));
  if (!animationFrame) {
    animateRotation();
  }
}, { passive: false });


let selectedPiece = null;
let possibleMoves = [];

boardElement.addEventListener("click", (e) => {
  const square = e.target.closest(".square");
  if (!square) return;
  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);

  if (selectedPiece && possibleMoves.some(([r, c]) => r === row && c === col)) {
    move([row, col], board, selectedPiece);
    selectedPiece = null;
    possibleMoves = [];
    renderChessBoard();
    return;
  }

  const piece = board[row][col];
  if (piece) {
    selectedPiece = piece;
    possibleMoves = piece.possibleMoves(board);
    console.log("Possible moves for", piece.type, "at", piece.position, ":", possibleMoves);
    renderChessBoard(selectedPiece, possibleMoves);
  } else {
    selectedPiece = null;
    possibleMoves = [];
    renderChessBoard();
  }
});

// Right-click to mark a square
boardElement.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const square = e.target.closest(".square");
  if (!square) return;
  square.classList.toggle("marked");
});


const pieceValues = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100000
};

function evaluateBoard(board, color) {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const baseValue = pieceValues[piece.type];
        const pieceScore = baseValue ;
        score += (piece.color === color ? 1 : -1) * pieceScore;
      }
    }
  }

  return score;
}


function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell, position: [...cell.position] } : null));
}

function getAllMoves(board, color) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const legalMoves = piece.possibleMoves(board);
        for (const move of legalMoves) {
          moves.push({ from: [row, col], to: move, piece });
        }
      }
    }
  }
  return moves;
}  

function makeMove(board, move) {
  const newBoard = cloneBoard(board);
  const { from, to, piece } = move;

  const templates = {
    rook,
    bishop,
    knight,
    queen,
    king,
    pawn
  };

  const template = templates[piece.type];
  if (!template) {
    console.error("Unknown piece type:", piece.type);
    return board;
  }

  const newPiece = {
    ...template,
    type: piece.type,
    color: piece.color,
    position: [...to],
    hasMoved: true
  };

  newBoard[from[0]][from[1]] = null;
  newBoard[to[0]][to[1]] = newPiece;

  return newBoard;
}


function getBestMove(board, color, depth = 3) {
  const isMaximizing = color === AiColor;
  const result = minimax(board, depth, -Infinity, Infinity, isMaximizing, color);
  return result.move;
}

function minimax(board, depth, alpha, beta, isMaximizing, playerColor) {
  if (depth === 0) {
    return { score: evaluateBoard(board, playerColor) };
  }

  const moves = orderMoves(getAllMoves(board, isMaximizing ? playerColor : oppositeColor(playerColor)));
  let bestMove = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, playerColor).score;
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, playerColor).score;
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function orderMoves(moves) {
  moves.sort((a, b) => {
    const aValue = pieceValues[board[a.to[0]][a.to[1]]?.type] || 0;
    const bValue = pieceValues[board[b.to[0]][b.to[1]]?.type] || 0;
    return bValue - aValue;
  });
  return moves; 
}

function oppositeColor(color) {
  return color === "white" ? "black" : "white";
}
aiMove = getBestMove(board, AiColor, 4);
if (aiMove && turn === AiColor) {
  move(aiMove.to, board, board[aiMove.from[0]][aiMove.from[1]]);
  renderChessBoard();
}

// Add board rotation toggle
const rotateBtn = document.getElementById('rotate-board-btn');


rotateBtn.addEventListener('click', () => {
  isRotated = !isRotated;
  if (isRotated) {
    boardElement.style.transform = `rotateX(${rotationX}deg) rotateZ(0deg)`;
  } else {
    boardElement.style.transform = `rotateX(${rotationX}deg) rotateZ(180deg)`;
  }
});



