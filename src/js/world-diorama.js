import * as THREE from "three";
import { mesh, group, buildLabel, seededRandom } from "./world-kit.js";

// ----------------------------
// The temple garden behind Jeff's house: a floating diorama island
// with a Chinese temple (west), a Japanese temple (east) and a stream
// with an arched bridge in between. +X is east, -Z is north.
// ----------------------------

const C = {
  grass: "#a3cf8f",
  soil: "#9a6c4b",
  rock: "#6e5f55",
  path: "#e6dccb",
  stone: "#bdb8ae",
  water: "#79c3d9",
  red: "#c4372c",
  doorRed: "#8e2a21",
  gold: "#e3b23c",
  amber: "#e39a2d",
  bronze: "#8a6a3a",
  vermilion: "#d9542f",
  wood: "#5a3b2a",
  deck: "#a8714a",
  plaster: "#f1ebdf",
  roofGrey: "#4b515a",
  ridge: "#33373d",
  gravel: "#e2ddd2",
  blossom: ["#f7c1d0", "#f2a3bb", "#fbd6e0"],
  pine: "#3f7d5a",
  bamboo: "#86b55a",
  trunk: "#6e4b36",
  cream: "#f4efe6",
  coral: "#e8664f",
  teal: "#2aa7c9",
};

const HALF_W = 17; // island is 34 wide (x)
const HALF_D = 15; // and 30 deep (z)
const STREAM = { z: 4.5, depth: 2.4 };
const BRIDGE = { z0: 2.6, z1: 6.4, halfWidth: 1.2, rise: 0.75 };
const START = new THREE.Vector3(0, 0, 8); // far enough in that the house never hides you

const rand = seededRandom(21);

const Y = new THREE.Vector3(0, 1, 0);

// ----------------------------
// Parts
// ----------------------------
const roofMaterials = new Map();
function roofMaterial(color) {
  if (!roofMaterials.has(color))
    roofMaterials.set(
      color,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    );
  return roofMaterials.get(color);
}

// A hipped roof that sweeps down (concave) and flicks up at the corners
function curvedRoof(w, d, h, lift, color) {
  const geometry = new THREE.PlaneGeometry(w, d, 12, 12);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const hw = w / 2;
  const hd = d / 2;
  const half = Math.min(hw, hd);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const ex = Math.max(0, Math.abs(x) - (hw - half)) / half;
    const ez = Math.max(0, Math.abs(z) - (hd - half)) / half;
    const m = Math.min(1, Math.max(ex, ez)); // 0 at the ridge, 1 at the eaves
    const corner = Math.pow((Math.abs(x) / hw) * (Math.abs(z) / hd), 3);
    pos.setY(i, h * Math.pow(1 - m, 1.7) + lift * corner);
  }
  geometry.computeVertexNormals();
  return mesh(geometry, roofMaterial(color));
}

function glowMaterial(color, intensity = 0.6) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.6,
    flatShading: true,
  });
}

function redLantern() {
  const lantern = group(
    mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4), C.ridge, {
      y: -0.22,
    }),
    mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 10), C.gold, {
      y: -0.46,
    }),
    mesh(new THREE.SphereGeometry(0.3, 10, 8), glowMaterial("#e0442f", 0.45), {
      y: -0.78,
    }),
    mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 10), C.gold, {
      y: -1.1,
    }),
    mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 5), C.gold, { y: -1.27 }),
  );
  lantern.children[2].scale.y = 1.15;
  return lantern;
}

function stoneLion() {
  return group(
    mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), C.stone, { y: 0.3 }),
    mesh(new THREE.SphereGeometry(0.3, 8, 6), C.stone, { y: 0.85 }),
    mesh(new THREE.SphereGeometry(0.26, 8, 6), C.stone, { y: 1.25, z: 0.12 }),
    mesh(new THREE.SphereGeometry(0.07, 6, 4), C.ridge, {
      x: -0.1,
      y: 1.3,
      z: 0.34,
    }),
    mesh(new THREE.SphereGeometry(0.07, 6, 4), C.ridge, {
      x: 0.1,
      y: 1.3,
      z: 0.34,
    }),
  );
}

