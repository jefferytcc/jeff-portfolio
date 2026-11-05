import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import galleryImg from "../img/rd-landing.png";

// ----------------------------
// Your own character: save a .glb file as public/models/character.glb
// If there's no file, the built-in mini-Jeff is used instead.
// ----------------------------
// Characters the visitor can pick from. `url: null` = the built-in mini-Jeff.
// height: how tall it stands on the planet (mini-Jeff is 1.6)
// turn: rotation in radians; use Math.PI if it walks backwards
const CHARACTERS = [
  {
    id: "chibi",
    name: "Hoodie girl",
    url: "/models/character.glb",
    height: 1.6,
    turn: 0,
  },
  {
    id: "ninja",
    name: "Ninja girl",
    url: "/models/ninja.glb",
    height: 1.6,
    turn: 0,
  },
  { id: "jeff", name: "Mini-Jeff", url: null },
];

// ----------------------------
// Settings
// ----------------------------
const PLANET_RADIUS = 12;
const WALK_SPEED = 5; // units per second
const TURN_SPEED = 2.4; // radians per second
const PLAYER_RADIUS = 0.4;
const NEAR_PADDING = 2.2; // how close you must be for a place's card to open

const COLOR = {
  grass: ["#8cc38f", "#83bb87", "#95c996", "#7fb383"],
  brand: "#212123",
  teal: "#2aa7c9",
  coral: "#e8664f",
  cream: "#f4efe6",
  wood: "#8a6a4f",
  stone: "#b9b6ad",
  gold: "#f2b705",
};

const LINKS = {
  email: "jefferytan.design@gmail.com",
  linkedin: "https://www.linkedin.com/in/jefferytancc/",
  resume:
    "https://drive.google.com/file/d/1n70VQ7K6ZIyiKJ5bz3PUEo-H6-TXmWU_/view",
  cv: "https://www.notion.so/Jeffery-Tan-23b961c512fe80978ad6ea17c8b404fa?source=copy_link",
};

const chips = (items) =>
  `<div class="flex flex-wrap gap-2">${items
    .map((item) => `<span class="tool-chip text-xs">${item}</span>`)
    .join("")}</div>`;

// Card copy comes from the About page
const PLACES = [
  {
    id: "home",
    label: "Hello!",
    guide: "Jeff's house",
    lat: 64,
    lon: 0,
    radius: 1.4,
    build: buildHouse,
    eyebrow: "About me",
    title: "Hi, I'm Jeffery – call me Jeff",
    body: `<p>A designer who thinks like a PM and ships like an engineer. I design, scope and help ship HR and payroll software at Kakitangan.com.</p>`,
  },
  {
    id: "kakitangan",
    label: "Kakitangan.com",
    lat: 22,
    lon: 42,
    radius: 1.3,
    build: buildOffice,
    eyebrow: "2021 – Present",
    title: "Kakitangan.com",
    body: `<p>UI/UX Designer + PM</p>
      <a href="/works/redesigndashboard.html" class="block text-brand underline">See the dashboard redesign</a>
      <a href="/works/redesignpayroll.html" class="block text-brand underline">See the payroll revamp</a>
      <a href="/works/redesignleave.html" class="block text-brand underline">See the leave revamp</a>
      <a href="/works/redesignclaims.html" class="block text-brand underline">See the claims revamp</a>
      <a href="/works/designsystem.html" class="block text-brand underline">See the design system</a>
      <a href="/works/redesignlanding.html" class="block text-brand underline">See the landing page redesign</a>`,
  },
  {
    id: "toa",
    label: "The One Academy",
    lat: 18,
    lon: -52,
    radius: 1.6,
    build: buildAcademy,
    eyebrow: "2019 – 2021",
    title: "The One Academy",
    body: `<p>Digital Media Designer</p>`,
  },
  {
    id: "vase",
    label: "Vase.ai",
    lat: -22,
    lon: 108,
    radius: 1.1,
    build: buildRocket,
    eyebrow: "2017 – 2018",
    title: "Vase.ai",
    body: `<p>UI/UX Designer</p>`,
  },
  {
    id: "tools",
    label: "Toolshed",
    lat: -16,
    lon: -122,
    radius: 1.4,
    build: buildToolshed,
    eyebrow: "Tools I use",
    title: "My toolshed",
    body: `<p class="font-semibold">Design & Prototyping</p>
      ${chips(["Figma", "Google Fonts", "Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects"])}
      <p class="font-semibold">Product & Workflow</p>
      ${chips(["ClickUp", "Notion"])}
      <p class="font-semibold">Front End Dev Tools</p>
      ${chips(["TailwindCSS", "Cloudflare", "VS Code", "HTML, CSS, JavaScript", "GitHub"])}`,
  },
  {
    id: "gallery",
    label: "Gallery",
    lat: 46,
    lon: 162,
    radius: 1.3,
    build: buildBillboard,
    eyebrow: "Featured work",
    title: "Redesign Kakitangan.com Landing Page",
    body: `<div class="flex flex-wrap items-center gap-3">
        <a href="/works/redesignlanding.html" class="btn text-sm">View case study</a>
        <a href="/works/index.html" class="text-brand underline">See all works</a>
      </div>`,
  },
  {
    id: "mailbox",
    label: "Mailbox",
    lat: -56,
    lon: 20,
    radius: 0.9,
    build: buildMailbox,
    eyebrow: "Say hello",
    title: "Let's work together",
    body: `<a class="underline block" href="mailto:${LINKS.email}">${LINKS.email}</a>
      <div class="flex flex-wrap gap-2">
        <a href="${LINKS.resume}" target="_blank" rel="noopener noreferrer" class="btn text-sm">My Resume</a>
        <a href="${LINKS.cv}" target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm">My CV</a>
        <a href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm">LinkedIn</a>
      </div>`,
  },
];

