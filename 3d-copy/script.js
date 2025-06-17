import board from "./board.js";
import rook from "./rook.js";
import bishop from "./bishop.js";
import king from "./king.js";
import queen from "./queen.js";
import knight from "./knight.js";
import pawn from "./pawn.js";

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
            const piecetop = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
            const piecebot = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecebase = makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-rook");
          piecebot.classList.add("bottom-rook");
          piecebase.classList.add("base-rook");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
        }
        else if(piece.type === "bishop") {
          const piecerig =  makearea(5, 40, 40, piece.color === "white" ? "white" : "black");
          const piecelef =  makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecebase = makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecerig.classList.add("right-bishop");
          piecelef.classList.add("left-bishop");
          piecebase.classList.add("base-bishop");
          square.appendChild(piecelef);
          square.appendChild(piecerig);
          square.appendChild(piecebase);
        }
        else if(piece.type === "king") {
            const piecetop = makearea(3, 30, 40, piece.color === "white" ? "white" : "black");
            const piecebot = makearea(3, 30, 40, piece.color === "white" ? "white" : "black");
            const piecelef = makearea(3, 30, 40, piece.color === "white" ? "white" : "black");
            const piecerig = makearea(3, 30, 40, piece.color === "white" ? "white" : "black");
          const piecebase = makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-king");
          piecelef.classList.add("left-king");
          piecerig.classList.add("right-king");
          piecebot.classList.add("bottom-king");
          piecebase.classList.add("base-king");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
          square.appendChild(piecelef);
          square.appendChild(piecerig);

        }
        else if(piece.type === "queen") {
          const piecetop = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecebot = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecelef = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecerig = makearea(3, 40, 40, piece.color === "white" ? "white" : "black");
          const piecebase =  makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecetop.classList.add("top-queen");
          piecelef.classList.add("left-queen");
          piecerig.classList.add("right-queen");
          piecebot.classList.add("bottom-queen");
          piecebase.classList.add("base-queen");
          square.appendChild(piecebot);
          square.appendChild(piecetop);
          square.appendChild(piecebase);
          square.appendChild(piecelef);
          square.appendChild(piecerig);
        }
        else if(piece.type === "knight") {
          for (let k = 1; k <= 6; k++) {
            const knightPart = makearea(3, 20.94395, 40, piece.color === "white" ? "white" : "black");
            knightPart.classList.add(`k${k}`);
            square.appendChild(knightPart);
          }
          const piecebase = makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecebase.classList.add("base-knight");
          square.appendChild(piecebase);
        }
        else if(piece.type === "pawn") {
          const piecebot = makearea(7, 7, 40, piece.color === "white" ? "white" : "black");
          const piecebase =  makearea(40, 40, 5, piece.color === "white" ? "white" : "black");
          piecebase.classList.add("piece", piece.color === "white" ? "white" : "black");
          piecebot.classList.add("bottom-pawn");
          piecebase.classList.add("base-pawn");
          square.appendChild(piecebot);
          square.appendChild(piecebase);
        }
      }
      
      // Add data attributes for event handling
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
  board[0][3] = { ...queen, type: 'queen', color: 'white', position: [0, 3] };
  board[7][3] = { ...queen, type: 'queen', color: 'black', position: [7, 3] };
  board[0][4] = { ...king, type: 'king', color: 'white', position: [0, 4] };
  board[7][4] = { ...king, type: 'king', color: 'black', position: [7, 4] };

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
  rotationX += (targetRotationX - rotationX) * 0.08;
  boardElement.style.transform = `rotateX(${rotationX}deg) rotateZ(180deg)`;
  if (Math.abs(targetRotationX - rotationX) > 0.01) {
    animationFrame = requestAnimationFrame(animateRotation);
  } else {
    rotationX = targetRotationX;
    boardElement.style.transform = `rotateX(${rotationX}deg) rotateZ(180deg)`;
    animationFrame = null;
  }
}

boardElement.addEventListener("wheel", (e) => {
  e.preventDefault();
  const deltaY = e.deltaY;
  targetRotationX += deltaY * 0.08;
  targetRotationX = Math.max(0, Math.min(80, targetRotationX));
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


console.log(board);
