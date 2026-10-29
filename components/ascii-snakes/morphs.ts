/**
 * Ball python body outline and morph patterns, all in body coordinates:
 *   s  0 snout → 1 tail tip (fraction of length)
 *   x  px along the body, measured from the back of the head
 *   a  signed position across the back, -1 (one flank) → +1 (other flank)
 */
import { clamp, hash3, mix, noise1, smoothstep } from "./math";

export type RGB = [number, number, number];

export type MorphId = "normal" | "pastel" | "banana" | "albino" | "piebald" | "clown" | "axanthic" | "bel";

export interface Morph {
  id: MorphId;
  name: string;
  /** Dark ground colour between the blotches. */
  ground: RGB;
  /** The tan "alien head" blotches. */
  blotch: RGB;
  /** Dark centre of a flank blotch, or a clown's flecks. */
  spot: RGB;
  /** Top of the head, the pale stripe over the eye, and the lips. */
  cap: RGB;
  stripe: RGB;
  lip: RGB;
  eye: RGB;
  eyeBlock: RGB;
  /** Drawn red so it shows on the black ground (real ball python tongues are dark). */
  tongue: RGB;
  /** Colour of the silhouette's anti-aliased edge glyphs. */
  edge: RGB;
  layout: "normal" | "clown" | "plain";
  /** Piebald: white sides that rise over the back in patches. */
  pied?: boolean;
  /** Banana: odds of a dark freckle per scale. */
  freckles?: number;
  /** Strength of the glossy highlight. */
  gloss: number;
}

const WHITE: RGB = [248, 247, 242];

export const MORPHS: Record<MorphId, Morph> = {
  normal: {
    id: "normal", name: "Normal",
    ground: [46, 32, 21], blotch: [160, 110, 54], spot: [60, 40, 24],
    cap: [56, 39, 26], stripe: [178, 136, 80], lip: [200, 174, 130],
    eye: [168, 132, 92], eyeBlock: [14, 10, 8], tongue: [214, 64, 86], edge: [120, 88, 54],
    layout: "normal", gloss: 1,
  },
  pastel: {
    id: "pastel", name: "Pastel",
    ground: [96, 66, 34], blotch: [226, 176, 62], spot: [126, 88, 42],
    cap: [156, 116, 66], stripe: [236, 200, 112], lip: [238, 216, 160],
    eye: [184, 150, 104], eyeBlock: [18, 12, 8], tongue: [220, 70, 90], edge: [170, 128, 60],
    layout: "normal", gloss: 1,
  },
  banana: {
    id: "banana", name: "Banana",
    ground: [184, 146, 140], blotch: [240, 176, 70], spot: [212, 176, 162],
    cap: [178, 138, 124], stripe: [244, 198, 120], lip: [242, 222, 204],
    eye: [150, 112, 100], eyeBlock: [22, 15, 13], tongue: [226, 84, 104], edge: [180, 140, 110],
    layout: "normal", freckles: 0.055, gloss: 0.9,
  },
  albino: {
    id: "albino", name: "Albino",
    ground: [246, 238, 222], blotch: [250, 202, 54], spot: [252, 248, 238],
    cap: [246, 216, 124], stripe: [252, 246, 230], lip: [252, 250, 244],
    eye: [255, 110, 120], eyeBlock: [150, 30, 46], tongue: [246, 122, 144], edge: [220, 190, 110],
    layout: "normal", gloss: 0.8,
  },
  piebald: {
    id: "piebald", name: "Piebald",
    ground: [46, 32, 21], blotch: [164, 112, 54], spot: [62, 42, 25],
    cap: [58, 40, 26], stripe: [180, 138, 82], lip: [210, 190, 150],
    eye: [168, 132, 92], eyeBlock: [14, 10, 8], tongue: [236, 106, 128], edge: [200, 196, 186],
    layout: "normal", pied: true, gloss: 0.9,
  },
  clown: {
    id: "clown", name: "Clown",
    ground: [52, 35, 22], blotch: [196, 140, 62], spot: [56, 37, 23],
    cap: [190, 138, 66], stripe: [214, 168, 98], lip: [222, 196, 146],
    eye: [176, 140, 98], eyeBlock: [14, 10, 8], tongue: [214, 64, 86], edge: [150, 108, 52],
    layout: "clown", gloss: 1,
  },
  axanthic: {
    id: "axanthic", name: "Axanthic",
    ground: [34, 34, 38], blotch: [150, 147, 142], spot: [46, 46, 50],
    cap: [50, 50, 54], stripe: [174, 172, 168], lip: [200, 198, 194],
    eye: [160, 160, 172], eyeBlock: [10, 10, 12], tongue: [206, 70, 92], edge: [110, 110, 116],
    layout: "normal", gloss: 1.1,
  },
  bel: {
    id: "bel", name: "BEL",
    ground: WHITE, blotch: WHITE, spot: WHITE,
    cap: WHITE, stripe: WHITE, lip: WHITE,
    eye: [110, 176, 255], eyeBlock: [22, 44, 96], tongue: [246, 128, 150], edge: [200, 200, 196],
    layout: "plain", gloss: 0.75,
  },
};