// ----------------------------
// Small helpers
// ----------------------------
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// Repeatable randomness so trees land in the same spots on every visit
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = seededRandom(7);

function dirFromLatLon(lat, lon) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    Math.cos(la) * Math.sin(lo),
    Math.sin(la),
    Math.cos(la) * Math.cos(lo),
  );
}

// Direction along the ground pointing to the north pole, where visitors start
function northTangent(up) {
  const t = Y_AXIS.clone().addScaledVector(up, -up.dot(Y_AXIS));
  return t.lengthSq() < 1e-6 ? new THREE.Vector3(0, 0, 1) : t.normalize();
}

// Stand an object on the planet: its +Y is "up", its +Z faces `forward`
const _basis = new THREE.Matrix4();
const _right = new THREE.Vector3();
function orientOnSphere(obj, up, forward) {
  _right.crossVectors(up, forward);
  _basis.makeBasis(_right, up, forward);
  obj.quaternion.setFromRotationMatrix(_basis);
}

const materials = new Map();
function material(color) {
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

function mesh(
  geometry,
  color,
  { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 } = {},
) {
  const m = new THREE.Mesh(geometry, material(color));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function group(...children) {
  const g = new THREE.Group();
  if (children.length) g.add(...children);
  return g;
}

// ----------------------------
// Places (built standing at the origin, facing +Z)
// ----------------------------
function buildHouse() {
  return group(
    mesh(new THREE.BoxGeometry(2, 1.4, 1.8), COLOR.cream, { y: 0.7 }),
    mesh(new THREE.ConeGeometry(1.65, 1, 4), COLOR.coral, {
      y: 1.9,
      ry: Math.PI / 4,
    }),
    mesh(new THREE.BoxGeometry(0.45, 0.75, 0.06), COLOR.wood, {
      y: 0.375,
      z: 0.9,
    }),
    mesh(new THREE.BoxGeometry(0.4, 0.35, 0.06), COLOR.teal, {
      x: 0.6,
      y: 0.85,
      z: 0.9,
    }),
    mesh(new THREE.BoxGeometry(0.4, 0.35, 0.06), COLOR.teal, {
      x: -0.6,
      y: 0.85,
      z: 0.9,
    }),
  );
}

function buildOffice() {
  const office = group(
    mesh(new THREE.BoxGeometry(1.6, 3.2, 1.6), COLOR.teal, { y: 1.6 }),
    mesh(new THREE.BoxGeometry(1.75, 0.16, 1.75), COLOR.brand, { y: 3.25 }),
    mesh(new THREE.BoxGeometry(0.5, 0.8, 0.06), COLOR.brand, {
      y: 0.4,
      z: 0.81,
    }),
  );
  for (const y of [1.2, 1.8, 2.4]) {
    office.add(mesh(new THREE.BoxGeometry(1.64, 0.14, 1.64), "#d9f1f7", { y }));
  }
  return office;
}

function buildAcademy() {
  const academy = group(
    mesh(new THREE.BoxGeometry(2.9, 0.2, 2), COLOR.stone, { y: 0.1 }),
    mesh(new THREE.BoxGeometry(2.5, 1.3, 1.4), COLOR.cream, {
      y: 0.85,
      z: -0.2,
    }),
    // Triangular roof (a 3-sided cylinder on its side, point up)
    mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.9, 3), "#d8cfbd", {
      y: 1.85,
      rz: Math.PI / 2,
      rx: -Math.PI / 2,
    }),
  );
  for (const x of [-0.95, -0.32, 0.32, 0.95]) {
    academy.add(
      mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 8), "#ffffff", {
        x,
        y: 0.85,
        z: 0.75,
      }),
    );
  }
  return academy;
}

function buildRocket() {
  const rocket = group(
    mesh(new THREE.CylinderGeometry(1, 1.1, 0.2, 10), COLOR.stone, { y: 0.1 }),
    mesh(new THREE.CylinderGeometry(0.45, 0.45, 2, 12), "#ffffff", { y: 1.3 }),
    mesh(new THREE.ConeGeometry(0.45, 0.8, 12), COLOR.coral, { y: 2.7 }),
    mesh(new THREE.SphereGeometry(0.18, 10, 8), COLOR.teal, {
      y: 1.75,
      z: 0.38,
    }),
  );
  for (let i = 0; i < 3; i++) {
    const fin = mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), COLOR.coral, {
      y: 0.55,
    });
    fin.position.x = Math.sin((i * Math.PI * 2) / 3) * 0.5;
    fin.position.z = Math.cos((i * Math.PI * 2) / 3) * 0.5;
    fin.rotation.y = (i * Math.PI * 2) / 3;
    rocket.add(fin);
  }
  return rocket;
}