function buildChineseTemple() {
  const temple = group(
    // Stone platform and steps
    mesh(new THREE.BoxGeometry(8, 0.6, 6), C.stone, { y: 0.3 }),
    mesh(new THREE.BoxGeometry(3, 0.4, 0.6), C.stone, { y: 0.2, z: 3.3 }),
    mesh(new THREE.BoxGeometry(3, 0.2, 0.6), C.stone, { y: 0.1, z: 3.9 }),
    // Hall, doors and the gold beam
    mesh(new THREE.BoxGeometry(6, 2.6, 4), C.red, { y: 1.9, z: -0.4 }),
    mesh(new THREE.BoxGeometry(1.8, 2.1, 0.1), C.doorRed, { y: 1.65, z: 1.6 }),
    mesh(new THREE.BoxGeometry(2.1, 0.14, 0.14), C.gold, { y: 2.75, z: 1.66 }),
    mesh(new THREE.BoxGeometry(0.06, 2.1, 0.12), C.gold, { y: 1.65, z: 1.67 }),
    mesh(new THREE.BoxGeometry(6.4, 0.3, 0.3), C.gold, { y: 3.05, z: 2.3 }),
    // Name board over the door
    mesh(new THREE.BoxGeometry(1.4, 0.5, 0.08), C.ridge, { y: 3.05, z: 2.47 }),
    mesh(new THREE.BoxGeometry(1.1, 0.25, 0.04), C.gold, { y: 3.05, z: 2.52 }),
  );
  for (const x of [-2.6, -0.9, 0.9, 2.6])
    temple.add(
      mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.6, 10), C.red, {
        x,
        y: 1.9,
        z: 2.3,
      }),
    );

  // Double-eave roof with an upper storey
  const lowerRoof = curvedRoof(8, 6.4, 0.9, 0.55, C.amber);
  lowerRoof.position.set(0, 3.15, -0.1);
  const upperRoof = curvedRoof(6, 4.2, 1.3, 0.6, C.amber);
  upperRoof.position.set(0, 4.3, -0.2);
  temple.add(
    lowerRoof,
    mesh(new THREE.BoxGeometry(4.4, 0.95, 2.8), C.red, { y: 3.9, z: -0.2 }),
    upperRoof,
    // Ridge with curled "swallowtail" ends and a pearl
    mesh(new THREE.BoxGeometry(2.3, 0.28, 0.3), C.red, { y: 5.65, z: -0.2 }),
    mesh(new THREE.ConeGeometry(0.16, 0.8, 5), C.gold, {
      x: -1.3,
      y: 5.95,
      z: -0.2,
      rz: 0.7,
    }),
    mesh(new THREE.ConeGeometry(0.16, 0.8, 5), C.gold, {
      x: 1.3,
      y: 5.95,
      z: -0.2,
      rz: -0.7,
    }),
    mesh(new THREE.SphereGeometry(0.22, 10, 8), glowMaterial(C.gold, 0.3), {
      y: 6.05,
      z: -0.2,
    }),
  );

  const lanterns = [-1.7, 1.7].map((x) => {
    const lantern = redLantern();
    lantern.position.set(x, 2.9, 2.6);
    temple.add(lantern);
    return lantern;
  });

  for (const x of [-1.9, 1.9]) {
    const lion = stoneLion();
    lion.position.set(x, 0, 3.9);
    temple.add(lion);
  }
  return { object: temple, lanterns };
}

// Incense burner with smoke curling up
function buildIncenseBurner() {
  const burner = group(
    mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.6, 8), C.bronze, { y: 0.75 }),
    mesh(new THREE.TorusGeometry(0.6, 0.06, 5, 12), C.gold, {
      y: 1.05,
      rx: Math.PI / 2,
    }),
    mesh(new THREE.TorusGeometry(0.16, 0.04, 4, 8), C.bronze, {
      x: -0.66,
      y: 1.1,
    }),
    mesh(new THREE.TorusGeometry(0.16, 0.04, 4, 8), C.bronze, {
      x: 0.66,
      y: 1.1,
    }),
  );
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    burner.add(
      mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5), C.bronze, {
        x: Math.sin(a) * 0.4,
        y: 0.25,
        z: Math.cos(a) * 0.4,
      }),
    );
  }
  for (const x of [-0.12, 0, 0.12])
    burner.add(
      mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), C.doorRed, {
        x,
        y: 1.25,
      }),
    );

  const puffs = [];
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.16, 1),
      new THREE.MeshStandardMaterial({
        color: "#f4f1ec",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        flatShading: true,
      }),
    );
    puff.userData.offset = i / 5;
    burner.add(puff);
    puffs.push(puff);
  }
  return { object: burner, puffs };
}

