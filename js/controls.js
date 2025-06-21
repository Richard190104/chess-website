import * as THREE from "three";

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
  let legalMoves = [];

  // helper to get board‐square info under pointer
  function getBoardInfo(evt) {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // intersect your board squares
    const hits = raycaster.intersectObjects(boardGroup.children);
    if (!hits.length) return null;

    const mesh = hits[0].object;
    // these were set in board.js via userData.file/rank
    const { file, rank } = mesh.userData;
    const square = String.fromCharCode(97 + file) + (rank + 1);
    return { file, rank, square, point: hits[0].point };
  }

  domEl.addEventListener("pointerdown", (e) => {
    const info = getBoardInfo(e);
    if (!info) return;

    // check if there’s a piece on that square
    const candidate = piecesGroup.children.find((m) => {
      return (
        Math.abs(m.position.x - (info.file + 0.5)) < 1e-6 &&
        Math.abs(m.position.z - (info.rank + 0.5)) < 1e-6
      );
    });
    if (!candidate) return;

    // legal moves for that square?
    const moves = chess.moves({ square: info.square, verbose: true });
    if (!moves.length) return;

    // start drag
    selectedMesh = candidate;
    selectedFrom = info.square;
    legalMoves = moves;

    // disable orbit while dragging
    controls.enabled = false;
    // capture pointer so we keep getting move/up events
    domEl.setPointerCapture(e.pointerId);
  });

  domEl.addEventListener("pointermove", (e) => {
    if (!selectedMesh) return;

    const info = getBoardInfo(e);
    if (!info) return;

    // move the mesh under the pointer (at y=0)
    selectedMesh.position.x = info.point.x;
    selectedMesh.position.z = info.point.z;
  });

  domEl.addEventListener("pointerup", (e) => {
    if (!selectedMesh) return;

    const info = getBoardInfo(e);
    const to = info ? info.square : null;

    // if we dropped on a legal destination, make the move
    if (legalMoves.find((m) => m.to === to)) {
      chess.move({ from: selectedFrom, to });
    }

    // clean up & re‐draw
    controls.enabled = true;
    domEl.releasePointerCapture(e.pointerId);

    selectedMesh = null;
    selectedFrom = null;
    legalMoves = [];

    // re‐render from the updated game state
    renderPieces(chess, piecesGroup);
  });
}