function buildToolshed() {
  return group(
    mesh(new THREE.BoxGeometry(1.8, 1.3, 1.4), "#b07a4f", { y: 0.65 }),
    mesh(new THREE.BoxGeometry(2.1, 0.12, 1.7), COLOR.brand, {
      y: 1.42,
      rz: 0.2,
    }),
    mesh(new THREE.BoxGeometry(0.5, 0.8, 0.06), COLOR.brand, {
      y: 0.4,
      z: 0.71,
    }),
    // Giant pencil leaning on the shed
    group(
      mesh(new THREE.CylinderGeometry(0.17, 0.17, 2, 6), "#f4c542", { y: 1 }),
      mesh(new THREE.ConeGeometry(0.17, 0.4, 6), "#f1d7b3", { y: 2.2 }),
      mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 6), "#f29fb0", {
        y: -0.08,
      }),
    )
      .translateX(1.25)
      .rotateZ(0.32),
  );
}

function buildBillboard() {
  const texture = new THREE.TextureLoader().load(galleryImg);
  texture.colorSpace = THREE.SRGBColorSpace;
  const picture = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 1.4),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  picture.position.set(0, 2.15, 0.06);
  return group(
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), COLOR.brand, {
      x: -1.1,
      y: 0.8,
    }),
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), COLOR.brand, {
      x: 1.1,
      y: 0.8,
    }),
    mesh(new THREE.BoxGeometry(3, 1.6, 0.1), COLOR.brand, { y: 2.15 }),
    picture,
  );
}

function buildMailbox() {
  const mailbox = group(
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), COLOR.wood, {
      y: 0.55,
    }),
    mesh(new THREE.BoxGeometry(0.55, 0.45, 0.8), COLOR.brand, { y: 1.3 }),
    // Rounded top: the lower half hides inside the box
    mesh(new THREE.CylinderGeometry(0.275, 0.275, 0.8, 12), COLOR.brand, {
      y: 1.525,
      rx: Math.PI / 2,
    }),
    mesh(new THREE.BoxGeometry(0.04, 0.5, 0.06), COLOR.coral, {
      x: 0.3,
      y: 1.6,
      z: -0.1,
    }),
    mesh(new THREE.BoxGeometry(0.04, 0.2, 0.25), COLOR.coral, {
      x: 0.3,
      y: 1.75,
      z: -0.02,
    }),
  );
  mailbox.scale.setScalar(1.4);
  return mailbox;
}

function buildTree() {
  const leaves = rand() > 0.5 ? "#4f9a6a" : "#6fb27f";
  const tree = group(
    mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.7, 6), COLOR.wood, {
      y: 0.35,
    }),
    mesh(new THREE.ConeGeometry(0.6, 1, 7), leaves, { y: 1 }),
    mesh(new THREE.ConeGeometry(0.45, 0.8, 7), leaves, { y: 1.5 }),
  );
  tree.scale.setScalar(0.8 + rand() * 0.6);
  return tree;
}

function buildCloud() {
  const cloud = group();
  const puffs = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < puffs; i++) {
    const puff = mesh(
      new THREE.IcosahedronGeometry(0.6 + rand() * 0.5, 1),
      "#ffffff",
      {
        x: (i - puffs / 2) * 0.7,
        y: rand() * 0.3,
        z: rand() * 0.4,
      },
    );
    puff.castShadow = false;
    cloud.add(puff);
  }
  return cloud;
}

// Mini Jeff: dark jacket, glasses, spiky hair with blue tips
function buildJeff() {
  const skin = "#f1c7a3";
  const jacket = "#2b2f3a";
  const pants = "#3a3f4b";
  const hair = "#1c1c20";

  const limb = (w, h, d, color, x, pivotY) => {
    const pivot = group(
      mesh(new THREE.BoxGeometry(w, h, d), color, { y: -h / 2 }),
    );
    pivot.position.set(x, pivotY, 0);
    return pivot;
  };

  const legL = limb(0.2, 0.55, 0.22, pants, -0.13, 0.55);
  const legR = limb(0.2, 0.55, 0.22, pants, 0.13, 0.55);
  const armL = limb(0.14, 0.5, 0.16, jacket, -0.36, 1.28);
  const armR = limb(0.14, 0.5, 0.16, jacket, 0.36, 1.28);

  const head = group(
    mesh(new THREE.SphereGeometry(0.3, 12, 10), skin),
    mesh(
      new THREE.SphereGeometry(0.315, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      hair,
      {
        y: 0.04,
        rx: -0.15,
      },
    ),
    mesh(new THREE.SphereGeometry(0.03, 6, 6), "#111111", {
      x: -0.11,
      y: 0,
      z: 0.28,
    }),
    mesh(new THREE.SphereGeometry(0.03, 6, 6), "#111111", {
      x: 0.11,
      y: 0,
      z: 0.28,
    }),
    mesh(new THREE.TorusGeometry(0.085, 0.018, 6, 16), "#d8c3a0", {
      x: -0.11,
      z: 0.29,
    }),
    mesh(new THREE.TorusGeometry(0.085, 0.018, 6, 16), "#d8c3a0", {
      x: 0.11,
      z: 0.29,
    }),
    mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), "#d8c3a0", {
      y: 0.01,
      z: 0.3,
    }),
  );
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const spike = mesh(
      new THREE.ConeGeometry(0.07, 0.24, 5),
      i % 3 === 0 ? "#3b6fd8" : hair,
      {
        x: Math.sin(angle) * 0.17,
        y: 0.3,
        z: Math.cos(angle) * 0.17 - 0.03,
      },
    );
    spike.lookAt(spike.position.clone().multiplyScalar(2).setY(0.9));
    spike.rotateX(Math.PI / 2);
    head.add(spike);
  }
  head.position.y = 1.68;

  const body = group(
    mesh(new THREE.CapsuleGeometry(0.27, 0.35, 4, 10), jacket, { y: 0.95 }),
    head,
    armL,
    armR,
  );
  const model = group(legL, legR, body);
  model.scale.setScalar(0.8);

  return { model, body, legL, legR, armL, armR };
}

