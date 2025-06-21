import { createScene } from "./scene.js";
import { createBoard } from "./board.js";
import { preloadModels, renderPieces } from "./pieces.js";
import { setupInteraction } from "./controls.js";
// import { createGame } from "./game.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

async function init() {
  const container = document.getElementById("canvas-container");
  const { scene, camera, renderer } = createScene(container);

  // board
  const boardGroup = createBoard();
  boardGroup.name = "boardGroup";
  scene.add(boardGroup);

  // chess logic
  // const chess = createGame();

  // load all piece models before first render
  await preloadModels();
  renderPieces(chess, boardGroup);

  // orbit controls
  new OrbitControls(camera, renderer.domElement).target.set(3.5, 0, 3.5);

  // interaction
  setupInteraction(renderer.domElement, camera, scene, chess, renderPieces);

  // resize handling
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // render loop
  (function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  })();
}

init();
