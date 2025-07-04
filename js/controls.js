import * as THREE from "three";
const pieceSound = new Audio("./sounds/piece.mp3");
const takesSound = new Audio("./sounds/takes.mp3");
const checkSound = new Audio("./sounds/move-check.mp3");
const castleSound = new Audio("./sounds/castle.mp3");
let stockfishDiff = 3;
// Player side switch
let playerPieces = "w"; // default to white
const controlsDiv = document.getElementById("game-controls");

// Add side switch to #game-controls
if (controlsDiv) {
  const sideSwitchContainer = document.querySelector(".sideSwitch");
  const sideLabel = document.createElement("label");
  sideLabel.textContent = "Your Side:";
  sideLabel.style.fontWeight = "bold";
  sideLabel.style.fontSize = "1rem";
  sideLabel.setAttribute("for", "side-switch");

  const sideSwitch = document.createElement("button");
  sideSwitch.id = "side-switch";
  sideSwitch.textContent = "White";

  sideSwitch.addEventListener("click", () => {
    playerPieces = playerPieces === "w" ? "b" : "w";
    sideSwitch.textContent = playerPieces === "w" ? "White" : "Black";
    // Restart game on side change
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.click();
    }
  });

  sideSwitchContainer.appendChild(sideLabel);
  sideSwitchContainer.appendChild(sideSwitch);
  controlsDiv.insertBefore(sideSwitchContainer, controlsDiv.firstChild);
}
const diffSliderContainer = document.querySelector(".difficulty-slider");
if (controlsDiv && diffSliderContainer) {
  const diffLabel = document.createElement("label");
  diffLabel.textContent = "Difficulty:";
  diffLabel.setAttribute("for", "difficulty-slider");
  diffLabel.style.marginRight = "8px";
  diffLabel.style.fontWeight = "bold";
  diffLabel.style.fontSize = "1rem";

  const sliderContainer = document.createElement("div");
  sliderContainer.style.display = "flex";
  sliderContainer.style.alignItems = "center";
  sliderContainer.style.gap = "10px";

  const diffSlider = document.createElement("input");
  diffSlider.type = "range";
  diffSlider.id = "difficulty-slider";
  diffSlider.min = "1";
  diffSlider.max = "7";
  diffSlider.value = 7 - stockfishDiff;
  diffSlider.style.width = "120px";
  diffSlider.style.marginRight = "8px";

  const diffValue = document.createElement("span");
  diffValue.textContent = 8 - (stockfishDiff + 1).toString();
  diffValue.style.fontWeight = "bold";
  diffValue.style.minWidth = "1.5em";
  diffValue.style.textAlign = "center";

  diffSlider.addEventListener("input", (e) => {
    stockfishDiff = 7 - parseInt(e.target.value, 10);
    diffValue.textContent = 8 - (stockfishDiff + 1).toString();
  });

  diffSlider.addEventListener("change", () => {
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.click();
    }
  });

  sliderContainer.appendChild(diffLabel);
  sliderContainer.appendChild(diffSlider);
  sliderContainer.appendChild(diffValue);

  diffSliderContainer.appendChild(sliderContainer);
}

var selectedCPiece = null;
let player = "w";
const engine = new Worker("./js/stockfish-nnue-16-single.js");
engine.postMessage("uci");
engine.postMessage("ucinewgame");

const moveHistoryContainer = document.querySelector(".move-history-container");
const moveHistoryList = moveHistoryContainer
  ? moveHistoryContainer.querySelector(".move-history-list")
  : null;

const game_result = document.querySelector(".game-result");

