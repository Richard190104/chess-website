import * as THREE from "three";

export function createBoard() {
  const group = new THREE.Group();
  const size = 1;

  // Add a beveled border around the board
  const borderThickness = 0.15;
  const boardSize = 8 * size;
  const borderGeom = new THREE.BoxGeometry(
    boardSize + borderThickness * 2,
    borderThickness,
    boardSize + borderThickness * 2,
  );
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    metalness: 0.3,
    roughness: 0.6,
  });
  const border = new THREE.Mesh(borderGeom, borderMat);
  border.position.set(3.5, -borderThickness / 2, 3.5);
  group.add(border);

  // Add chessboard squares
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      const geom = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshStandardMaterial({
        color: (x + z) % 2 ? 0x4e4e4e : 0xf5f5dc,
        metalness: 0.2,
        roughness: 0.5,
      });
      const square = new THREE.Mesh(geom, mat);

      square.rotation.x = -Math.PI / 2;
      square.position.set(x, 0.01, z);

      square.userData = { file: x, rank: z };

      group.add(square);
    }
  }

  // Optional: Add a subtle ambient shadow under the board
  const shadowGeom = new THREE.CircleGeometry(4.5, 32);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.15,
    transparent: true,
  });
  const shadow = new THREE.Mesh(shadowGeom, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(4, -0.14, 4);
  group.add(shadow);

  return group;
}