// Built-in mini-Jeff: swing arms and legs while walking
function builtInCharacter() {
  const jeff = buildJeff();
  let phase = 0;
  return {
    object: jeff.model,
    update(dt, moving) {
      phase += dt * 10 * moving;
      const swing = Math.sin(phase) * 0.7 * moving;
      jeff.legL.rotation.x = swing;
      jeff.legR.rotation.x = -swing;
      jeff.armL.rotation.x = -swing * 0.8;
      jeff.armR.rotation.x = swing * 0.8;
      jeff.body.position.y = Math.abs(Math.sin(phase)) * 0.05 * moving;
    },
  };
}

// Custom .glb character, scaled to size with its feet on the ground.
// Plays its own "Walk"/"Idle" animations when it has them.
async function loadCustomCharacter(CHARACTER) {
  let gltf;
  try {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder); // ninja.glb is meshopt-compressed
    gltf = await loader.loadAsync(CHARACTER.url);
  } catch {
    return null; // no custom character yet
  }

  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) child.castShadow = child.receiveShadow = true;
  });

  const box = new THREE.Box3().setFromObject(model);
  model.scale.multiplyScalar(
    CHARACTER.height / box.getSize(new THREE.Vector3()).y,
  );
  box.setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);

  const object = group(model);
  object.rotation.y = CHARACTER.turn;

  const mixer = new THREE.AnimationMixer(model);
  const findClip = (...names) =>
    gltf.animations.find((clip) =>
      names.some((name) => clip.name.toLowerCase().includes(name)),
    );
  const walkClip = findClip("walk", "run");
  const idleClip = findClip("idle", "stand", "breath");
  const walk = walkClip && mixer.clipAction(walkClip).play();
  const idle =
    idleClip && idleClip !== walkClip && mixer.clipAction(idleClip).play();
  let walkWeight = 0;
  let phase = 0;

  return {
    object,
    update(dt, moving) {
      walkWeight +=
        ((moving > 0 ? 1 : 0) - walkWeight) * (1 - Math.exp(-dt * 8));
      walk?.setEffectiveWeight(walkWeight);
      idle?.setEffectiveWeight(1 - walkWeight);
      mixer.update(dt);

      // No walk animation? Give it a little hop so it doesn't slide
      if (!walk) {
        phase += dt * 10 * moving;
        model.position.y =
          -box.min.y + Math.abs(Math.sin(phase)) * 0.08 * moving;
      }
    },
  };
}