function buildJapaneseHall() {
  const hall = group(
    mesh(new THREE.BoxGeometry(6.6, 0.5, 5.2), C.stone, { y: 0.25 }),
    mesh(new THREE.BoxGeometry(6, 0.12, 4.6), C.deck, { y: 0.56 }),
    mesh(new THREE.BoxGeometry(1.6, 0.25, 0.5), C.deck, { y: 0.12, z: 2.85 }),
    mesh(new THREE.BoxGeometry(4.8, 2, 3.4), C.plaster, { y: 1.62 }),
    mesh(new THREE.BoxGeometry(5.1, 0.2, 0.22), C.wood, { y: 2.55, z: 1.75 }),
    mesh(new THREE.BoxGeometry(5.1, 0.12, 0.16), C.wood, { y: 1.5, z: 1.72 }),
    // Sliding doors
    mesh(new THREE.BoxGeometry(1.4, 1.7, 0.06), "#e8dcc4", {
      y: 1.47,
      z: 1.71,
    }),
    mesh(new THREE.BoxGeometry(0.05, 1.7, 0.08), C.wood, { y: 1.47, z: 1.73 }),
  );
  for (const [x, z] of [
    [-2.4, 1.7],
    [-0.8, 1.7],
    [0.8, 1.7],
    [2.4, 1.7],
    [-2.4, -1.7],
    [2.4, -1.7],
  ])
    hall.add(
      mesh(new THREE.CylinderGeometry(0.12, 0.12, 2, 8), C.wood, {
        x,
        y: 1.62,
        z,
      }),
    );

  const roof = curvedRoof(7.4, 6, 2.1, 0.3, C.roofGrey);
  roof.position.y = 2.62;
  hall.add(
    roof,
    mesh(new THREE.BoxGeometry(1.9, 0.3, 0.36), C.ridge, { y: 4.75 }),
    mesh(new THREE.BoxGeometry(0.3, 0.45, 0.4), C.ridge, { x: -1, y: 4.85 }),
    mesh(new THREE.BoxGeometry(0.3, 0.45, 0.4), C.ridge, { x: 1, y: 4.85 }),
  );
  return hall;
}

function buildPagoda() {
  const pagoda = group(
    mesh(new THREE.BoxGeometry(3, 0.5, 3), C.stone, { y: 0.25 }),
  );
  let y = 0.5;
  for (const size of [2.2, 1.95, 1.7, 1.45, 1.2]) {
    pagoda.add(
      mesh(new THREE.BoxGeometry(size, 0.9, size), C.vermilion, {
        y: y + 0.45,
      }),
      mesh(new THREE.BoxGeometry(size + 0.04, 0.3, size + 0.04), C.plaster, {
        y: y + 0.6,
      }),
    );
    const roof = curvedRoof(size + 1.3, size + 1.3, 0.45, 0.35, C.roofGrey);
    roof.position.y = y + 0.9;
    pagoda.add(roof);
    y += 1.22;
  }
  pagoda.add(
    mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.6, 6), C.bronze, {
      y: y + 0.6,
    }),
  );
  for (let i = 0; i < 5; i++)
    pagoda.add(
      mesh(new THREE.TorusGeometry(0.13, 0.03, 4, 10), C.bronze, {
        y: y + 0.3 + i * 0.2,
        rx: Math.PI / 2,
      }),
    );
  return pagoda;
}

function buildTorii() {
  const torii = group(
    mesh(new THREE.BoxGeometry(3.9, 0.2, 0.22), C.vermilion, { y: 2.55 }),
    mesh(new THREE.BoxGeometry(0.22, 0.6, 0.16), C.vermilion, { y: 2.9 }),
    mesh(new THREE.BoxGeometry(4.3, 0.22, 0.36), C.vermilion, { y: 3.15 }),
    mesh(new THREE.BoxGeometry(2.6, 0.24, 0.42), C.ridge, { y: 3.37 }),
    mesh(new THREE.BoxGeometry(1.2, 0.24, 0.42), C.ridge, {
      x: -1.82,
      y: 3.44,
      rz: -0.12,
    }),
    mesh(new THREE.BoxGeometry(1.2, 0.24, 0.42), C.ridge, {
      x: 1.82,
      y: 3.44,
      rz: 0.12,
    }),
  );
  for (const x of [-1.6, 1.6])
    torii.add(
      mesh(new THREE.CylinderGeometry(0.17, 0.2, 3.2, 10), C.vermilion, {
        x,
        y: 1.6,
      }),
      mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.35, 10), C.ridge, {
        x,
        y: 0.175,
      }),
    );
  return torii;
}

