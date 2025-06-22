import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const modelMap = {
  p: "models/bP.glb",
  P: "models/wP.glb",
  n: "models/bN.glb",
  N: "models/wN.glb",
  b: "models/bB.glb",
  B: "models/wB.glb",
  r: "models/bR.glb",
  R: "models/wR.glb",
  q: "models/bQ.glb",
  Q: "models/wQ.glb",
  k: "models/bK.glb",
  K: "models/wK.glb",
};
const cache = {};

function setModelColor(model, color) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.01,
        roughness: 0.9,
      });
    }
  });
}

export async function preloadModels() {
  const squareSize = 1; // your board squares are 1×1
  const scl = 0.8; // scale to 80% of square width

  const promises = Object.entries(modelMap).map(([code, path]) =>
    loader.loadAsync(path).then((gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxXZ = Math.max(size.x, size.z);
      const s = (squareSize * scl) / maxXZ;
      model.scale.setScalar(s);

      box.setFromObject(model);
      const minY = box.min.y;

      model.position.y = -minY;

      // Set color: black pieces get black, white pieces get white
      if (code === code.toUpperCase()) {
        setModelColor(model, 0xffffff); // white
      } else {
        setModelColor(model, 0x222222); // black
      }

      cache[code] = model;
    }),
  );

  await Promise.all(promises);
}

export function renderPieces(chess, piecesGroup) {
  piecesGroup.clear();
  const layout = chess.board();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = layout[7 - rank][7 - file];
      if (!piece) continue;

      const code = piece.color === "w" ? piece.type.toUpperCase() : piece.type;

      const template = cache[code];
      if (!template) continue;

      const mesh = template.clone();
      mesh.position.x = file + 0.5;
      mesh.position.z = rank + 0.5;

      piecesGroup.add(mesh);
    }
  }
}
