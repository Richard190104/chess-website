import * as THREE from "three";

var selectedCPiece = null;
let player = "w";
const engine = new Worker("./js/stockfish-nnue-16-single.js");
engine.postMessage("uci");
engine.postMessage("ucinewgame");

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
  let dragged = false;

  // highlight groups
  const highlights = new THREE.Group();
  const selectionCircle = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
  );
  selectionCircle.rotation.x = -Math.PI / 2;
  selectionCircle.visible = false;

  // Square highlight mesh
  let squareHighlight = null;

  // Store multiple right-click highlights
  const rightClickHighlights = new Map(); // key: "file,rank", value: mesh

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
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7,
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

    clearSelection();
    removeAllRightClickHighlights();
    removeSquareHighlight();

    renderPieces(chess, piecesGroup);

    player = player === "w" ? "b" : "w";

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
    checkGameStatus();
  }

  function askStockfishToMove() {
    const fen = chess.fen();
    engine.postMessage("position fen " + fen);
    // Ask for 6 best moves, so we can pick the 4th
    engine.postMessage("setoption name MultiPV value 6");
    engine.postMessage("go depth 1");
  }

  // Store multipv lines
  let multipvMoves = [];

  // 
  let stockfishDiff = 2; // first 10 moves, ${stockfishDiff}th best move, then ${stockfishDiff + 1} to ${stockfishDiff + 3} best moves
  let hardMode = false; // true disables the multipv logic and always picks the stockfishDiff-th best move

  engine.onmessage = function (event) {
    const line = event.data;
    if (line.startsWith("info") && line.includes("multipv")) {
      const multipvMatch = line.match(/multipv (\d+)/);
      const pvMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (multipvMatch && pvMatch) {
        const multipvNum = parseInt(multipvMatch[1], 10);
        const move = pvMatch[1];
        multipvMoves[multipvNum - 1] = move;
      }
    }
    if (line.startsWith("bestmove")) {
      let move = null;
      const moveNumber = chess.history().length;
      let pickIndexes = [];

      if (typeof hardMode !== "undefined" && hardMode) {
        pickIndexes = [stockfishDiff];
      } else if (moveNumber < 10) {
        pickIndexes = [stockfishDiff];
      } else {
        pickIndexes = [stockfishDiff + 1, stockfishDiff + 2, stockfishDiff + 3];
      }

      for (let idx of pickIndexes) {
        if (multipvMoves.length > idx && multipvMoves[idx]) {
          move = multipvMoves[idx];
          break;
        }
      }

      if (!move) {
        move = line.split(" ")[1];
      }

      multipvMoves = []; 
      if (move && move !== "(none)") {
        chess.move({
          from: move.slice(0, 2),
          to: move.slice(2, 4),
          promotion: "q",
        });
        renderPieces(chess, piecesGroup);
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

      alert(message);

      controls.enabled = false;
      highlights.clear();
      selectionCircle.visible = false;
      removeSquareHighlight();
      selectedMesh = null;
      selectedFrom = null;
      selectedCPiece = null;
      legalMoves = [];
      removeAllRightClickHighlights();
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
      chess.move({ from: selectedFrom, to: info.square });
      renderPieces(chess, piecesGroup);
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
    dragged = true;
    const info = getBoardInfo(e);
    if (info && legalMoves.find((m) => m.to === info.square)) {
      chess.move({ from: selectedFrom, to: info.square });
      renderPieces(chess, piecesGroup);
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
        chess.move({ from: selectedFrom, to: info.square });
        renderPieces(chess, piecesGroup);
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
}
