import * as THREE from "three";

// Small building blocks shared by the planet and the temple garden

const materials = new Map();
export function material(color) {
  if (!materials.has(color)) {
    materials.set(
      color,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        flatShading: true,
      }),
    );
  }
  return materials.get(color);
}

export function mesh(
  geometry,
  color,
  { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 } = {},
) {
  const m = new THREE.Mesh(
    geometry,
    typeof color === "string" ? material(color) : color,
  );
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function group(...children) {
  const g = new THREE.Group();
  if (children.length) g.add(...children);
  return g;
}

// Repeatable randomness so things land in the same spots on every visit
export function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Floating name tag
export function buildLabel(text, background = "#212123") {
  const font = "700 44px Inter, sans-serif";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 56;
  canvas.height = 84;

  ctx.font = font;
  ctx.fillStyle = background;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, canvas.height / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthWrite: false }),
  );
  const height = 0.6;
  label.scale.set((height * canvas.width) / canvas.height, height, 1);
  return label;
}