function buildStoneLantern() {
  return group(
    mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.2, 6), C.stone, { y: 0.1 }),
    mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 6), C.stone, { y: 0.6 }),
    mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.15, 6), C.stone, {
      y: 1.07,
    }),
    mesh(new THREE.BoxGeometry(0.36, 0.3, 0.36), glowMaterial("#ffd98a", 0.7), {
      y: 1.3,
    }),
    mesh(new THREE.ConeGeometry(0.45, 0.35, 6), C.stone, { y: 1.62 }),
    mesh(new THREE.SphereGeometry(0.08, 6, 4), C.stone, { y: 1.85 }),
  );
}

function buildBridge() {
  const bridge = group();
  const length = BRIDGE.z1 - BRIDGE.z0;
  const steps = 12;
  const segment = (zA, zB, width, height, color, x, lift) => {
    const yA = bridgeHeight(zA) + lift;
    const yB = bridgeHeight(zB) + lift;
    const piece = mesh(
      new THREE.BoxGeometry(width, height, Math.hypot(zB - zA, yB - yA) + 0.02),
      color,
      { x, y: (yA + yB) / 2, z: (zA + zB) / 2 },
    );
    piece.rotation.x = -Math.atan2(yB - yA, zB - zA);
    return piece;
  };
  for (let i = 0; i < steps; i++) {
    const zA = BRIDGE.z0 + (length * i) / steps;
    const zB = BRIDGE.z0 + (length * (i + 1)) / steps;
    bridge.add(segment(zA, zB, BRIDGE.halfWidth * 2, 0.12, C.deck, 0, -0.06));
    for (const x of [-1.15, 1.15])
      bridge.add(segment(zA, zB, 0.09, 0.09, C.vermilion, x, 0.62));
  }
  for (let i = 0; i <= steps; i += 3) {
    const z = BRIDGE.z0 + (length * i) / steps;
    for (const x of [-1.15, 1.15])
      bridge.add(
        mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.66, 6), C.vermilion, {
          x,
          y: bridgeHeight(z) + 0.31,
          z,
        }),
      );
  }
  return bridge;
}

function bridgeHeight(z) {
  if (z <= BRIDGE.z0 || z >= BRIDGE.z1) return 0;
  return (
    BRIDGE.rise *
    Math.sin((Math.PI * (z - BRIDGE.z0)) / (BRIDGE.z1 - BRIDGE.z0))
  );
}

// The back of Jeff's house: the way back to the planet
function buildBackDoor() {
  const roof = mesh(new THREE.ConeGeometry(2.4, 1.3, 4), C.coral, {
    y: 2.85,
    ry: Math.PI / 4,
  });
  roof.scale.z = 0.65;
  const house = group(
    mesh(new THREE.BoxGeometry(3.2, 2.2, 1.6), C.cream, { y: 1.1 }),
    roof,
    mesh(new THREE.BoxGeometry(0.75, 1.35, 0.06), C.trunk, {
      y: 0.68,
      z: 0.81,
    }),
    mesh(new THREE.SphereGeometry(0.05, 6, 4), C.gold, {
      x: 0.24,
      y: 0.68,
      z: 0.86,
    }),
    mesh(new THREE.BoxGeometry(0.6, 0.5, 0.06), C.teal, {
      x: -1,
      y: 1.35,
      z: 0.81,
    }),
    mesh(new THREE.BoxGeometry(0.6, 0.5, 0.06), C.teal, {
      x: 1,
      y: 1.35,
      z: 0.81,
    }),
    mesh(new THREE.BoxGeometry(1.1, 0.03, 0.6), C.coral, { y: 0.02, z: 1.2 }),
  );
  return house;
}

