import * as THREE from "three";
import { GLTFLoader } from "three/examples/js/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const modelMap = {
  p: "models/bP.gltf",
  P: "models/wP.gltf",
  n: "models/bN.gltf",
  N: "models/wN.gltf",
  b: "models/bB.gltf",
  B: "models/wB.gltf",
  r: "models/bR.gltf",
  R: "models/wR.gltf",
  q: "models/bQ.gltf",
  Q: "models/wQ.gltf",
  k: "models/bK.gltf",
  K: "models/wK.gltf",
};
const cache = {};

export async function preloadModels() {
  const promises = Object.entries(modelMap).map(([code, path]) =>
    loader.loadAsync(path).then((gltf) => {
      cache[code] = gltf.scene;
    }),
  );
  await Promise.all(promises);
}

export function renderPieces(chess, boardGroup) {
  boardGroup.clear();
  const layout = chess.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = layout[7 - rank][file];
      if (!piece) continue;
      const code = piece.color === "w" ? piece.type.toUpperCase() : piece.type;
      const model = cache[code].clone();
      model.position.set(file + 0.5, 0, rank + 0.5);
      model.scale.set(0.8, 0.8, 0.8);
      boardGroup.add(model);
    }
  }
}
