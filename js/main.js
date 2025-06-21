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

  // Camera controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(3.5, 0, 3.5);

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
