import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createScene } from "./scene.js";
import { createBoard } from "./board.js";
import { preloadModels, renderPieces } from "./pieces.js";
import { setupInteraction } from "./controls.js";
import { createGame } from "./game.js";

async function init() {

  
  const container = document.getElementById("canvas-container");
  const { scene, camera, renderer } = createScene(container);

  // Set camera position so the board is visible
  camera.position.set(3.5, 10, 13);
  camera.lookAt(3.5, 0, 3.5);

  // Board never cleared
  const boardGroup = createBoard();
  scene.add(boardGroup);

  // Pieces get cleared+repainted
  const piecesGroup = new THREE.Group();
  scene.add(piecesGroup);

  // Chess logic
  const chess = createGame();

  // Load & draw initial setup
  await preloadModels();
  renderPieces(chess, piecesGroup);

  // Camera controls: allow only rotation, no movement
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(3.5, 0, 3.5);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = camera.position.distanceTo(controls.target);
  controls.maxDistance = camera.position.distanceTo(controls.target);
  controls.update();

  // Interactivity
  setupInteraction(
    renderer.domElement,
    camera,
    scene,
    chess,
    renderPieces,
    boardGroup,
    piecesGroup,
    controls,
  );

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Render loop
  (function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  })();
}

init();