function updateMoveHistory(chess) {
  if (!moveHistoryList) return;
  const history = chess.history({ verbose: true });
  moveHistoryList.innerHTML = "";
  if (history.length > 0) {
    moveHistoryContainer.style.display = "block";
  }
  const pieceIcons = {
    w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
    b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
  };

  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1];

    const whiteMove = white
      ? `${pieceIcons[white.color][white.piece]}${white.to}${white.promotion ? "=" + white.promotion.toUpperCase() : ""}`
      : "";
    const blackMove = black
      ? `${pieceIcons[black.color][black.piece]}${black.to}${black.promotion ? "=" + black.promotion.toUpperCase() : ""}`
      : "";

    const li = document.createElement("li");
    const moveDiv = document.createElement("div");
    moveDiv.classList.add("moveDiv");

    const moveNum = document.createElement("span");
    moveNum.textContent = `${Math.floor(i / 2) + 1}.`;
    moveNum.style.marginRight = "8px";
    moveNum.style.fontWeight = "bold";

    const whiteSpan = document.createElement("span");
    whiteSpan.textContent = whiteMove;
    whiteSpan.style.textAlign = "left";

    const blackSpan = document.createElement("span");
    blackSpan.textContent = blackMove;
    blackSpan.style.flex = "1";

    moveDiv.appendChild(moveNum);
    moveDiv.appendChild(whiteSpan);
    moveDiv.appendChild(blackSpan);

    li.appendChild(moveDiv);
    moveHistoryList.appendChild(li);
  }
  if (moveHistoryList.lastChild) {
    moveHistoryList.lastChild.classList.add("last-move");
  }
  // Auto-scroll to bottom with animation
  if (moveHistoryList.parentElement) {
    const container = moveHistoryList.parentElement;
    const start = container.scrollTop;
    const end = container.scrollHeight;
    const duration = 300;
    const startTime = performance.now();

    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = start + (end - start) * progress;
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    requestAnimationFrame(animateScroll);
  }
}

