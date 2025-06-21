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

  // a dedicated group for the green translucent highlights
  const highlights = new THREE.Group();
  scene.add(highlights);

  function clearHighlights() {
    highlights.clear();
  }

  function showHighlights(moves) {
    moves.forEach((m) => {
      const file = m.to.charCodeAt(0) - 97;
      const rank = parseInt(m.to[1], 10) - 1;
      const geom = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.4,
        depthWrite: false, // so it doesn’t occlude the piece underneath
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(file + 0.5, 0.02, rank + 0.5);
      highlights.add(mesh);
    });
  }

  function getBoardInfo(evt) {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(boardGroup.children);
    if (!hits.length) return null;
    const mesh = hits[0].object;
    const { file, rank } = mesh.userData;
    const square = String.fromCharCode(97 + file) + (rank + 1);
    return { file, rank, square, point: hits[0].point };
  }

  domEl.addEventListener("pointerdown", (e) => {
    const info = getBoardInfo(e);
    if (!info) return;

    // Find the piece at that square
    const candidate = piecesGroup.children.find(
      (m) =>
        Math.abs(m.position.x - (info.file + 0.5)) < 1e-3 &&
        Math.abs(m.position.z - (info.rank + 0.5)) < 1e-3,
    );
    if (!candidate) return;

    // Get legal moves for that square
    const moves = chess.moves({ square: info.square, verbose: true });
    if (!moves.length) return;

    // Start dragging
    selectedMesh = candidate;
    selectedFrom = info.square;
    legalMoves = moves;

    // Show green highlights
    clearHighlights();
    showHighlights(moves);

    // Disable orbit controls while dragging
    controls.enabled = false;
    domEl.setPointerCapture(e.pointerId);
  });

  domEl.addEventListener("pointermove", (e) => {
    if (!selectedMesh) return;
    const info = getBoardInfo(e);
    if (!info) return;
    // Move the mesh under the cursor (kept slightly above board)
    selectedMesh.position.x = info.point.x;
    selectedMesh.position.z = info.point.z;
  });

  domEl.addEventListener("pointerup", (e) => {
    if (!selectedMesh) return;

    const info = getBoardInfo(e);
    const to = info ? info.square : null;

    // If dropped on a highlighted square, commit the move
    if (legalMoves.find((m) => m.to === to)) {
      chess.move({ from: selectedFrom, to });
    }

    // Clean up
    controls.enabled = true;
    domEl.releasePointerCapture(e.pointerId);
    selectedMesh = null;
    selectedFrom = null;
    legalMoves = [];
    clearHighlights();

    // Re-draw all pieces according to the new position
    renderPieces(chess, piecesGroup);
  });
}