// Floating name tag above each place
function buildLabel(text) {
  const font = "700 44px Inter, sans-serif";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 56;
  canvas.height = 84;

  ctx.font = font;
  ctx.fillStyle = COLOR.brand;
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

// ----------------------------
// World
// ----------------------------
async function init() {
  const section = document.getElementById("world");
  const canvas = document.getElementById("world-canvas");
  if (!section || !canvas) return;

  const ui = {
    loading: document.getElementById("world-loading"),
    intro: document.getElementById("world-intro"),
    introControls: document.getElementById("world-intro-controls"),
    start: document.getElementById("world-start"),
    card: document.getElementById("world-card"),
    progressText: document.getElementById("world-progress-text"),
    progressDots: document.getElementById("world-progress-dots"),
    keysHint: document.getElementById("world-keys-hint"),
    joystick: document.getElementById("joystick"),
    knob: document.getElementById("joystick-knob"),
    fallback: document.getElementById("world-fallback"),
    coins: document.getElementById("world-coins"),
    guide: document.getElementById("world-guide"),
    guideArrow: document.getElementById("world-guide-arrow"),
    guideText: document.getElementById("world-guide-text"),
    map: document.getElementById("world-map"),
    mapNorth: document.getElementById("world-map-north"),
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
  } catch {
    ui.loading.hidden = true;
    ui.fallback.hidden = false;
    return;
  }

  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  // Lights: the sun follows the player so the area you're in is always lit
  scene.add(new THREE.AmbientLight("#ffffff", 1.1));
  const sun = new THREE.DirectionalLight("#fff6e8", 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(isTouch ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -12,
    right: 12,
    top: 12,
    bottom: -12,
    near: 1,
    far: 50,
  });
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // Planet with a slightly patchy, low-poly look
  const planetGeometry = new THREE.IcosahedronGeometry(PLANET_RADIUS, 6);
  const faceColors = [];
  const shade = new THREE.Color();
  for (let i = 0; i < planetGeometry.attributes.position.count; i += 3) {
    shade.set(COLOR.grass[Math.floor(rand() * COLOR.grass.length)]);
    faceColors.push(...shade.toArray(), ...shade.toArray(), ...shade.toArray());
  }
  planetGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(faceColors, 3),
  );
  const planet = new THREE.Mesh(
    planetGeometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 1,
    }),
  );
  planet.receiveShadow = true;
  scene.add(planet);

  // Places
  await document.fonts.load("700 44px Inter").catch(() => {});
  const obstacles = [];
  const places = PLACES.map((place) => {
    const up = dirFromLatLon(place.lat, place.lon);
    const object = place.build();
    const height = new THREE.Box3().setFromObject(object).max.y;
    object.position.copy(up).multiplyScalar(PLANET_RADIUS);
    orientOnSphere(object, up, northTangent(up));

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(place.radius + 0.4, place.radius + 0.65, 48),
      new THREE.MeshBasicMaterial({
        color: COLOR.brand,
        transparent: true,
        opacity: 0.2,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    object.add(ring);

    const label = buildLabel(place.label);
    label.position.y = height / object.scale.y + 0.7;
    label.userData.baseY = label.position.y;
    object.add(label);

    scene.add(object);
    obstacles.push({ position: object.position, radius: place.radius });
    return { ...place, name: place.label, object, ring, label, visited: false };
  });

  // Trees and rocks, kept clear of places and the starting spot
  const startUp = new THREE.Vector3(0, 1, 0);
  const isClear = (dir, gap) =>
    dir.angleTo(startUp) > 0.3 &&
    places.every(
      (p) => dir.angleTo(p.object.position) > (p.radius + gap) / PLANET_RADIUS,
    ) &&
    obstacles.every(
      (o) =>
        o.position.distanceTo(dir.clone().multiplyScalar(PLANET_RADIUS)) > 1.6,
    );

  const scatter = (count, build, radius, gap) => {
    for (
      let placed = 0, tries = 0;
      placed < count && tries < count * 30;
      tries++
    ) {
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const up = new THREE.Vector3(s * Math.cos(theta), u, s * Math.sin(theta));
      if (!isClear(up, gap)) continue;

      const object = build();
      object.position.copy(up).multiplyScalar(PLANET_RADIUS - 0.05);
      orientOnSphere(object, up, northTangent(up));
      object.rotateY(rand() * Math.PI * 2);
      scene.add(object);
      obstacles.push({ position: object.position, radius });
      placed++;
    }
  };
  scatter(46, buildTree, 0.45, 1.8);
  scatter(
    14,
    () =>
      mesh(new THREE.DodecahedronGeometry(0.3 + rand() * 0.3), COLOR.stone, {
        y: 0.1,
      }),
    0.4,
    1.2,
  );

  // Clouds drifting around the planet
  const clouds = [];
  for (let i = 0; i < 7; i++) {
    const pivot = new THREE.Group();
    const cloud = buildCloud();
    cloud.position.set(0, PLANET_RADIUS + 9 + rand() * 3, 0);
    pivot.add(cloud);
    pivot.rotation.set(
      rand() * Math.PI * 2,
      rand() * Math.PI * 2,
      rand() * Math.PI * 2,
    );
    const axis = new THREE.Vector3(
      rand() - 0.5,
      rand() - 0.5,
      rand() - 0.5,
    ).normalize();
    scene.add(pivot);
    clouds.push({ pivot, axis, speed: 0.03 + rand() * 0.04 });
  }

  // Player
  const cache = new Map(); // id -> loaded character (so switching back is instant)
  async function getCharacter(def) {
    if (!cache.has(def.id))
      cache.set(
        def.id,
        (def.url && (await loadCustomCharacter(def))) || builtInCharacter(),
      );
    return cache.get(def.id);
  }
  let savedId = null;
  try {
    savedId = localStorage.getItem("world-character");
  } catch {}
  let currentDef = CHARACTERS.find((c) => c.id === savedId) ?? CHARACTERS[0];
  let character = await getCharacter(currentDef);
  const player = new THREE.Group();
  player.add(character.object);
  scene.add(player);

  // Character picker (intro card + the "Character" button while exploring)
  const pickButtons = [...document.querySelectorAll("[data-character]")];
  function markPicked() {
    for (const b of pickButtons) {
      const on = b.dataset.character === currentDef.id;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("ring-2", on);
      b.classList.toggle("ring-brand", on);
    }
  }
  let switching = false;
  async function pickCharacter(id) {
    const def = CHARACTERS.find((c) => c.id === id);
    if (!def || def === currentDef || switching) return;
    switching = true;
    try {
      const next = await getCharacter(def);
      player.remove(character.object);
      player.add(next.object);
      character = next;
      currentDef = def;
      try {
        localStorage.setItem("world-character", def.id);
      } catch {}
      markPicked();
    } finally {
      switching = false;
    }
  }
  for (const b of pickButtons)
    b.addEventListener("click", () => pickCharacter(b.dataset.character));
  document.getElementById("world-switch")?.addEventListener("click", () => {
    const i = CHARACTERS.indexOf(currentDef);
    pickCharacter(CHARACTERS[(i + 1) % CHARACTERS.length].id);
  });
  markPicked();

  const up = startUp.clone();
  const forward = new THREE.Vector3(0, 0, 1);
  const position = new THREE.Vector3();
  let moving = 0; // 0 = standing, 1 = walking

  // ----------------------------
  // Coin trail to the next place you haven't visited
  // ----------------------------
  const COIN_SPACING = 2.2;
  const COIN_HEIGHT = 0.75;
  const coinGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 24);
  coinGeometry.rotateX(Math.PI / 2);
  const coinMaterial = new THREE.MeshStandardMaterial({
    color: COLOR.gold,
    emissive: COLOR.gold,
    emissiveIntensity: 0.25,
    metalness: 0.4,
    roughness: 0.35,
    flatShading: true,
  });
  let coins = [];
  let coinCount = 0;
  let target = null;
  const _from = new THREE.Vector3();
  const _to = new THREE.Vector3();
  const _dir = new THREE.Vector3();

  function nearestUnvisited() {
    let best = null;
    for (const place of places) {
      if (place.visited) continue;
      if (
        !best ||
        up.angleTo(place.object.position) < up.angleTo(best.object.position)
      )
        best = place;
    }
    return best;
  }

  function layTrail(place = nearestUnvisited()) {
    for (const c of coins) scene.remove(c.pivot);
    coins = [];
    target = place;
    if (ui.guideText && target)
      ui.guideText.textContent = `Next: ${target.guide ?? target.name}`;
    if (!target) return;

    _from.copy(up);
    _to.copy(target.object.position).normalize();
    const angle = _from.angleTo(_to);
    const length = angle * PLANET_RADIUS;
    if (Math.sin(angle) < 1e-3) return;

    // Coins every few steps along the great circle, stopping short of the place
    for (let d = 2; d < length - (target.radius + 1); d += COIN_SPACING) {
      const t = d / length;
      _dir
        .copy(_from)
        .multiplyScalar(Math.sin((1 - t) * angle))
        .addScaledVector(_to, Math.sin(t * angle))
        .normalize();
      const ground = _dir.clone().multiplyScalar(PLANET_RADIUS);
      if (
        obstacles.some((o) => o.position.distanceTo(ground) < o.radius + 0.35)
      )
        continue; // skip coins that would sit inside a tree or rock

      const pivot = new THREE.Group();
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.castShadow = true;
      coin.position.y = COIN_HEIGHT;
      pivot.add(coin);
      pivot.position.copy(ground);
      orientOnSphere(pivot, _dir.clone(), northTangent(_dir));
      scene.add(pivot);
      coins.push({ pivot, coin, phase: d, collectedAt: null });
    }
  }

  function updateCoins(dt) {
    for (const c of coins) {
      if (c.collectedAt === null) {
        if (!reduceMotion) {
          c.coin.rotation.y += dt * 3;
          c.coin.position.y =
            COIN_HEIGHT + Math.sin(elapsed * 3 + c.phase) * 0.08;
        }
        if (started && position.distanceTo(c.pivot.position) < 1) {
          c.collectedAt = elapsed;
          coinCount++;
          ui.coins.textContent = coinCount;
          if (!reduceMotion)
            ui.coins.parentElement.animate(
              [{ transform: "scale(1.3)" }, { transform: "scale(1)" }],
              { duration: 250 },
            );
        }
        continue;
      }
      // Collected: pop up, spin and shrink away
      const t = (elapsed - c.collectedAt) / 0.35;
      if (reduceMotion || t >= 1) {
        scene.remove(c.pivot);
        c.done = true;
      } else {
        c.coin.position.y = COIN_HEIGHT + t * 1.2;
        c.coin.scale.setScalar(1 - t);
        c.coin.rotation.y += dt * 12;
      }
    }
    coins = coins.filter((c) => !c.done);
  }

  // ----------------------------
  // Minimap: you in the middle facing up, every place by direction and distance
  // ----------------------------
  const mapDots = places.map((place) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className =
      "absolute left-0 top-0 w-6 h-6 -ml-3 -mt-3 flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand";
    dot.setAttribute(
      "aria-label",
      `Show the way to ${place.guide ?? place.name}`,
    );
    dot.title = place.guide ?? place.name;
    dot.innerHTML = '<span class="block w-3 h-3 rounded-full border-2"></span>';
    dot.addEventListener("click", () => layTrail(place));
    ui.map?.append(dot);
    return { place, dot, mark: dot.firstElementChild, state: "" };
  });

  const _north = new THREE.Vector3();
  function bearingTo(dir) {
    // Angle of `dir` around you: 0 = straight ahead, positive = to your right
    _dir.copy(dir).addScaledVector(up, -dir.dot(up));
    _screenRight.crossVectors(forward, up);
    return Math.atan2(_dir.dot(_screenRight), _dir.dot(forward));
  }

  function updateMap() {
    if (!ui.map) return;
    ui.map.hidden = !started;
    if (!started) return;
    const radius = ui.map.clientWidth / 2;
    const reach = radius - 12;
    for (const m of mapDots) {
      _to.copy(m.place.object.position).normalize();
      const r = (up.angleTo(_to) / Math.PI) * reach;
      const b = bearingTo(_to);
      m.dot.style.transform = `translate(${radius + r * Math.sin(b)}px, ${radius - r * Math.cos(b)}px)`;

      const state =
        m.place === target ? "next" : m.place.visited ? "visited" : "todo";
      if (state !== m.state) {
        m.state = state;
        m.mark.className = `block rounded-full border-2 ${
          state === "next"
            ? "w-3.5 h-3.5 bg-[#f2b705] border-[#d99a00] animate-pulse"
            : state === "visited"
              ? "w-3 h-3 bg-[#2aa7c9] border-white"
              : "w-3 h-3 bg-white border-brand"
        }`;
      }
    }
    // Compass: where the planet's north is
    const nb = bearingTo(_north.copy(northTangent(up)).add(up));
    ui.mapNorth.style.transform = `translate(${radius + reach * Math.sin(nb)}px, ${radius - reach * Math.cos(nb)}px) translate(-50%, -50%)`;
  }

  // The guide arrow points from you to the next place, relative to the camera
  const _screenRight = new THREE.Vector3();
  function updateGuide() {
    if (!ui.guide) return;
    const show = started && target && !activePlace;
    ui.guide.hidden = !show;
    if (!show) return;
    _dir.subVectors(target.object.position, position);
    _dir.addScaledVector(up, -_dir.dot(up));
    _screenRight.crossVectors(forward, up);
    const degrees = THREE.MathUtils.radToDeg(
      Math.atan2(_dir.dot(_screenRight), _dir.dot(forward)),
    );
    ui.guideArrow.style.transform = `rotate(${degrees}deg)`;
  }

  // ----------------------------
  // UI
  // ----------------------------
  ui.progressDots.innerHTML = places
    .map(() => `<span class="w-2 h-2 rounded-full bg-gray-300"></span>`)
    .join("");

  function updateProgress() {
    const visited = places.filter((p) => p.visited).length;
    // "Explored" is dropped on phones so the top bar fits beside its buttons
    ui.progressText.innerHTML =
      visited === places.length
        ? `All ${places.length}<span class="hidden sm:inline"> explored</span> 🎉`
        : `<span class="hidden sm:inline">Explored </span>${visited} / ${places.length}`;
    [...ui.progressDots.children].forEach((dot, i) => {
      dot.className = `w-2 h-2 rounded-full ${places[i].visited ? "bg-brand" : "bg-gray-300"}`;
    });
  }

  let activePlace = null;
  function showCard(place) {
    if (place === activePlace) return;
    activePlace = place;
    const hiddenClasses = ["opacity-0", "translate-y-2", "pointer-events-none"];
    if (!place) {
      ui.card.classList.add(...hiddenClasses);
      return;
    }
    ui.card.innerHTML = `
      <p class="text-xs font-semibold uppercase tracking-wider text-ink-light">${place.eyebrow}</p>
      <h2 class="mt-1 text-lg font-bold text-ink-dark">${place.title}</h2>
      <div class="mt-3 text-sm text-ink space-y-3">${place.body}</div>`;
    ui.card.classList.remove(...hiddenClasses);
  }

  ui.introControls.textContent = isTouch
    ? "Use the joystick in the bottom-left corner to walk."
    : "Use W A S D or the arrow keys to walk.";

  // ----------------------------
  // Controls
  // ----------------------------
  let started = false;
  const keys = new Set();
  const joystick = { x: 0, y: 0 };
  const KEY_ACTIONS = {
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "back",
    ArrowDown: "back",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
  };

  window.addEventListener("keydown", (e) => {
    const action = KEY_ACTIONS[e.code];
    if (!started || !action || e.target.closest("input, textarea")) return;
    e.preventDefault();
    keys.add(action);
  });
  window.addEventListener("keyup", (e) => keys.delete(KEY_ACTIONS[e.code]));
  window.addEventListener("blur", () => keys.clear());

  if (isTouch) {
    const maxDistance = 48;
    let pointerId = null;

    const moveKnob = (e) => {
      const rect = ui.joystick.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const scale = Math.min(1, maxDistance / Math.hypot(dx, dy));
      ui.knob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
      joystick.x = (dx * scale) / maxDistance;
      joystick.y = -(dy * scale) / maxDistance;
    };
    const release = () => {
      pointerId = null;
      joystick.x = joystick.y = 0;
      ui.knob.style.transform = "";
    };

    ui.joystick.addEventListener("pointerdown", (e) => {
      pointerId = e.pointerId;
      ui.joystick.setPointerCapture(e.pointerId);
      moveKnob(e);
    });
    ui.joystick.addEventListener(
      "pointermove",
      (e) => e.pointerId === pointerId && moveKnob(e),
    );
    ui.joystick.addEventListener("pointerup", release);
    ui.joystick.addEventListener("pointercancel", release);
  }

  ui.start.addEventListener("click", () => {
    started = true;
    ui.intro.hidden = true;
    (isTouch ? ui.joystick : ui.keysHint).classList.remove("hidden");
  });

  // ----------------------------
  // Movement on the sphere
  // ----------------------------
  const _axis = new THREE.Vector3();
  const _turn = new THREE.Quaternion();
  const _push = new THREE.Vector3();

  function movePlayer(dt) {
    const deadzone = (v) => (Math.abs(v) < 0.15 ? 0 : v);
    const forwardInput = THREE.MathUtils.clamp(
      (keys.has("forward") ? 1 : 0) -
        (keys.has("back") ? 1 : 0) +
        deadzone(joystick.y),
      -1,
      1,
    );
    const turnInput = THREE.MathUtils.clamp(
      (keys.has("left") ? 1 : 0) -
        (keys.has("right") ? 1 : 0) -
        deadzone(joystick.x),
      -1,
      1,
    );

    if (turnInput) {
      _turn.setFromAxisAngle(up, turnInput * TURN_SPEED * dt);
      forward.applyQuaternion(_turn);
    }

    const speed = forwardInput * WALK_SPEED * (forwardInput < 0 ? 0.5 : 1);
    if (speed) {
      // Rolling "up" towards "forward" walks us along the curve of the planet
      _axis.crossVectors(up, forward).normalize();
      _turn.setFromAxisAngle(_axis, (speed * dt) / PLANET_RADIUS);
      up.applyQuaternion(_turn);
      forward.applyQuaternion(_turn);

      // Slide around anything we bump into
      position.copy(up).multiplyScalar(PLANET_RADIUS);
      for (const o of obstacles) {
        const gap = o.radius + PLAYER_RADIUS - position.distanceTo(o.position);
        if (gap > 0)
          position.add(_push.subVectors(position, o.position).setLength(gap));
      }
      up.copy(position).normalize();
    }

    forward.addScaledVector(up, -forward.dot(up)).normalize();
    position.copy(up).multiplyScalar(PLANET_RADIUS);
    player.position.copy(position);
    orientOnSphere(player, up, forward);

    moving = Math.abs(forwardInput) > 0 ? 1 : turnInput ? 0.4 : 0;
  }

  function updateNearbyPlace() {
    let nearest = null;
    for (const place of places) {
      const near =
        position.distanceTo(place.object.position) <
        place.radius + NEAR_PADDING;
      if (near && (!place.visited || place === target)) {
        place.visited = true;
        updateProgress();
        layTrail();
      }
      if (near) nearest = place;
      const isNext = place === target && !near;
      place.ring.material.color.set(
        isNext ? COLOR.gold : near || place.visited ? COLOR.teal : COLOR.brand,
      );
      place.ring.material.opacity = isNext
        ? 0.6 + (reduceMotion ? 0 : Math.sin(elapsed * 4) * 0.3)
        : near
          ? 0.9
          : place.visited
            ? 0.45
            : 0.2;
    }
    showCard(nearest);
  }

  // ----------------------------
  // Camera
  // ----------------------------
  let isNarrow = false;
  const cameraGoal = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let introAngle = 0;

  function updateCamera(dt) {
    if (!started) {
      // Slow orbit behind the intro card
      introAngle += dt * (reduceMotion ? 0 : 0.12);
      const distance = isNarrow ? 40 : 32;
      camera.position.set(
        Math.sin(introAngle) * distance,
        16,
        Math.cos(introAngle) * distance,
      );
      camera.up.copy(Y_AXIS);
      lookAt.set(0, 0, 0);
      camera.lookAt(lookAt);
      return;
    }
    const distance = isNarrow ? 9 : 7.5;
    const height = isNarrow ? 6.5 : 4.8;
    cameraGoal
      .copy(position)
      .addScaledVector(up, height)
      .addScaledVector(forward, -distance);
    lookGoal
      .copy(position)
      .addScaledVector(up, 1.2)
      .addScaledVector(forward, 2.5);

    const k = 1 - Math.exp(-dt * (reduceMotion ? 12 : 5));
    camera.position.lerp(cameraGoal, k);
    lookAt.lerp(lookGoal, k);
    camera.up.lerp(up, k).normalize();
    camera.lookAt(lookAt);
  }

  function updateSun() {
    _axis.crossVectors(up, forward);
    // From above and behind the camera, so the sides you're looking at are lit
    sun.position
      .copy(position)
      .addScaledVector(up, 18)
      .addScaledVector(_axis, -6)
      .addScaledVector(forward, -8);
    sun.target.position.copy(position);
  }

  // ----------------------------
  // Resize + loop
  // ----------------------------
  function resize() {
    const { clientWidth: width, clientHeight: height } = section;
    isNarrow = width < 640;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = isNarrow ? 62 : 50;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(section);
  resize();

  const clock = new THREE.Clock();
  let elapsed = 0;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (document.hidden) return;
    elapsed += dt;

    if (started) {
      movePlayer(dt);
      updateNearbyPlace();
    }
    updateCoins(dt);
    updateGuide();
    updateMap();
    character.update(dt, moving);
    updateCamera(dt);
    updateSun();

    if (!reduceMotion) {
      for (const c of clouds) c.pivot.rotateOnAxis(c.axis, c.speed * dt);
      for (const p of places)
        p.label.position.y =
          p.label.userData.baseY + Math.sin(elapsed * 2 + p.lat) * 0.08;
    }
    renderer.render(scene, camera);
  }

  movePlayer(0);
  layTrail();
  updateProgress();
  ui.loading.hidden = true;
  frame();
}

init();