function buildSakura() {
  const tree = group(
    mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.7, 6), C.trunk, { y: 0.85 }),
    mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9, 5), C.trunk, {
      x: 0.3,
      y: 1.75,
      rz: -0.6,
    }),
  );
  const puffs = [
    [0, 2.2, 0, 1.05],
    [0.75, 2.0, 0.3, 0.8],
    [-0.6, 2.05, -0.35, 0.85],
    [0.15, 2.75, -0.15, 0.75],
    [-0.2, 1.95, 0.6, 0.7],
  ];
  for (const [x, y, z, r] of puffs)
    tree.add(
      mesh(
        new THREE.IcosahedronGeometry(r, 0),
        C.blossom[Math.floor(rand() * C.blossom.length)],
        { x, y, z, ry: rand() * Math.PI },
      ),
    );
  tree.scale.setScalar(1 + rand() * 0.3);
  tree.rotation.y = rand() * Math.PI * 2;
  return tree;
}

// Windswept pine, like a big bonsai
function buildPine() {
  const tree = group(
    mesh(new THREE.CylinderGeometry(0.14, 0.24, 2.2, 6), C.trunk, {
      y: 1.05,
      rz: 0.18,
    }),
  );
  for (const [x, y, z, s] of [
    [-0.3, 2.3, 0, 1.2],
    [0.7, 1.7, 0.2, 0.95],
    [-0.9, 1.4, -0.2, 0.8],
    [0.1, 2.85, -0.1, 0.75],
  ]) {
    const pad = mesh(new THREE.DodecahedronGeometry(s, 0), C.pine, {
      x,
      y,
      z,
    });
    pad.scale.set(1.2, 0.42, 1);
    tree.add(pad);
  }
  tree.rotation.y = rand() * Math.PI * 2;
  return tree;
}

function buildBamboo() {
  const clump = group();
  for (let i = 0; i < 7; i++) {
    const h = 2.6 + rand() * 1.8;
    const x = (rand() - 0.5) * 1;
    const z = (rand() - 0.5) * 1;
    clump.add(
      mesh(new THREE.CylinderGeometry(0.06, 0.07, h, 6), C.bamboo, {
        x,
        y: h / 2,
        z,
        rx: (rand() - 0.5) * 0.12,
        rz: (rand() - 0.5) * 0.12,
      }),
      mesh(new THREE.ConeGeometry(0.28, 0.7, 5), "#6fa14b", {
        x,
        y: h + 0.1,
        z,
      }),
    );
  }
  return clump;
}

function buildKoi(color) {
  const koi = group(
    mesh(new THREE.BoxGeometry(0.46, 0.08, 0.16), color),
    mesh(new THREE.BoxGeometry(0.16, 0.09, 0.1), "#ffffff", { x: 0.06 }),
    mesh(new THREE.BoxGeometry(0.12, 0.02, 0.18), color, { x: -0.27 }),
  );
  for (const m of koi.children) m.castShadow = false;
  return koi;
}

