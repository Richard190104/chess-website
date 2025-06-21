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

export async function preloadModels() {
  const promises = Object.entries(modelMap).map(([code, path]) =>
    loader.loadAsync(path).then((glb) => {
      cache[code] = glb.scene;
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

      const template = cache[code];
      if (!template) {
        // didn’t load that model
        continue;
      }

      const model = template.clone();
      model.position.set(file + 0.5, 0, rank + 0.5);
      model.scale.set(0.8, 0.8, 0.8);
      boardGroup.add(model);
    }
  }
}
