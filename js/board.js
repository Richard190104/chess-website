import * as THREE from "three";

export function createBoard() {
  const group = new THREE.Group();
  const size = 1;

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      const geom = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshStandardMaterial({
        color: (x + z) % 2 ? 0x777777 : 0xeeeeee,
      });
      const square = new THREE.Mesh(geom, mat);
      square.rotation.x = -Math.PI / 2;
      square.position.set(x + size / 2, 0, z + size / 2);
      group.add(square);
    }
  }

  return group;
}
