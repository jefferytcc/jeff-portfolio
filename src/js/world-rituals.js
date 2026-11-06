import * as THREE from "three";
import { mesh, group } from "./world-kit.js";

// ----------------------------
// Praying at the temple garden: step-by-step rituals on the place's card,
// a fortune at the end, and a prayer counter (yours + every visitor's).
// ----------------------------

const API = "/api/prayers"; // Cloudflare Pages Function (functions/api/prayers.js)

// Fortunes: [luck, message]. Edit freely.
const AI_FORTUNES = [
  ["Great fortune", "Your prompt works on the first try."],
  ["Good fortune", "The model will not hallucinate today. Mostly."],
  ["Good fortune", "Your tests pass, and they actually test something."],
  ["Good fortune", "Your Figma file and your code will finally match."],
  ["Fortune", "Your context window is big enough for everything you need."],
  [
    "Fortune",
    "A designer and an engineer agree on the same spec. Treasure this day.",
  ],
  [
    "Small fortune",
    "The AI understands your vague request. Don't get used to it.",
  ],
  [
    "Middling fortune",
    "You will regenerate the answer three times and like the first one best.",
  ],
  [
    "Caution",
    "An AI will confidently invent a function that doesn't exist. Check the docs.",
  ],
  ["Caution", "Never deploy on a Friday, whatever the AI God says."],
];

const PARKING_FORTUNES = [
  [
    "大吉",
    "Great blessing",
    "A spot opens right by the entrance as you arrive.",
  ],
  ["大吉", "Great blessing", "Free parking. Today only."],
  ["吉", "Blessing", "The car in front of you is leaving. Signal early."],
  ["吉", "Blessing", "Your Touch 'n Go has enough balance at the exit gate."],
  ["中吉", "Middle blessing", "A first-floor spot at the mall, on a Saturday."],
  ["中吉", "Middle blessing", "You will remember exactly where you parked."],
  [
    "小吉",
    "Small blessing",
    "A spot appears, but it's a tight one. Breathe in.",
  ],
  ["末吉", "Future blessing", "One more round and a spot is yours. Patience."],
  ["凶", "Curse", "You will circle level B3 forever. Take the train."],
  ["凶", "Curse", "Someone parks across two bays next to you. Stay calm."],
];

const GODS = {
  ai: {
    start: "Pray to the AI God",
    steps: [
      {
        id: "take",
        button: "Take 3 incense sticks",
        text: "Pick up three sticks of incense.",
      },
      {
        id: "light",
        button: "Light the incense",
        text: "Light the tips until they glow.",
      },
      {
        id: "bow",
        button: "Bow",
        times: 3,
        text: "Hold the incense up, make your wish to the AI God and bow three times.",
      },
      {
        id: "place",
        button: "Place in the burner",
        text: "Plant your incense in the burner so the smoke carries your wish.",
      },
    ],
    heard: "The AI God has received your prompt.",
    fortuneButton: "Shake the fortune cup",
    drawing: "Shaking the fortune cup…",
    youLabel: "Your prayers",
    everyoneLabel: "All visitors",
  },
  parking: {
    start: "Pray to the Parking God",
    steps: [
      {
        id: "coin",
        button: "Toss a coin",
        text: "Toss a coin into the offering box.",
      },
      {
        id: "bell",
        button: "Ring the bell",
        text: "Ring the bell so the Parking God knows you're here.",
      },
      { id: "bow", button: "Bow", times: 2, text: "Bow deeply twice." },
      { id: "clap", button: "Clap", times: 2, text: "Clap twice." },
      {
        id: "bow",
        button: "Bow and make a wish",
        text: "Make your parking wish, then bow once more.",
      },
    ],
    heard: "The Parking God has heard you.",
    fortuneButton: "Draw a fortune",
    drawing: "Drawing a fortune slip…",
    youLabel: "Your prayers",
    everyoneLabel: "All visitors",
  },
};

// ----------------------------
// Little sounds, made on the fly (no audio files)
// ----------------------------
let audio = null;
function play(kind) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const now = audio.currentTime;
    const out = audio.createGain();
    out.gain.value = 0.12;
    out.connect(audio.destination);

    const tone = (freq, start, length, volume = 1, type = "sine") => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + length);
      osc.connect(gain).connect(out);
      osc.start(now + start);
      osc.stop(now + start + length + 0.05);
    };
    const noise = (start, length, freq, volume = 1) => {
      const buffer = audio.createBuffer(
        1,
        Math.ceil(audio.sampleRate * length),
        audio.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = audio.createBufferSource();
      source.buffer = buffer;
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(volume, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + length);
      source.connect(filter).connect(gain).connect(out);
      source.start(now + start);
    };

    if (kind === "bell") {
      tone(1046, 0, 1.8, 0.6);
      tone(1568, 0, 1.2, 0.3);
      tone(2637, 0, 0.6, 0.15);
    } else if (kind === "clap") noise(0, 0.09, 1800, 1.4);
    else if (kind === "coin") {
      tone(2093, 0, 0.25, 0.5, "triangle");
      tone(2637, 0.08, 0.3, 0.4, "triangle");
    } else if (kind === "light") noise(0, 0.3, 700, 0.6);
    else if (kind === "rattle")
      for (let i = 0; i < 6; i++) noise(i * 0.11, 0.05, 3200, 0.8);
  } catch {
    // No sound is fine
  }
}