export const MORPH_IDS = Object.keys(MORPHS) as MorphId[];

// ── body outline ───────────────────────────────────────────────────────

/** Where the head ends and the body pattern starts. */
export const HEAD_END = 0.068;
/** Eyes: position along the head and across it. */
export const EYE_S = 0.026;
export const EYE_A = 0.64;
/** Widest point of the body, as a fraction of length. Used for coil spacing. */
export const BODY_HALF_WIDTH = 0.047;

const HEAD_HW = 0.031;
const NECK_HW = 0.02;
const TAIL_START = 0.87;

/**
 * Top-down half-width at s, as a fraction of length: a rounded snout, a
 * spade-shaped head that is clearly wider than the slim neck behind it, a
 * heavy midbody and a short tail that tapers to a point.
 */
export function bodyHalfWidth(s: number) {
  if (s < 0) return 0;
  if (s < 0.014) {
    const k = s / 0.014;
    return HEAD_HW * 0.66 * Math.sqrt(k * (2 - k));
  }
  if (s < 0.044) return mix(HEAD_HW * 0.66, HEAD_HW, smoothstep(0.014, 0.044, s));
  if (s < 0.07) return mix(HEAD_HW, NECK_HW, smoothstep(0.046, 0.07, s));
  if (s < 0.44) return mix(NECK_HW, BODY_HALF_WIDTH, smoothstep(0.07, 0.44, s));
  if (s < TAIL_START) return mix(BODY_HALF_WIDTH, BODY_HALF_WIDTH * 0.55, smoothstep(0.44, TAIL_START, s));
  if (s > 1) return 0;
  const k = (s - TAIL_START) / (1 - TAIL_START);
  return BODY_HALF_WIDTH * 0.55 * Math.pow(1 - k, 1.2);
}

// ── patterns ───────────────────────────────────────────────────────────

const set = (out: RGB, c: RGB) => {
  out[0] = c[0];
  out[1] = c[1];
  out[2] = c[2];
  return out;
};

const blend = (out: RGB, a: RGB, b: RGB, t: number) => {
  out[0] = mix(a[0], b[0], t);
  out[1] = mix(a[1], b[1], t);
  out[2] = mix(a[2], b[2], t);
  return out;
};

function paintHead(m: Morph, s: number, a: number, out: RGB) {
  const aa = Math.abs(a);
  if (m.layout === "plain") return set(out, m.cap);
  if (m.layout === "clown") {
    // Clown: a pale head with a dark crown mark and a teardrop behind each eye.
    if (aa < 0.2 && s > 0.026 && s < 0.06) return set(out, m.ground);
    if (aa > 0.5 && aa < 0.84 && s > 0.034 && s < 0.064 - (aa - 0.5) * 0.04) return set(out, m.ground);
    if (aa > 0.88) return set(out, m.lip);
    return set(out, m.cap);
  }
  // Wild-type head: dark cap, a pale stripe from the nostril over the eye,
  // a dark stripe through the eye, then pale lips.
  const taper = smoothstep(0.04, HEAD_END, s) * 0.12;
  if (aa < 0.36 + taper) return set(out, m.cap);
  if (aa < 0.6 - taper * 0.5) return set(out, m.stripe);
  if (aa < 0.86) return set(out, m.ground);
  return set(out, m.lip);
}