// ----------------------------
// The garden
// ----------------------------
export function createDiorama({ walkSpeed, turnSpeed, playerRadius, isTouch }) {
  const scene = new THREE.Scene();

  scene.add(new THREE.HemisphereLight("#fff4e8", "#a3cf8f", 1.3));
  const sun = new THREE.DirectionalLight("#fff1dc", 2.3);
  sun.position.set(12, 24, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(isTouch ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -24,
    right: 24,
    top: 24,
    bottom: -24,
    near: 1,
    far: 70,
  });
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // Island: grass on top, layers of soil and rock showing on the sides
  const north = HALF_D + (STREAM.z - STREAM.depth / 2);
  const south = HALF_D - (STREAM.z + STREAM.depth / 2);
  scene.add(
    mesh(new THREE.BoxGeometry(HALF_W * 2, 0.4, north), C.grass, {
      y: -0.2,
      z: -HALF_D + north / 2,
    }),
    mesh(new THREE.BoxGeometry(HALF_W * 2, 0.4, south), C.grass, {
      y: -0.2,
      z: HALF_D - south / 2,
    }),
    mesh(
      new THREE.BoxGeometry(HALF_W * 2 - 0.2, 2.4, HALF_D * 2 - 0.2),
      C.soil,
      { y: -1.6 },
    ),
    mesh(
      new THREE.BoxGeometry(HALF_W * 2 - 0.8, 1.4, HALF_D * 2 - 0.8),
      C.rock,
      { y: -3.5 },
    ),
  );

  // Stream with koi and lily pads
  const water = new THREE.Mesh(
    new THREE.BoxGeometry(HALF_W * 2, 0.34, STREAM.depth),
    new THREE.MeshStandardMaterial({
      color: C.water,
      transparent: true,
      opacity: 0.82,
      roughness: 0.2,
    }),
  );
  water.position.set(0, -0.27, STREAM.z);
  water.receiveShadow = true;
  scene.add(water);
  for (const [x, z] of [
    [-6, 3.9],
    [-11, 5.1],
    [4.5, 5.2],
    [12.5, 4],
  ])
    scene.add(
      mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 9), "#5f9e5a", {
        x,
        y: -0.09,
        z,
      }),
    );
  const koi = ["#f07a3a", "#f2f2f2", "#e8553b", "#f0a33a", "#f07a3a"].map(
    (color, i) => {
      const fish = buildKoi(color);
      fish.position.y = -0.2;
      fish.userData = {
        offset: rand() * HALF_W * 2,
        speed: (0.6 + rand() * 0.5) * (i % 2 ? -1 : 1),
        lane: (rand() - 0.5) * 1.2,
      };
      scene.add(fish);
      return fish;
    },
  );
  scene.add(buildBridge());

  // Paths
  for (const [x, z, w, d] of [
    [0, 9.5, 2, 6.2], // from the back door to the bridge
    [0, 1.95, 2, 1.3], // bridge to the crossing
    [0, 0.5, 19.6, 1.6], // crossing, east to west
    [-9, -1.6, 5.6, 2.8], // Chinese temple courtyard
    [9, -2.5, 1.8, 4.4], // Japanese temple approach
  ])
    scene.add(
      mesh(new THREE.BoxGeometry(w, 0.04, d), C.path, { x, y: 0.01, z }),
    );

  // Things you can bump into (circles and boxes on the ground)
  const circles = [];
  const boxes = [];
  const addBox = (x, z, w, d) =>
    boxes.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
    });
  const add = (object, x, z, radius) => {
    object.position.x = x;
    object.position.z = z;
    scene.add(object);
    if (radius) circles.push({ x, z, r: radius });
    return object;
  };

  // Stream banks (the bridge is the only way across)
  const bankWidth = HALF_W - BRIDGE.halfWidth - 0.1;
  addBox(-HALF_W + bankWidth / 2 - 1, STREAM.z, bankWidth + 2, STREAM.depth);
  addBox(HALF_W - bankWidth / 2 + 1, STREAM.z, bankWidth + 2, STREAM.depth);
  for (const x of [-1.15, 1.15])
    for (const z of [BRIDGE.z0, BRIDGE.z1]) circles.push({ x, z, r: 0.12 });

  // Back door
  const backDoor = buildBackDoor();
  backDoor.rotation.y = Math.PI;
  add(backDoor, 0, 13.6);
  addBox(0, 13.6, 3.2, 1.6);

  // Chinese temple, west
  const chinese = buildChineseTemple();
  add(chinese.object, -9, -7);
  addBox(-9, -7, 8, 6);
  addBox(-9, -3.4, 3, 1.2);
  circles.push({ x: -10.9, z: -3.1, r: 0.5 }, { x: -7.1, z: -3.1, r: 0.5 });
  const burner = buildIncenseBurner();
  add(burner.object, -9, -1.4, 0.75);

  // Japanese temple, east
  add(buildJapaneseHall(), 9, -8);
  addBox(9, -8, 6.6, 5.2);
  addBox(9, -5.15, 1.6, 0.5);
  add(buildPagoda(), 14.2, -12);
  addBox(14.2, -12, 3, 3);
  add(buildTorii(), 9, -2);
  circles.push({ x: 7.4, z: -2, r: 0.3 }, { x: 10.6, z: -2, r: 0.3 });
  add(buildStoneLantern(), 7.1, -4, 0.45);
  add(buildStoneLantern(), 10.9, -4, 0.45);

  // Raked gravel garden beside the approach
  scene.add(
    mesh(new THREE.BoxGeometry(4.6, 0.04, 3.4), C.gravel, {
      x: 13.8,
      y: 0.01,
      z: -1.6,
    }),
  );
  for (let i = 0; i < 6; i++)
    scene.add(
      mesh(new THREE.BoxGeometry(4.4, 0.02, 0.05), "#cfc8ba", {
        x: 13.8,
        y: 0.04,
        z: -3.0 + i * 0.55,
      }),
    );
  for (const [x, z, r] of [
    [12.8, -2.2, 0.5],
    [15, -1, 0.38],
    [14.4, -2.7, 0.28],
  ])
    add(
      mesh(new THREE.DodecahedronGeometry(r, 0), C.stone, { y: r * 0.5 }),
      x,
      z,
      r + 0.05,
    );

  // Trees
  const sakuraSpots = [
    [4.6, -12.6],
    [15.3, -6.4],
    [5.2, -3.4],
    [12.5, 8],
    [5.2, 10],
    [15.3, 1.6],
    [-6.5, 8.6],
    [9, 12.2],
  ];
  for (const [x, z] of sakuraSpots) add(buildSakura(), x, z, 0.4);
  for (const [x, z] of [
    [-14.8, -2.2],
    [-4.2, -12.4],
    [-14, 8.6],
    [-3.4, -4.6],
  ])
    add(buildPine(), x, z, 0.45);
  for (const [x, z] of [
    [-15.6, -12.8],
    [-15.6, -7.6],
    [-12.8, 12.8],
    [-4.8, 12.6],
  ])
    add(buildBamboo(), x, z, 0.75);
  for (const [x, z, r] of [
    [-5, 2.9, 0.4],
    [-12, 6.2, 0.35],
    [6, 6.2, 0.45],
    [13, 2.9, 0.3],
  ])
    add(
      mesh(new THREE.DodecahedronGeometry(r, 0), C.stone, { y: r * 0.4 }),
      x,
      z,
      r + 0.05,
    );

  // Cherry blossom petals drifting down
  const PETALS = 140;
  const petalPositions = new Float32Array(PETALS * 3);
  const petalData = [];
  const respawnPetal = (i, anywhere) => {
    const [x, z] = sakuraSpots[Math.floor(rand() * sakuraSpots.length)];
    petalPositions[i * 3] = x + (rand() - 0.5) * 3;
    petalPositions[i * 3 + 1] = anywhere ? rand() * 3 : 2.4 + rand();
    petalPositions[i * 3 + 2] = z + (rand() - 0.5) * 3;
    petalData[i] = { fall: 0.35 + rand() * 0.4, phase: rand() * 6 };
  };
  for (let i = 0; i < PETALS; i++) respawnPetal(i, true);
  const petalGeometry = new THREE.BufferGeometry();
  petalGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(petalPositions, 3),
  );
  scene.add(
    new THREE.Points(
      petalGeometry,
      new THREE.PointsMaterial({ color: "#f5a9c0", size: 0.12 }),
    ),
  );

  // ----------------------------
  // Spots: walk up to one and its card opens
  // ----------------------------
  const spots = [
    {
      id: "back-door",
      label: "Back door",
      x: 0,
      z: 10.5,
      near: 3.2,
      eyebrow: "Jeff's back garden",
      title: "A little temple garden",
      body: `<p>Cross the bridge to visit a Chinese temple and a Japanese temple. Come back to this door to head outside.</p>`,
      action: "exit",
      actionLabel: "Back to the planet",
    },
    {
      id: "chinese-temple",
      label: "Chinese temple",
      x: -9,
      z: -2.6,
      near: 3.4,
      labelAt: [-9, 7, -7],
      eyebrow: "Temple garden",
      title: "Chinese temple",
      body: `<p>Red pillars, a double roof with curled ridges, lanterns and an incense burner out front.</p>`,
    },
    {
      id: "japanese-temple",
      label: "Japanese temple",
      x: 9,
      z: -3.4,
      near: 3.6,
      labelAt: [9, 6, -8],
      eyebrow: "Temple garden",
      title: "Japanese temple",
      body: `<p>Walk through the torii gate to the hall. The five-storey pagoda and the raked gravel garden sit beside it.</p>`,
    },
  ];
  // The back door needs no label: its card and the "Back outside" button cover it
  const labels = spots
    .filter((spot) => spot.labelAt)
    .map((spot, i) => {
      const label = buildLabel(spot.label);
      label.position.set(...spot.labelAt);
      label.userData.baseY = spot.labelAt[1];
      label.userData.phase = i * 1.7;
      scene.add(label);
      return label;
    });

  // ----------------------------
  // Walking on flat ground
  // ----------------------------
  const position = START.clone();
  const forward = new THREE.Vector3(0, 0, -1);

  function collide() {
    const r = playerRadius;
    for (const c of circles) {
      const dx = position.x - c.x;
      const dz = position.z - c.z;
      const d = Math.hypot(dx, dz);
      const gap = c.r + r - d;
      if (gap > 0 && d > 1e-6) {
        position.x += (dx / d) * gap;
        position.z += (dz / d) * gap;
      }
    }
    for (const b of boxes) {
      const cx = THREE.MathUtils.clamp(position.x, b.minX, b.maxX);
      const cz = THREE.MathUtils.clamp(position.z, b.minZ, b.maxZ);
      const dx = position.x - cx;
      const dz = position.z - cz;
      const d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d > 1e-6) {
        position.x = cx + (dx / d) * r;
        position.z = cz + (dz / d) * r;
        continue;
      }
      // Centre ended up inside the box: push out the shortest way
      const outs = [
        [b.minX - r - position.x, 0],
        [b.maxX + r - position.x, 0],
        [0, b.minZ - r - position.z],
        [0, b.maxZ + r - position.z],
      ].sort((a, c) => Math.hypot(...a) - Math.hypot(...c));
      position.x += outs[0][0];
      position.z += outs[0][1];
    }
    position.x = THREE.MathUtils.clamp(position.x, -HALF_W + r, HALF_W - r);
    position.z = THREE.MathUtils.clamp(position.z, -HALF_D + r, HALF_D - r);
  }

  return {
    scene,
    position,
    forward,
    background: "linear-gradient(#fbe1e3, #fdf4ea)",
    // Where the camera starts when you walk in, so it swoops down to you
    overview: new THREE.Vector3(0, 26, 36),

    reset() {
      position.copy(START);
      forward.set(0, 0, -1);
    },

    move(dt, forwardInput, turnInput) {
      if (turnInput) forward.applyAxisAngle(Y, turnInput * turnSpeed * dt);
      const speed = forwardInput * walkSpeed * (forwardInput < 0 ? 0.5 : 1);
      if (speed) {
        position.addScaledVector(forward, speed * dt);
        collide();
      }
      position.y =
        Math.abs(position.x) < BRIDGE.halfWidth + 0.1
          ? bridgeHeight(position.z)
          : 0;
      return Math.abs(forwardInput) > 0 ? 1 : turnInput ? 0.4 : 0;
    },

    nearestSpot() {
      let best = null;
      let bestDistance = Infinity;
      for (const spot of spots) {
        const d = Math.hypot(position.x - spot.x, position.z - spot.z);
        if (d < spot.near && d < bestDistance) {
          best = spot;
          bestDistance = d;
        }
      }
      return best;
    },

    update(dt, elapsed, reduceMotion) {
      // With reduced motion the koi hold still and nothing else moves
      const t = reduceMotion ? 0 : elapsed;
      for (const fish of koi) {
        const { offset, speed, lane } = fish.userData;
        const span = HALF_W * 2 - 1;
        const travel = (((offset + t * speed) % span) + span) % span;
        fish.position.x = travel - span / 2;
        fish.position.z = STREAM.z + lane + Math.sin(t * 1.3 + offset) * 0.25;
        fish.rotation.y = speed > 0 ? 0 : Math.PI;
      }
      if (reduceMotion) return;

      for (const [i, lantern] of chinese.lanterns.entries())
        lantern.rotation.z = Math.sin(elapsed * 1.6 + i) * 0.08;

      for (const puff of burner.puffs) {
        const t = (elapsed * 0.35 + puff.userData.offset) % 1;
        puff.position.set(
          Math.sin(t * 5 + puff.userData.offset * 6) * 0.15,
          1.5 + t * 2.2,
          0,
        );
        puff.scale.setScalar(0.4 + t * 1.4);
        puff.material.opacity = 0.3 * Math.sin(Math.PI * t);
      }

      for (let i = 0; i < PETALS; i++) {
        const p = petalData[i];
        petalPositions[i * 3] += Math.sin(elapsed * 1.5 + p.phase) * dt * 0.3;
        petalPositions[i * 3 + 1] -= p.fall * dt;
        petalPositions[i * 3 + 2] += dt * 0.15;
        if (petalPositions[i * 3 + 1] < 0.02) respawnPetal(i, false);
      }
      petalGeometry.attributes.position.needsUpdate = true;

      for (const label of labels)
        label.position.y =
          label.userData.baseY +
          Math.sin(elapsed * 2 + label.userData.phase) * 0.08;
    },
  };
}