// ----------------------------
// Counts: yours (this browser) and everyone's (the server)
// ----------------------------
function readMine(god) {
  try {
    return Number(localStorage.getItem(`prayers-${god}`)) || 0;
  } catch {
    return 0;
  }
}
function saveMine(god, count) {
  try {
    localStorage.setItem(`prayers-${god}`, String(count));
  } catch {}
}

async function callApi(options) {
  const res = await fetch(API, {
    headers: { accept: "application/json", "content-type": "application/json" },
    ...options,
  });
  // Local dev has no API: Vite answers with an HTML page instead
  if (!res.ok || !res.headers.get("content-type")?.includes("json"))
    throw new Error("Prayer counter unavailable");
  return res.json();
}

// ----------------------------
// Rituals
// ----------------------------
export function createRituals({
  diorama,
  pose,
  isTouch,
  reduceMotion,
  onChange,
}) {
  const everyone = { ai: null, parking: null }; // null = unknown / offline
  const mine = { ai: readMine("ai"), parking: readMine("parking") };
  diorama.burner.setSticks(Math.min(diorama.burner.maxSticks, 3 + mine.ai * 3));

  async function loadTotals() {
    try {
      const data = await callApi({ method: "GET" });
      for (const god of Object.keys(everyone))
        if (Number.isFinite(data[god])) everyone[god] = data[god];
      onChange();
    } catch {}
  }

  async function sendPrayer(god) {
    const before = everyone[god];
    if (before !== null) everyone[god] = before + 1; // show it straight away
    try {
      const data = await callApi({
        method: "POST",
        body: JSON.stringify({ god }),
      });
      for (const key of Object.keys(everyone))
        if (Number.isFinite(data[key])) everyone[key] = data[key];
      // Never show the number going down (the store can lag a little)
      if (before !== null && data.counted)
        everyone[god] = Math.max(everyone[god], before + 1);
    } catch {
      everyone[god] = before;
    }
    onChange();
  }

  // ----- Animation helpers -----
  const tweens = [];
  function tween(duration, fn) {
    if (reduceMotion) {
      fn(1);
      return Promise.resolve();
    }
    return new Promise((resolve) =>
      tweens.push({ time: 0, duration, fn, resolve }),
    );
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  // Incense held in front of the character
  const tipMaterial = new THREE.MeshStandardMaterial({
    color: "#5a2a1e",
    emissive: "#ff7a2e",
    emissiveIntensity: 0,
    flatShading: true,
  });
  const handIncense = group();
  for (const x of [-0.05, 0, 0.05]) {
    const stick = group(
      mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4), "#8e2a21", {
        y: 0.3,
      }),
      new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), tipMaterial),
    );
    stick.children[1].position.y = 0.8;
    stick.position.x = x;
    stick.rotation.z = x * 2;
    handIncense.add(stick);
  }
  // Held up at forehead height, so the glowing tips show above the head
  handIncense.position.set(0, 1.15, 0.3);
  handIncense.rotation.x = 0.12;

  const bow = (depth = 0.45) =>
    tween(0.9, (t) => (pose.rotation.x = Math.sin(Math.PI * t) * depth));
  const hop = () =>
    tween(0.3, (t) => (pose.position.y = Math.sin(Math.PI * t) * 0.12));

  const effects = {
    async take() {
      tipMaterial.emissiveIntensity = 0;
      pose.add(handIncense);
      await wait(250);
    },
    async light() {
      play("light");
      await tween(0.6, (t) => (tipMaterial.emissiveIntensity = t * 1.4));
    },
    bow: () => bow(),
    async place() {
      pose.remove(handIncense);
      const count = Math.min(diorama.burner.maxSticks, 3 + (mine.ai + 1) * 3);
      diorama.burner.setSticks(count);
      await wait(300);
    },
    async coin() {
      const coin = mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16),
        "#f2b705",
      );
      const from = diorama.position.clone().setY(diorama.position.y + 1.2);
      const to = diorama.offeringBox;
      diorama.scene.add(coin);
      await tween(0.7, (t) => {
        coin.position.lerpVectors(from, to, t);
        coin.position.y += Math.sin(Math.PI * t) * 1.4;
        coin.rotation.x = t * 12;
      });
      diorama.scene.remove(coin);
      play("coin");
    },
    async bell() {
      diorama.ringBell();
      play("bell");
      await wait(500);
    },
    async clap() {
      play("clap");
      await hop();
    },
  };

  // ----- One ritual per god -----
  function ritualFor(godId) {
    const god = GODS[godId];
    let state = "idle"; // idle | step | heard | drawing | fortune
    let stepIndex = 0;
    let reps = 0;
    let busy = false;
    let fortune = null;
    let run = 0; // bumped on cancel, so a half-finished step doesn't carry on

    const step = () => god.steps[stepIndex];
    const changed = () => onChange();

    async function next() {
      const s = step();
      const token = run;
      busy = true;
      changed();
      await effects[s.id]();
      if (token !== run) return;
      busy = false;
      reps++;
      if (reps >= (s.times ?? 1)) {
        reps = 0;
        stepIndex++;
      }
      if (stepIndex >= god.steps.length) {
        state = "heard";
        mine[godId]++;
        saveMine(godId, mine[godId]);
        sendPrayer(godId);
      }
      changed();
    }

    async function draw() {
      const token = run;
      state = "drawing";
      changed();
      play("rattle");
      await wait(1100);
      if (token !== run) return;
      const list = godId === "ai" ? AI_FORTUNES : PARKING_FORTUNES;
      fortune = {
        number: 1 + Math.floor(Math.random() * 100),
        entry: list[Math.floor(Math.random() * list.length)],
      };
      state = "fortune";
      changed();
    }

    const button = (action, label, { primary = true } = {}) =>
      `<button type="button" data-action="ritual:${action}" class="${primary ? "btn" : "btn-secondary"} text-sm disabled:opacity-50" ${busy ? "disabled" : ""}>${label}</button>`;
    const keyHint = isTouch
      ? ""
      : '<span class="text-xs text-ink-light">or press <kbd class="font-semibold">E</kbd></span>';
    const actions = (html) =>
      `<div class="flex flex-wrap items-center gap-3">${html}${keyHint}</div>`;

    // Compact so the whole card still fits on a phone. "All visitors" only
    // shows once the server has answered (not in local dev or before setup)
    function counter() {
      const all = everyone[godId];
      const pill = (label, value) =>
        `<span class="rounded-full bg-cloud px-3 py-1">${label}: <strong class="text-ink-dark">${value}</strong></span>`;
      return `<p class="flex flex-wrap gap-2 text-xs text-ink-light">
        ${pill(god.youLabel, mine[godId].toLocaleString("en"))}
        ${all === null ? "" : pill(god.everyoneLabel, all.toLocaleString("en"))}
      </p>`;
    }

    function fortuneSlip() {
      if (godId === "ai") {
        const [luck, text] = fortune.entry;
        return `<div class="rounded-xl border-2 border-dashed border-[#c4372c] bg-[#fff7ef] p-3">
          <p class="text-xs font-semibold uppercase tracking-wider text-[#c4372c]">Fortune stick No. ${fortune.number} · ${luck}</p>
          <p class="mt-1 font-semibold text-ink-dark">${text}</p>
        </div>`;
      }
      const [kanji, luck, text] = fortune.entry;
      return `<div class="rounded-xl border-2 border-dashed border-ink-light bg-white p-3 flex gap-3">
        <p class="text-2xl font-bold text-[#c4372c] leading-none" lang="ja">${kanji}</p>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-ink-light">${luck}</p>
          <p class="mt-1 font-semibold text-ink-dark">${text}</p>
        </div>
      </div>`;
    }

    return {
      html() {
        if (state === "idle")
          return counter() + actions(button("start", god.start));
        if (state === "step") {
          const s = step();
          const count = s.times > 1 ? ` (${reps + 1}/${s.times})` : "";
          return `<p class="text-xs font-semibold uppercase tracking-wider text-ink-light">Step ${stepIndex + 1} of ${god.steps.length}</p>
            <p>${s.text}</p>
            ${actions(button("next", s.button + count))}`;
        }
        if (state === "heard")
          return `<p class="font-semibold text-ink-dark">${god.heard}</p>${counter()}${actions(button("draw", god.fortuneButton))}`;
        if (state === "drawing")
          return `<p class="font-semibold text-ink-dark ${reduceMotion ? "" : "animate-pulse"}">${god.drawing}</p>`;
        return `${fortuneSlip()}${counter()}${actions(button("start", "Pray again", { primary: false }))}`;
      },
      // Only the first screen needs the temple's intro line
      showIntro: () => state === "idle",
      // What E does right now
      primary() {
        if (busy) return null;
        return { idle: "start", step: "next", heard: "draw", fortune: "start" }[
          state
        ];
      },
      act(action) {
        if (busy) return;
        if (action === "start") {
          state = "step";
          stepIndex = 0;
          reps = 0;
          fortune = null;
          changed();
        } else if (action === "next" && state === "step") next();
        else if (action === "draw" && state === "heard") draw();
      },
      // Walked away: start over next time, put the incense down
      cancel() {
        run++;
        busy = false;
        if (state === "drawing") state = "heard";
        if (state === "step") {
          state = "idle";
          stepIndex = reps = 0;
        }
        if (state === "fortune" || state === "heard") state = "idle";
        pose.remove(handIncense);
        pose.rotation.x = 0;
        pose.position.y = 0;
      },
    };
  }

  const rituals = { ai: ritualFor("ai"), parking: ritualFor("parking") };
  loadTotals();

  return {
    for: (god) => rituals[god],
    refresh: loadTotals,
    update(dt) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        tw.time += dt;
        const t = Math.min(1, tw.time / tw.duration);
        tw.fn(t);
        if (t >= 1) {
          tweens.splice(i, 1);
          tw.resolve();
        }
      }
    },
  };
}