export function setupInteraction(
  domEl,
  camera,
  scene,
  chess,
  renderPieces,
  boardGroup,
  piecesGroup,
  controls,
) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let selectedMesh = null;
  let selectedFrom = null;
  let originalPosition = new THREE.Vector3();
  let legalMoves = [];

  const highlights = new THREE.Group();
  const selectionCircle = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  selectionCircle.rotation.x = -Math.PI / 2;
  selectionCircle.visible = false;

  let squareHighlight = null;

  const rightClickHighlights = new Map();

  scene.add(highlights, selectionCircle);

  function clearSelection() {
    if (selectedMesh) {
      selectedMesh.position.copy(originalPosition);
      selectedMesh = null;
    }
    controls.enabled = true;
    selectionCircle.visible = false;
    highlights.clear();
    selectedFrom = null;
    selectedCPiece = null;
    legalMoves = [];
  }

  function showHighlights(moves) {
    highlights.clear();
    moves.forEach((m) => {
      const f = m.to.charCodeAt(0) - 97;
      const r = parseInt(m.to[1], 10) - 1;
      const geom = new THREE.CircleGeometry(0.15, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
      });
      const dot = new THREE.Mesh(geom, mat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(7 - f, 0.05, r);
      highlights.add(dot);
    });
  }

  function getBoardInfo(evt) {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(boardGroup.children);
    if (!hits.length) return null;
    const { file, rank } = hits[0].object.userData;
    return {
      square: String.fromCharCode(97 + file) + (rank + 1),
      point: hits[0].point,
      file,
      rank,
      mesh: hits[0].object,
    };
  }

  function resetGame() {
    chess.reset();

    moveHistoryContainer.style.display = "none";
    game_result.style.display = "none";

    clearSelection();
    removeAllRightClickHighlights();
    removeSquareHighlight();

    renderPieces(chess, piecesGroup);

    // Use playerPieces to set player color and camera
    player = typeof playerPieces !== "undefined" ? playerPieces : "w";

    if (player === "w") {
      camera.position.set(3.5, 10, -5);
    } else {
      camera.position.set(3.5, 10, 12);
    }
    camera.lookAt(new THREE.Vector3(3.5, 0, 3.5));

    engine.postMessage("ucinewgame");

    if (chess.turn() !== player) {
      askStockfishToMove();
    }
    updateMoveHistory(chess);
    checkGameStatus();
  }

  function askStockfishToMove() {
    var randomDelay = Math.floor(Math.random() * 1000); 
    setTimeout(() => {
      const fen = chess.fen();
      engine.postMessage("position fen " + fen);
      engine.postMessage("setoption name MultiPV value 7");
      engine.postMessage("go depth 1");

    }, randomDelay); 
  }

  // Store multipv lines
  let multipvMoves = [];
  let multipvScores = [];

  engine.onmessage = function (event) {
    const line = event.data;
    // Parse multipv lines and scores
    if (line.startsWith("info") && line.includes("multipv")) {
      const multipvMatch = line.match(/multipv (\d+)/);
      const pvMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
      if (multipvMatch && pvMatch) {
        const multipvNum = parseInt(multipvMatch[1], 10);
        const move = pvMatch[1];
        multipvMoves[multipvNum - 1] = move;
        if (scoreMatch) {
          // cp = centipawns, mate = mate in N
          let score =
            scoreMatch[1] === "cp"
              ? parseInt(scoreMatch[2], 10)
              : scoreMatch[1] === "mate"
                ? 10000 * Math.sign(parseInt(scoreMatch[2], 10))
                : 0;
          multipvScores[multipvNum - 1] = score;
        }
      }
    }
    if (line.startsWith("bestmove")) {
      let move = null;
      // Find best score for reference
      const bestScore = Math.max(
        ...multipvScores.filter((s) => typeof s === "number"),
      );

      // Filter out moves that hang pieces (simple static exchange evaluation)
      // We'll use chess.js to check if the move loses material immediately
      function isHangingMove(moveStr) {
        const from = moveStr.slice(0, 2);
        const to = moveStr.slice(2, 4);
        const tempChess = new Chess(chess.fen());

        const move = tempChess.move({ from, to, promotion: "q" });
        if (!move) return true; // illegal

        const pieceValue = {
          p: 1,
          n: 3,
          b: 3,
          r: 5,
          q: 9,
          k: 1000,
        };

        const movedValue = pieceValue[move.piece];
        const capturedValue = move.captured ? pieceValue[move.captured] : 0;

        const attackers = tempChess
          .moves({ verbose: true })
          .filter((m) => m.to === to && m.color !== tempChess.turn());
        const defenders = tempChess
          .moves({ verbose: true })
          .filter((m) => m.to === to && m.color === tempChess.turn());

        // If we captured a more valuable piece than we risk, it's ok
        if (capturedValue >= movedValue) return false;

        // If square is attacked and not defended, and we're not gaining material, it's likely a blunder
        if (
          attackers.length > 0 &&
          defenders.length === 0 &&
          movedValue >= 3 &&
          capturedValue < movedValue
        ) {
          return true;
        }

        return false;
      }

      // Only allow moves within 300cp of best and not hanging
      // Rebuild safeIndexes as array of objects with score, idx
      let chosenIdx = null;

      let safeIndexesScored = multipvScores
        .map((score, idx) => ({ score, idx }))
        .filter(
          (obj) =>
            typeof obj.score === "number" &&
            bestScore - obj.score <= (stockfishDiff + 1) * 50 &&
            multipvMoves[obj.idx] &&
            !isHangingMove(multipvMoves[obj.idx]),
        )
        .sort((a, b) => b.score - a.score); // sort best to worst

      // Extract sorted indexes
      let safeIndexes = safeIndexesScored.map((obj) => obj.idx);

      chosenIdx =
        safeIndexes[stockfishDiff] !== undefined
          ? safeIndexes[stockfishDiff]
          : safeIndexes[0];

      if (multipvMoves.length > chosenIdx && multipvMoves[chosenIdx]) {
        move = multipvMoves[chosenIdx];
      }

      if (!move) {
        for (let idx = 0; idx < multipvMoves.length; idx++) {
          if (multipvMoves[idx] && !isHangingMove(multipvMoves[idx])) {
            move = multipvMoves[idx];
            break;
          }
        }
      }

      if (!move) {
        move = line.split(" ")[1];
      }

      multipvMoves = [];
      multipvScores = [];
      if (move && move !== "(none)") {
        chess.move({
          from: move.slice(0, 2),
          to: move.slice(2, 4),
          promotion: "q",
        });
        renderPieces(chess, piecesGroup);
        updateMoveHistory(chess);
        const history = chess.history({ verbose: true });
        if (
          history.length > 0 &&
          (history[history.length - 1].flags.includes("k") || history[history.length - 1].flags.includes("q"))
        ) {
            castleSound.currentTime = 0;
            castleSound.play();
        } else if (history.length > 0 && chess.in_check()) {
          checkSound.currentTime = 0;
          checkSound.play();
        } else if (history.length > 0 && history[history.length - 1].captured) {
          takesSound.currentTime = 0;
          takesSound.play();
        } else {
          pieceSound.currentTime = 0;
          pieceSound.play();
        }
        checkGameStatus();
      }
    }
  };

  function checkGameStatus() {
    if (chess.game_over()) {
      let message = "";

      if (chess.in_checkmate()) {
        const winner = chess.turn() === "w" ? "Black" : "White";
        message = `${winner} wins by checkmate!`;
      } else if (chess.in_stalemate()) {
        message = "Game drawn by stalemate";
      } else if (chess.in_threefold_repetition()) {
        message = "Game drawn by threefold repetition";
      } else if (chess.insufficient_material()) {
        message = "Game drawn by insufficient material";
      } else if (chess.in_draw()) {
        message = "Game drawn by 50-move rule";
      }

      controls.enabled = false;
      highlights.clear();
      selectionCircle.visible = false;
      removeSquareHighlight();
      selectedMesh = null;
      selectedFrom = null;
      selectedCPiece = null;
      legalMoves = [];
      removeAllRightClickHighlights();

      game_result.style.display = "flex";
      game_result.innerHTML = `${message}`;
    }
  }

  function removeSquareHighlight() {
    if (squareHighlight) {
      scene.remove(squareHighlight);
      squareHighlight.geometry.dispose();
      squareHighlight.material.dispose();
      squareHighlight = null;
    }
  }

  function removeAllRightClickHighlights() {
    for (const mesh of rightClickHighlights.values()) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    rightClickHighlights.clear();
  }

  function toggleRightClickHighlight(file, rank) {
    const key = `${file},${rank}`;
    if (rightClickHighlights.has(key)) {
      const mesh = rightClickHighlights.get(key);
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      rightClickHighlights.delete(key);
    } else {
      const mesh = boardGroup.children.find(
        (sq) => sq.userData.file === file && sq.userData.rank === rank,
      );
      if (!mesh) return;
      const geom = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      });
      const highlightMesh = new THREE.Mesh(geom, mat);
      highlightMesh.rotation.x = -Math.PI / 2;
      highlightMesh.position.set(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
      );
      scene.add(highlightMesh);
      rightClickHighlights.set(key, highlightMesh);
    }
  }

  domEl.addEventListener("contextmenu", (e) => e.preventDefault());

  domEl.addEventListener("pointerdown", (e) => {
    if (e.button === 2) {
      const info = getBoardInfo(e);

      if (info && !selectionCircle.visible) {
        toggleRightClickHighlight(info.file, info.rank);
      }

      highlights.clear();
      selectionCircle.visible = false;
      removeSquareHighlight();
      selectedMesh = null;
      selectedFrom = null;
      selectedCPiece = null;
      legalMoves = [];

      return;
    }
    const info = getBoardInfo(e);

    if (selectedMesh && info && legalMoves.find((m) => m.to === info.square)) {
      chess.move({ from: selectedFrom, to: info.square, promotion: "q" });
      renderPieces(chess, piecesGroup);
      updateMoveHistory(chess);
      checkGameStatus();
      clearSelection();
      return;
    }

    if (!info && selectedMesh) {
      clearSelection();
      return;
    }

    if (!selectedMesh && info) {
      const candidate = piecesGroup.children.find(
        (m) =>
          Math.abs(m.position.x - info.point.x) < 0.5 &&
          Math.abs(m.position.z - info.point.z) < 0.5,
      );
      if (!candidate) return;

      const moves = chess.moves({ square: info.square, verbose: true });
      if (!moves.length) return;

      selectedMesh = candidate;
      selectedFrom = info.square;
      originalPosition.copy(candidate.position);
      legalMoves = moves;
      showHighlights(moves);

      selectionCircle.position.set(
        originalPosition.x,
        0.05,
        originalPosition.z,
      );
      selectionCircle.visible = true;

      controls.enabled = false;
      domEl.setPointerCapture(e.pointerId);
    }
  });

  domEl.addEventListener("pointermove", (e) => {
    if (!selectedMesh) return;
    const info = getBoardInfo(e);
    if (!info) return;
    selectedMesh.position.x = info.point.x;
    selectedMesh.position.z = info.point.z;
    selectedMesh.position.y = 0.5;
  });

  domEl.addEventListener("pointerup", (e) => {
    if (!selectedMesh) return;
    const info = getBoardInfo(e);
    if (info && legalMoves.find((m) => m.to === info.square)) {
      // Check if a piece is taken
      const move = legalMoves.find((m) => m.to === info.square);
      chess.move({ from: selectedFrom, to: info.square, promotion: "q" });
      renderPieces(chess, piecesGroup);

      if (
        move &&
        (move.flags.includes("k") || move.flags.includes("q"))
      ) {
        castleSound.currentTime = 0;
        castleSound.play();
      } else if (move && chess.in_check()) {
        checkSound.currentTime = 0;
        checkSound.play();
      } else if (move && move.captured) {
        takesSound.currentTime = 0;
        takesSound.play();
      } else {
        pieceSound.currentTime = 0;
        pieceSound.play();
      }

      updateMoveHistory(chess);
      checkGameStatus();

      if (chess.turn() !== player) {
      askStockfishToMove();
      }
    }
    domEl.releasePointerCapture(e.pointerId);
    clearSelection();
  });

  domEl.addEventListener("click", (e) => {
    removeAllRightClickHighlights();

    const info = getBoardInfo(e);
    if (!info) {
      selectedCPiece = null;
      highlights.clear();
      removeSquareHighlight();
      return;
    }

    if (selectedCPiece && selectedFrom && legalMoves.length) {
      const move = legalMoves.find((m) => m.to === info.square);
      if (move) {
        chess.move({ from: selectedFrom, to: info.square, promotion: "q" });
        renderPieces(chess, piecesGroup);
         if (
        move &&
        (move.flags.includes("k") || move.flags.includes("q"))
      ) {
        castleSound.currentTime = 0;
        castleSound.play(); // short delay between sounds
      } else if (move && chess.in_check()) {
        checkSound.currentTime = 0;
        checkSound.play();
      } else if (move && move.captured) {
        takesSound.currentTime = 0;
        takesSound.play();
      } else {
        pieceSound.currentTime = 0;
        pieceSound.play();
      }
        updateMoveHistory(chess);
        checkGameStatus();

        selectedCPiece = null;
        selectedFrom = null;
        legalMoves = [];
        highlights.clear();
        selectionCircle.visible = false;
        controls.enabled = true;
        removeSquareHighlight();

        if (chess.turn() !== player) {
          askStockfishToMove();
        }
        return;
      }
    }

    const candidate = piecesGroup.children.find(
      (m) =>
        Math.abs(m.position.x - info.point.x) < 0.5 &&
        Math.abs(m.position.z - info.point.z) < 0.5,
    );
    selectedCPiece = candidate || null;

    if (selectedCPiece) {
      const moves = chess.moves({ square: info.square, verbose: true });
      legalMoves = moves;
      selectedFrom = info.square;
      showHighlights(moves);

      selectionCircle.position.set(
        selectedCPiece.position.x,
        0.05,
        selectedCPiece.position.z,
      );
      selectionCircle.visible = legalMoves.length > 0;
      controls.enabled = false;
    } else {
      highlights.clear();
      selectionCircle.visible = false;
      controls.enabled = true;
      selectedFrom = null;
      legalMoves = [];
    }
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    resetGame();
  });

  // Initial move history
  updateMoveHistory(chess);
}

game_result.style.display = "none";