/** Flank blotches alternate sides; returns the colour class at (x, a). */
function wildType(m: Morph, x: number, a: number, P: number, seed: number, out: RGB) {
  let best = Infinity;
  let spot = false;
  for (let side = -1; side <= 1; side += 2) {
    const offset = side > 0 ? 0.5 : 0;
    const k0 = Math.round(x / P - offset);
    for (let k = k0 - 1; k <= k0 + 1; k++) {
      const hs = side * 31 + seed;
      const ck = (k + offset + (hash3(k, hs, 1) - 0.5) * 0.4) * P;
      const size = 0.82 + 0.4 * hash3(k, hs, 2);
      // Some blotches reach over the spine and join the far side.
      const ac = side * (0.4 + 0.28 * hash3(k, hs, 3));
      const du = (x - ck) / (0.46 * P * size);
      const dv = (a - ac) / 0.52;
      const e = du * du + dv * dv;
      if (e < best) {
        best = e;
        // Dark "alien head" centre near the outer edge of the blotch.
        const sx = (x - ck) / (0.17 * P * size);
        const sv = (a - (ac + side * 0.27)) / 0.17;
        spot = hash3(k, hs, 4) < 0.85 && sx * sx + sv * sv < 1;
      }
    }
  }
  if (best < 1) return set(out, spot ? m.spot : m.blotch);

  // Small dorsal patches between the flank blotches.
  const dk = Math.round(x / P - 0.25);
  if (hash3(dk, seed, 5) < 0.55) {
    const cd = (dk + 0.25 + (hash3(dk, seed, 6) - 0.5) * 0.2) * P;
    const du = (x - cd) / (0.2 * P);
    const dv = a / 0.17;
    if (du * du + dv * dv < 1) return set(out, m.blotch);
  }
  // The ground is darkest right along the blotch borders.
  if (best < 1.3) return blend(out, m.ground, [0, 0, 0], 0.25);
  return set(out, m.ground);
}

function clownBody(m: Morph, x: number, a: number, P: number, seed: number, out: RGB) {
  const aa = Math.abs(a);
  // A wide dark dorsal stripe with a gently wavy edge; the flanks are clean gold.
  const edge = 0.24 + 0.05 * Math.sin(x / P * 2.1 + seed) + 0.03 * Math.sin(x / P * 5.3);
  if (aa < edge) return set(out, m.ground);
  const side = a >= 0 ? 1 : -1;
  const k = Math.round(x / (P * 2.6));
  if (hash3(k, side + seed, 8) < 0.45) {
    const ck = (k + (hash3(k, side + seed, 9) - 0.5) * 0.4) * P * 2.6;
    const du = (x - ck) / (0.22 * P);
    const dv = (aa - 0.78) / 0.14;
    if (du * du + dv * dv < 1) return set(out, m.spot);
  }
  return set(out, m.blotch);
}

/**
 * Colour of the skin at a body point. `grain` is roughly one grid cell in px,
 * so speckles like banana freckles come out one glyph wide.
 */
export function paintSkin(m: Morph, s: number, a: number, x: number, L: number, grain: number, seed: number, out: RGB) {
  if (s < HEAD_END) return paintHead(m, s, a, out);
  if (m.layout === "plain") return set(out, m.ground);

  // Blotch spacing shrinks a little toward the tail, like the real pattern.
  const P = L * 0.072 * (1 - 0.3 * smoothstep(0.7, 1, s));

  if (m.pied && s > 0.11) {
    // White rises from the belly; some stretches go fully white, others keep a dorsal island.
    const n = noise1(s * 14, seed) * 0.85 + noise1(s * 41, seed + 3) * 0.25;
    const amount = clamp((n - 0.22) * 1.5 * smoothstep(0.11, 0.2, s), 0, 1);
    const wobble = 0.06 * Math.sin(x * 0.09 + seed) + 0.04 * Math.sin(x * 0.23);
    if (Math.abs(a) > 1.05 - amount * 1.25 + wobble) return set(out, WHITE);
  }

  if (m.layout === "clown") clownBody(m, x, a, P, seed, out);
  else wildType(m, x, a, P, seed, out);

  if (m.freckles) {
    const gu = Math.floor(x / (grain * 1.1));
    const gv = Math.floor((a * L * BODY_HALF_WIDTH) / (grain * 1.2));
    if (hash3(gu, gv, seed + 17) < m.freckles) set(out, [74, 48, 40]);
  }
  return out;
}
