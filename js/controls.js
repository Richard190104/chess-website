import * as THREE from "three";

export function setupInteraction(
  rendererDom,
  camera,
  scene,
  chess,
  renderPieces,
) {
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selected = null;
  let moves = [];

  function getSquareFromIntersect(intersectPoint) {
    const x = Math.floor(intersectPoint.x);
    const z = Math.floor(intersectPoint.z);
    return String.fromCharCode(97 + x) + (z + 1);
  }

  function onDown(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(scene.children, true);
    if (!hits.length) return;
    // the first hit in boardGroup: you might tag or filter those meshes
    const pt = hits[0].point;
    const sq = getSquareFromIntersect(pt);
    moves = chess.moves({ square: sq, verbose: true });
    if (moves.length) selected = sq;
  }

  function onUp(e) {
    if (!selected) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(scene.children, true);
    if (!hits.length) {
      selected = null;
      return;
    }
    const pt = hits[0].point;
    const to = getSquareFromIntersect(pt);
    if (moves.find((m) => m.to === to)) {
      chess.move({ from: selected, to });
      renderPieces(chess, scene.getObjectByName("boardGroup"));
    }
    selected = null;
    moves = [];
  }

  rendererDom.addEventListener("pointerdown", onDown);
  rendererDom.addEventListener("pointerup", onUp);
}
