import * as THREE from "three";
var selectetCPiece = null;
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

  // highlight groups
  const highlights = new THREE.Group();
  const selectionCircle = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
  );
  selectionCircle.rotation.x = -Math.PI / 2;
  selectionCircle.visible = false;

  scene.add(highlights, selectionCircle);

  function clearSelection() {
    if (selectedMesh) {
      controls.enabled = true;
      selectionCircle.visible = false;
      highlights.clear();
      selectedMesh.position.copy(originalPosition);
      selectedMesh = null;
      selectedFrom = null;
      selectetCPiece = null;
      legalMoves = [];
    }
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
      dot.position.set(f + 0.5, 0.03, r + 0.5);
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
    };
  }

  function askStockfishToMove() {
    const fen = chess.fen();
    engine.postMessage("position fen " + fen);
    engine.postMessage("go depth 3");
  }

  engine.onmessage = function (event) {
    const line = event.data;
    if (line.startsWith("bestmove")) {
      const move = line.split(" ")[1];
      if (move && move !== "(none)") {
        chess.move({
          from: move.slice(0, 2),
          to: move.slice(2, 4),
          promotion: "q"
        });
        renderPieces(chess, piecesGroup);
      }
    }
  };


  domEl.addEventListener("contextmenu", (e) => e.preventDefault());

  domEl.addEventListener("pointerdown", (e) => {
    // right-click or click off-board cancels
    if (e.button === 2) {
      clearSelection();
      return;
    }
    const info = getBoardInfo(e);

    // if we already have a selection, and click a legal square → move
    if (selectedMesh && info && legalMoves.find((m) => m.to === info.square)) {
      chess.move({ from: selectedFrom, to: info.square });
      renderPieces(chess, piecesGroup);
      clearSelection();
      return;
    }

    // if click off-board (and we had selection), cancel
    if (!info && selectedMesh) {
      clearSelection();
      return;
    }

    // if not selecting currently, try picking a piece
    if (!selectedMesh && info) {
      // find piece at that square
      const candidate = piecesGroup.children.find(
        (m) =>
          Math.abs(m.position.x - info.point.x) < 0.5 &&
          Math.abs(m.position.z - info.point.z) < 0.5,
      );
      if (!candidate) return;

      const moves = chess.moves({ square: info.square, verbose: true });
      if (!moves.length) return;

      // select it
      selectedMesh = candidate;
      selectedFrom = info.square;
      originalPosition.copy(candidate.position);
      legalMoves = moves;
      showHighlights(moves);

      // show ring under the piece
      selectionCircle.position.set(
        originalPosition.x,
        0.01,
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
  });

  domEl.addEventListener("pointerup", (e) => {
    if (!selectedMesh) return;
    const info = getBoardInfo(e);
    if (info && legalMoves.find((m) => m.to === info.square)) {
      chess.move({ from: selectedFrom, to: info.square });
      renderPieces(chess, piecesGroup);
      console.log(chess.board())
      if (chess.turn() === "b") {
      askStockfishToMove();
    }
    }
    domEl.releasePointerCapture(e.pointerId);
    clearSelection();
  });

  domEl.addEventListener("click", (e) => {
    const info = getBoardInfo(e);
    if (!info) {
      selectetCPiece = null;
      highlights.clear();
      return;
    }

    if (selectetCPiece && selectedFrom && legalMoves.length) {
      const move = legalMoves.find((m) => m.to === info.square);
      if (move) {
        chess.move({ from: selectedFrom, to: info.square });
        renderPieces(chess, piecesGroup);
        selectetCPiece = null;
        selectedFrom = null;
        legalMoves = [];
        highlights.clear();
        selectionCircle.visible = false;
        controls.enabled = true;

        if (chess.turn() === "b") {
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
    selectetCPiece = candidate || null;

    if (selectetCPiece) {
      const moves = chess.moves({ square: info.square, verbose: true });
      legalMoves = moves;
      selectedFrom = info.square;
      showHighlights(moves);

      selectionCircle.position.set(
        selectetCPiece.position.x,
        0.01,
        selectetCPiece.position.z,
      );
      selectionCircle.visible = true;
      controls.enabled = false;
    } else {
      highlights.clear();
      selectionCircle.visible = false;
      controls.enabled = true;
      selectedFrom = null;
      legalMoves = [];
    }
  });
}
