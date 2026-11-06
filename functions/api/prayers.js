// Prayer counter for the temple garden in the 3D world (/world).
// Cloudflare Pages Function at /api/prayers, storing totals in Workers KV.
//
// Setup: bind a KV namespace to this Pages project with the variable name
// PRAYERS (Settings → Bindings). Without it, the API answers 503 and the
// world just shows each visitor's own count.
//
// GET  /api/prayers                    → { ai, parking }
// POST /api/prayers  { "god": "ai" }   → { ai, parking, counted }

const GODS = ["ai", "parking"];
// A full ritual takes ~15 seconds, so more than this per minute is a bot
const MAX_PER_MINUTE = 4;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

async function totals(kv) {
  const values = await Promise.all(GODS.map((god) => kv.get(`total:${god}`)));
  return Object.fromEntries(
    GODS.map((god, i) => [god, Number(values[i]) || 0]),
  );
}

// Rate-limit by a hash of the visitor's IP, so no raw IPs are stored
async function visitorKey(request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`temple-garden:${ip}`),
  );
  return [...new Uint8Array(digest).slice(0, 12)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestGet({ env }) {
  if (!env.PRAYERS) return json({ error: "Counter not set up" }, 503);
  return json(await totals(env.PRAYERS));
}

export async function onRequestPost({ request, env }) {
  const kv = env.PRAYERS;
  if (!kv) return json({ error: "Counter not set up" }, 503);

  // Only accept prayers from this site's own pages
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host)
    return json({ error: "Forbidden" }, 403);

  let god;
  try {
    ({ god } = await request.json());
  } catch {}
  if (!GODS.includes(god)) return json({ error: "Unknown god" }, 400);

  const minute = Math.floor(Date.now() / 60000);
  const limitKey = `limit:${god}:${await visitorKey(request)}:${minute}`;
  const recent = Number(await kv.get(limitKey)) || 0;

  let counted = false;
  if (recent < MAX_PER_MINUTE) {
    try {
      // KV has no atomic increment: two prayers in the same instant can
      // count as one. Fine for a fun counter.
      const total = Number(await kv.get(`total:${god}`)) || 0;
      await kv.put(`total:${god}`, String(total + 1));
      await kv.put(limitKey, String(recent + 1), { expirationTtl: 120 });
      counted = true;
    } catch {
      // Out of free daily writes, or KV hiccup: still answer with totals
    }
  }
  return json({ ...(await totals(kv)), counted });
}
