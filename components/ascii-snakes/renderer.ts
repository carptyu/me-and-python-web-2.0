/**
 * Draws the World as a grid of ASCII cells:
 *   1. a dark ground with sparse leaf litter, a track field that fades where
 *      tails have dragged, the mouse's heat glow (what the heat pits see), and
 *      ripples where the ground was tapped
 *   2. snakes rasterised cell-by-cell with supersampled edges: blocks coloured by
 *      the morph pattern and lit like a glossy cylinder, scale glyphs on top, and
 *      the occasional iridescent glint
 *   3. tongues, and the mouse itself: an "@" with a tail
 *
 * The body is splatted segment by segment rather than testing every cell against
 * the whole spine. Where the body crosses itself (coils, or climbing out of one)
 * the part nearer the head wins and casts a shadow on the loop underneath.
 *
 * The grid is fine (about 7 px cells on a laptop), so drawing is batched: block
 * colours go into a one-pixel-per-cell image that is scaled up in one drawImage,
 * glyphs are stamped from small pre-rendered sprite sheets, one per ink colour,
 * and the static ground (background + leaf litter) is painted once.
 */
import { clamp, hash3, smoothstep } from "./math";
import { bodyHalfWidth, EYE_A, EYE_S, HEAD_END, MORPHS, paintSkin, type RGB } from "./morphs";
import { SNAKE_NODES, type Snake, type World } from "./world";

const HW_RES = 1024;
const HW_TABLE = new Float32Array(HW_RES + 1);
for (let i = 0; i <= HW_RES; i++) HW_TABLE[i] = bodyHalfWidth(i / HW_RES);
const hwAt = (s: number) => HW_TABLE[clamp(Math.round(s * HW_RES), 0, HW_RES)];

// Sample points inside a cell; the centre comes first.
const SUB = [0.5, 0.5, 0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];
/** Two hits further apart than this along the body are different loops of it. */
const LOOP_GAP = 0.15;
/** A tucked head ranks below the whole body, so it slips under the coils. */
const TUCK_S = 0.13;

// Sparse glyphs on bright skin, dense glyphs in shadow.
const SCALE_RAMP = ":;=+x%X8#@";
const EDGE_HEAVY = ":;";
const EDGE_LIGHT = ".',`";
const LITTER = ".,'`\"";
const STEMS = ["-", "\\", "|", "/"];
const GLYPHS = [...new Set(SCALE_RAMP + EDGE_HEAVY + EDGE_LIGHT + LITTER + STEMS.join("") + "o~*")].join("");
const gi = (c: string) => GLYPHS.indexOf(c);
const RAMP_I = [...SCALE_RAMP].map(gi);
const HEAVY_I = [...EDGE_HEAVY].map(gi);
const LIGHT_I = [...EDGE_LIGHT].map(gi);
const LITTER_I = [...LITTER].map(gi);
const STEM_I = STEMS.map(gi);
const EYE_I = gi("o");

const GLINT = ["#8fe9ff", "#b79bff", "#8dffc0", "#ffe39a", "#ffa3da"];
const LITTER_INK = "rgb(78,82,56)";
const LITTER_ALPHA = [0.5, 0.72, 0.95];
const MOUSE_BODY = "#f4e4de";
const MOUSE_TAIL = "#d98d9a";

// Light from the top-left, a little above; Blinn half-vector for the gloss.
const LX = -0.42, LY = -0.56, LZ = 0.72;
const LN = Math.hypot(LX, LY, LZ);
const LIGHT = [LX / LN, LY / LN, LZ / LN];
const HN = Math.hypot(LIGHT[0], LIGHT[1], LIGHT[2] + 1);
const HALF = [LIGHT[0] / HN, LIGHT[1] / HN, (LIGHT[2] + 1) / HN];

const FLAG_BODY = 1;
const FLAG_EDGE = 2;
const FLAG_EYE = 3;

const TRAIL_LEVELS = 6;
const HEAT_RGB: RGB[] = [[150, 28, 64], [236, 92, 42], [255, 212, 120]];

const rgb = (r: number, g: number, b: number) =>
  `rgb(${clamp(r, 0, 255) | 0},${clamp(g, 0, 255) | 0},${clamp(b, 0, 255) | 0})`;
/** ImageData pixel (little-endian ABGR). */
const pack = (r: number, g: number, b: number) =>
  ((255 << 24) | ((clamp(b, 0, 255) | 0) << 16) | ((clamp(g, 0, 255) | 0) << 8) | (clamp(r, 0, 255) | 0)) >>> 0;

function parseHex(c: string): RGB | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  speed: number;
  life: number;
}

export interface RendererOptions {
  background?: string;
  /** Sparse leaf-litter glyphs on the ground. */
  litter?: boolean;
}

export class AsciiRenderer {
  private ctx: CanvasRenderingContext2D;
  private background: string;
  private litterOn: boolean;
  private dpr = 1;
  private width = 0;
  private height = 0;
  private cw = 7;
  private ch = 10;
  private cols = 0;
  private rows = 0;
  private fontFamily = "ui-monospace, Menlo, monospace";

  // Batched drawing.
  private blockCanvas: HTMLCanvasElement;
  private blockCtx: CanvasRenderingContext2D;
  private blockImage: ImageData | null = null;
  private blockPix = new Uint32Array(0);
  private gridCanvas: HTMLCanvasElement;
  /** Background colour plus leaf litter; repainted only on resize or font load. */
  private groundCanvas: HTMLCanvasElement;
  private groundDirty = true;
  /** Glyph sprite sheets, one per ink colour; index = slot id. */
  private sheets: HTMLCanvasElement[] = [];
  private sheetSlot = new Map<string, number>();
  private gw = 1;
  private gh = 1;

  // Per-snake splat scratch.
  private stamp = new Uint32Array(0);
  private pass = 0;
  private touched = new Int32Array(0);
  private touchedCount = 0;
  private mask = new Uint8Array(0);
  private cS = new Float32Array(0);
  /** Draw priority of the centre hit: lower is on top. Equals s unless the head is tucked. */
  private cP = new Float32Array(0);
  private cD = new Float32Array(0);
  private cA = new Float32Array(0);
  private cNx = new Float32Array(0);
  private cNy = new Float32Array(0);
  private cTop = new Float32Array(0);

  // Final cell contents.
  private flag = new Uint8Array(0);
  private owner = new Uint8Array(0);
  private glyph = new Uint8Array(0);
  private ink = new Uint16Array(0);
  private alpha = new Uint8Array(0);
  private shadow = new Uint8Array(0);

  // Ground.
  private litter = new Uint8Array(0);
  private litterTone = new Uint8Array(0);
  private trail = new Float32Array(0);
  private trailTmp = new Float32Array(0);
  private heat = new Float32Array(0);
  private heatTmp = new Float32Array(0);
  private ripples: Ripple[] = [];
  private trailStyles: string[] = [];
  private trailBuckets: number[][] = [];
  private heatCells: number[] = [];
  private paint: RGB = [0, 0, 0];

  constructor(private canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.background = options.background ?? "#000";
    this.litterOn = options.litter ?? true;
    this.blockCanvas = document.createElement("canvas");
    this.blockCtx = this.blockCanvas.getContext("2d")!;
    this.gridCanvas = document.createElement("canvas");
    this.groundCanvas = document.createElement("canvas");
    for (let l = 0; l < TRAIL_LEVELS; l++) {
      this.trailStyles.push(`rgba(206,160,96,${(0.12 + (0.4 * (l + 1)) / TRAIL_LEVELS).toFixed(3)})`);
      this.trailBuckets.push([]);
    }
  }

  setFontFamily(family: string) {
    if (family) this.fontFamily = family;
  }

  /** Re-render the glyph sprites, e.g. once the webfont has loaded. */
  refreshGlyphs() {
    this.sheets = [];
    this.sheetSlot.clear();
    this.groundDirty = true;
  }

  resize(width: number, height: number, dpr: number) {
    const prevCols = this.cols;
    const prevRows = this.rows;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.cw = clamp(Math.round(width / 205), 5, 8);
    this.ch = Math.round(this.cw * 1.45);
    this.cols = Math.ceil(width / this.cw);
    this.rows = Math.ceil(height / this.ch);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    const n = this.cols * this.rows;
    if (this.cols !== prevCols || this.rows !== prevRows) {
      this.stamp = new Uint32Array(n);
      this.touched = new Int32Array(n);
      this.mask = new Uint8Array(n);
      this.cS = new Float32Array(n);
      this.cP = new Float32Array(n);
      this.cD = new Float32Array(n);
      this.cA = new Float32Array(n);
      this.cNx = new Float32Array(n);
      this.cNy = new Float32Array(n);
      this.cTop = new Float32Array(n);
      this.flag = new Uint8Array(n);
      this.owner = new Uint8Array(n);
      this.glyph = new Uint8Array(n);
      this.ink = new Uint16Array(n);
      this.alpha = new Uint8Array(n);
      this.shadow = new Uint8Array(n);
      this.litter = new Uint8Array(n);
      this.litterTone = new Uint8Array(n);
      this.trail = new Float32Array(n);
      this.trailTmp = new Float32Array(n);
      this.heat = new Float32Array(n);
      this.heatTmp = new Float32Array(n);
      this.pass = 0;
      this.blockCanvas.width = this.cols;
      this.blockCanvas.height = this.rows;
      this.blockImage = this.blockCtx.createImageData(this.cols, this.rows);
      this.blockPix = new Uint32Array(this.blockImage.data.buffer);
    }
    for (let i = 0; i < n; i++) {
      const c = i % this.cols;
      const r = (i / this.cols) | 0;
      const on = this.litterOn && hash3(c, r, 91) < 0.045;
      this.litter[i] = on ? 1 + Math.floor(hash3(c, r, 92) * LITTER.length) : 0;
      this.litterTone[i] = Math.floor(hash3(c, r, 93) * 3);
    }
    this.paintGrid();
    this.refreshGlyphs();
  }

  /**
   * Opaque grid lines drawn over the blocks, so every block sits in its own
   * tile; over bare ground they read as a faint grid.
   */
  private paintGrid() {
    const { width: W, height: H, dpr, cw, ch } = this;
    const g = this.gridCanvas;
    g.width = this.canvas.width;
    g.height = this.canvas.height;
    const x = g.getContext("2d")!;
    const bg = parseHex(this.background);
    x.strokeStyle = bg
      ? rgb(bg[0] + (255 - bg[0]) * 0.05, bg[1] + (255 - bg[1]) * 0.05, bg[2] + (255 - bg[2]) * 0.05)
      : "rgba(255,255,255,0.05)";
    x.lineWidth = 1;
    x.beginPath();
    for (let c = 0; c <= Math.ceil(W / cw); c++) {
      const px = Math.round(c * cw * dpr) + 0.5;
      x.moveTo(px, 0);
      x.lineTo(px, H * dpr);
    }
    for (let r = 0; r <= Math.ceil(H / ch); r++) {
      const py = Math.round(r * ch * dpr) + 0.5;
      x.moveTo(0, py);
      x.lineTo(W * dpr, py);
    }
    x.stroke();
  }

  /** Background fill with the leaf litter stamped in. Snakes cover it where they lie. */
  private paintGround() {
    const g = this.groundCanvas;
    g.width = this.canvas.width;
    g.height = this.canvas.height;
    const x = g.getContext("2d")!;
    x.fillStyle = this.background;
    x.fillRect(0, 0, g.width, g.height);
    const { cols, cw, ch, dpr, gw, gh, litter, litterTone } = this;
    const sheet = this.sheets[this.slot(LITTER_INK)];
    for (let i = 0; i < litter.length; i++) {
      if (!litter[i]) continue;
      x.globalAlpha = LITTER_ALPHA[litterTone[i]];
      const dx = Math.round((i % cols) * cw * dpr);
      const dy = Math.round(((i / cols) | 0) * ch * dpr);
      x.drawImage(sheet, LITTER_I[litter[i] - 1] * gw, 0, gw, gh, dx, dy, gw, gh);
    }
    this.groundDirty = false;
  }

  /** Sprite sheet slot for an ink colour, built on first use. */
  private slot(color: string) {
    const hit = this.sheetSlot.get(color);
    if (hit !== undefined) return hit;
    const { dpr, cw, ch } = this;
    this.gw = Math.max(1, Math.round(cw * dpr));
    this.gh = Math.max(1, Math.round(ch * dpr));
    const sheet = document.createElement("canvas");
    sheet.width = this.gw * GLYPHS.length;
    sheet.height = this.gh;
    const g = sheet.getContext("2d")!;
    g.font = `600 ${Math.round(ch * 0.8 * dpr)}px ${this.fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = color;
    for (let i = 0; i < GLYPHS.length; i++) g.fillText(GLYPHS[i], i * this.gw + this.gw / 2, this.gh / 2 + dpr * 0.5);
    const id = this.sheets.length;
    this.sheets.push(sheet);
    this.sheetSlot.set(color, id);
    return id;
  }

  /** Stamp glyph `g` from sheet `s` into cell i (device space). */
  private stampGlyph(s: number, g: number, i: number) {
    const { cols, cw, ch, dpr, gw, gh } = this;
    const x = Math.round((i % cols) * cw * dpr);
    const y = Math.round(((i / cols) | 0) * ch * dpr);
    this.ctx.drawImage(this.sheets[s], g * gw, 0, gw, gh, x, y, gw, gh);
  }

  render(world: World, dt: number) {
    const { ctx, dpr, cols } = this;
    if (cols === 0) return;
    const t = world.time;
    const black = this.slot("#000");

    this.consumeEvents(world, dt);
    this.rasterize(world.snakes, t, black);
    this.depositGround(world);
    this.diffuse(dt);

    if (this.groundDirty) this.paintGround();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.groundCanvas, 0, 0);

    this.drawGround();
    this.drawRipples();

    // All snake blocks in one go, then the grid over them.
    this.blockCtx.putImageData(this.blockImage!, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.blockCanvas, 0, 0, cols, this.rows, 0, 0, Math.round(cols * this.cw * dpr), Math.round(this.rows * this.ch * dpr));
    ctx.drawImage(this.gridCanvas, 0, 0);

    this.drawSnakeGlyphs();
    this.drawTongues(world.snakes, t);
    ctx.globalAlpha = 1;
    this.drawMouse(world, t);
  }

  // ── ground ──────────────────────────────────────────────────────────

  private cellIndex(x: number, y: number) {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }

  private stampHeat(x: number, y: number, radius: number, amount: number) {
    const { heat, cw, ch, cols, rows } = this;
    const c0 = Math.floor(x / cw);
    const r0 = Math.floor(y / ch);
    const rc = Math.ceil(radius / cw);
    const rr = Math.ceil(radius / ch);
    for (let r = r0 - rr; r <= r0 + rr; r++) {
      for (let c = c0 - rc; c <= c0 + rc; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const d = Math.hypot((c - c0) * cw, (r - r0) * ch) / radius;
        if (d > 1) continue;
        const i = r * cols + c;
        heat[i] = Math.min(1.3, heat[i] + amount * (1 - d) * (1 - d));
      }
    }
  }

  private consumeEvents(world: World, dt: number) {
    for (const e of world.events) {
      if (e.kind === "ripple") this.ripples.push({ x: e.x, y: e.y, age: 0, speed: 520, life: 1.1 });
      else if (e.kind === "pop") this.ripples.push({ x: e.x, y: e.y, age: 0, speed: 140, life: 0.45 });
      else this.stampHeat(e.x, e.y, 46, 1.4);
    }
    world.events.length = 0;
    for (const rp of this.ripples) rp.age += dt;
    this.ripples = this.ripples.filter((rp) => rp.age < rp.life);
  }

  private depositGround(world: World) {
    const { trail } = this;
    for (const sh of world.snakes) {
      if (sh.speed < 2) continue;
      // The tail end drags a thin track through the litter.
      const k = Math.min(1.3, sh.speed / sh.cruise) * 0.03;
      for (let n = SNAKE_NODES - 10; n < SNAKE_NODES - 1; n++) {
        const i = this.cellIndex(sh.nodes[n * 2], sh.nodes[n * 2 + 1]);
        if (i >= 0) trail[i] = Math.min(1.2, trail[i] + k);
      }
    }
    // The mouse is warm.
    if (world.mouse.present) this.stampHeat(world.mouse.x, world.mouse.y, 34, 0.08);
  }

  /** Light blur + decay: tracks linger for a few seconds, heat drifts and cools fast. */
  private diffuse(dt: number) {
    const { cols, rows } = this;
    const trailDecay = Math.exp(-dt * 0.42);
    const heatDecay = Math.exp(-dt * 2.6);
    const blur = (src: Float32Array, dst: Float32Array, keep: number, decay: number) => {
      const side = (1 - keep) / 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const v = src[i];
          const l = c > 0 ? src[i - 1] : v;
          const rt = c < cols - 1 ? src[i + 1] : v;
          const u = r > 0 ? src[i - cols] : v;
          const d = r < rows - 1 ? src[i + cols] : v;
          dst[i] = (v * keep + (l + rt + u + d) * side) * decay;
        }
      }
    };
    blur(this.trail, this.trailTmp, 0.97, trailDecay);
    [this.trail, this.trailTmp] = [this.trailTmp, this.trail];
    blur(this.heat, this.heatTmp, 0.72, heatDecay);
    [this.heat, this.heatTmp] = [this.heatTmp, this.heat];
  }

  private drawGround() {
    const { ctx, cols, rows, cw, ch, dpr, flag, shadow, trail, heat } = this;
    const { trailBuckets, heatCells } = this;
    for (const b of trailBuckets) b.length = 0;
    heatCells.length = 0;

    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      if (flag[i]) continue;
      if (heat[i] >= 0.1) {
        heatCells.push(i);
        continue;
      }
      const e = trail[i];
      if (e >= 0.1) trailBuckets[clamp(Math.floor((shadow[i] ? e * 0.3 : e) * 7), 0, TRAIL_LEVELS - 1)].push(i);
    }

    const dot = Math.max(2, Math.round(cw * 0.26 * dpr));
    for (let l = 0; l < TRAIL_LEVELS; l++) {
      const bucket = trailBuckets[l];
      if (!bucket.length) continue;
      ctx.fillStyle = this.trailStyles[l];
      const size = l > 3 ? dot + 1 : dot;
      for (const i of bucket) {
        const x = ((i % cols) + 0.5) * cw * dpr;
        const y = (((i / cols) | 0) + 0.55) * ch * dpr;
        ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
      }
    }

    for (const i of heatCells) {
      const h = heat[i];
      const band = h > 0.75 ? 2 : h > 0.35 ? 1 : 0;
      const [r, g, b] = HEAT_RGB[band];
      ctx.fillStyle = `rgba(${r},${g},${b},${clamp(0.25 + h * 0.6, 0, 1).toFixed(2)})`;
      const size = band === 2 ? dot + 2 : band === 1 ? dot + 1 : dot;
      const x = ((i % cols) + 0.5) * cw * dpr;
      const y = (((i / cols) | 0) + 0.5) * ch * dpr;
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
  }

  private drawRipples() {
    const { ctx, cols, rows, cw, ch, dpr, flag } = this;
    const dot = Math.max(2, Math.round(cw * 0.3 * dpr));
    for (const rp of this.ripples) {
      const life = 1 - rp.age / rp.life;
      for (const [radius, strength] of [[rp.age * rp.speed, 1], [rp.age * rp.speed * 0.64, 0.5]] as const) {
        if (radius < cw) continue;
        const c0 = Math.max(0, Math.floor((rp.x - radius - cw) / cw));
        const c1 = Math.min(cols - 1, Math.floor((rp.x + radius + cw) / cw));
        const r0 = Math.max(0, Math.floor((rp.y - radius - ch) / ch));
        const r1 = Math.min(rows - 1, Math.floor((rp.y + radius + ch) / ch));
        ctx.fillStyle = `rgba(214,222,200,${(life * life * 0.8 * strength).toFixed(3)})`;
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const x = (c + 0.5) * cw;
            const y = (r + 0.5) * ch;
            if (Math.abs(Math.hypot(x - rp.x, y - rp.y) - radius) > cw * 0.75) continue;
            if (flag[r * cols + c]) continue;
            ctx.fillRect(Math.round(x * dpr - dot / 2), Math.round(y * dpr - dot / 2), dot, dot);
          }
        }
      }
    }
  }

  // ── snakes ──────────────────────────────────────────────────────────

  private rasterize(snakes: Snake[], t: number, black: number) {
    this.flag.fill(0);
    this.shadow.fill(0);
    this.blockPix.fill(0);
    for (let si = 0; si < snakes.length; si++) {
      this.splat(snakes[si]);
      this.shadeSnake(snakes[si], si + 1, t, black);
    }
    if (snakes.length > 1) this.contactShadows();
  }

  /**
   * Where one snake lies across another, darken the lower one right along the upper
   * one's outline, so the crossing reads as one body resting on the other.
   */
  private contactShadows() {
    const { cols, rows, flag, owner, blockPix } = this;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (flag[i] !== FLAG_BODY) continue;
        const me = owner[i];
        let over = false;
        for (let dr = -1; dr <= 1 && !over; dr++) {
          const rr = r + dr;
          if (rr < 0 || rr >= rows) continue;
          for (let dc = -1; dc <= 1; dc++) {
            const cc = c + dc;
            if (cc < 0 || cc >= cols) continue;
            const j = rr * cols + cc;
            if (flag[j] && owner[j] > me) {
              over = true;
              break;
            }
          }
        }
        if (!over) continue;
        const p = blockPix[i];
        // Halve r, g and b in place (ABGR), keeping alpha.
        blockPix[i] = (((p & 0x00fefefe) >>> 1) | 0xff000000) >>> 0;
      }
    }
  }

  /**
   * For every cell near each segment, record which samples the body covers and the topmost hit.
   * This is the hot loop (each cell is near ~10 segments), so it avoids hypot/sqrt and only
   * looks at the corner samples for cells straddling the outline.
   */
  private splat(sh: Snake) {
    const { cw, ch, cols, rows, stamp, touched, mask, cS, cP, cD, cA, cNx, cNy, cTop } = this;
    const L = sh.length;
    const N = SNAKE_NODES;
    const nodes = sh.nodes;
    const tuck = sh.tuck;
    const pass = ++this.pass;
    let touchedCount = 0;
    const halfDiag = Math.sqrt(cw * cw + ch * ch) / 2;

    // A swallowed meal: a lump that widens the body as it travels down.
    const b = sh.bulge;
    const lump = b > 0 ? 0.42 * smoothstep(0.05, 0.1, b) * (1 - smoothstep(0.48, 0.62, b)) : 0;

    for (let k = 0; k < N - 1; k++) {
      const ax = nodes[k * 2];
      const ay = nodes[k * 2 + 1];
      const sx = nodes[(k + 1) * 2] - ax;
      const sy = nodes[(k + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1e-6;
      const s0 = k / (N - 1);
      const ds = 1 / (N - 1);
      const w0 = hwAt(s0);
      const w1 = hwAt(s0 + ds);
      const wmax = Math.max(w0, w1, hwAt(s0 + ds / 2)) * L * (1 + lump);
      if (wmax < 0.4) continue;
      const wmin = Math.min(w0, w1) * L;
      const reach = wmax * 1.35 + 1;
      // Squared thresholds for the centre test, so no square roots are needed.
      const far2 = (reach + halfDiag) ** 2;
      const allOut2 = (wmax + halfDiag) ** 2;
      const allIn2 = wmin > halfDiag ? (wmin - halfDiag) ** 2 : -1;
      const c0 = Math.max(0, Math.floor((Math.min(ax, ax + sx) - reach) / cw));
      const c1 = Math.min(cols - 1, Math.floor((Math.max(ax, ax + sx) + reach) / cw));
      const r0 = Math.max(0, Math.floor((Math.min(ay, ay + sy) - reach) / ch));
      const r1 = Math.min(rows - 1, Math.floor((Math.max(ay, ay + sy) + reach) / ch));

      for (let r = r0; r <= r1; r++) {
        const ry = (r + 0.5) * ch - ay;
        for (let c = c0; c <= c1; c++) {
          const rx = (c + 0.5) * cw - ax;
          let u = (rx * sx + ry * sy) / len2;
          u = u < 0 ? 0 : u > 1 ? 1 : u;
          const dx = rx - sx * u;
          const dy = ry - sy * u;
          const d2 = dx * dx + dy * dy;
          if (d2 > far2) continue;

          const i = r * cols + c;
          if (stamp[i] !== pass) {
            stamp[i] = pass;
            mask[i] = 0;
            cP[i] = Infinity;
            cTop[i] = Infinity;
            touched[touchedCount++] = i;
          }

          // Centre sample: coverage, the topmost loop, and what the shading needs.
          const s = s0 + ds * u;
          let w = HW_TABLE[(s * HW_RES + 0.5) | 0] * L;
          if (lump > 0) w *= 1 + lump * Math.exp(-(((s - b) / 0.032) ** 2));
          const w2 = w * w;
          const p = tuck && s < TUCK_S ? TUCK_S + (TUCK_S - s) * 7 : s;
          if (d2 <= w2 * 1.82 && p < cTop[i]) cTop[i] = p;
          if (d2 <= w2) {
            mask[i] |= 1;
            const dn = d2 / (w2 || 1);
            const cur = cP[i];
            // The loop nearer the head is on top; within one loop the nearest segment wins.
            if (cur === Infinity || p < cur - LOOP_GAP || (Math.abs(p - cur) <= LOOP_GAP && dn < cD[i])) {
              cS[i] = s;
              cP[i] = p;
              cD[i] = dn;
              const d = Math.sqrt(d2);
              const len = Math.sqrt(len2);
              const nx = d > 1e-4 ? dx / d : -sy / len;
              const ny = d > 1e-4 ? dy / d : sx / len;
              cNx[i] = nx;
              cNy[i] = ny;
              cA[i] = (sx * ny - sy * nx >= 0 ? 1 : -1) * Math.sqrt(dn);
            }
          }

          // Corner samples sit within half a cell diagonal of the centre, and distance to the
          // segment changes no faster than the sample moves: a centre clearly outside this
          // segment's widest part, or clearly inside its thinnest, settles all four at once.
          if (d2 > allOut2) continue;
          if (d2 < allIn2) {
            mask[i] |= 0b11110;
            continue;
          }
          for (let q = 1; q < 5; q++) {
            const px = (c + SUB[q * 2]) * cw - ax;
            const py = (r + SUB[q * 2 + 1]) * ch - ay;
            let uq = (px * sx + py * sy) / len2;
            uq = uq < 0 ? 0 : uq > 1 ? 1 : uq;
            const ex = px - sx * uq;
            const ey = py - sy * uq;
            const sq = s0 + ds * uq;
            let wq = HW_TABLE[(sq * HW_RES + 0.5) | 0] * L;
            if (lump > 0) wq *= 1 + lump * Math.exp(-(((sq - b) / 0.032) ** 2));
            if (ex * ex + ey * ey <= wq * wq) mask[i] |= 1 << q;
          }
        }
      }
    }
    this.touchedCount = touchedCount;
  }

  /** Turn this snake's splat into coloured, lit, glyphed cells. */
  private shadeSnake(sh: Snake, ownerId: number, t: number, black: number) {
    const { cw, ch, cols, rows, touched, mask, cS, cP, cA, cNx, cNy, cTop, flag, owner, glyph, ink, alpha, shadow, blockPix, paint } = this;
    const m = MORPHS[sh.morph];
    const L = sh.length;
    const dim = 0.74 + 0.26 * sh.depth;
    const seed = sh.id * 7 + 3;
    const shadowDc = Math.max(1, Math.round((L * 0.012) / cw));
    const shadowDr = Math.max(1, Math.round((L * 0.008) / ch));
    const edgeInk = this.slot(rgb(m.edge[0] * dim, m.edge[1] * dim, m.edge[2] * dim));

    for (let n = 0; n < this.touchedCount; n++) {
      const i = touched[n];
      const mk = mask[i];
      if (!mk) continue;
      const hits = (mk & 1) + ((mk >> 1) & 1) + ((mk >> 2) & 1) + ((mk >> 3) & 1) + ((mk >> 4) & 1);
      const col = i % cols;
      const row = (i / cols) | 0;

      if (!(mk & 1) || hits < 3) {
        // Soft, anti-aliased silhouette: no block, just a light glyph.
        if (flag[i] === FLAG_BODY || flag[i] === FLAG_EYE) continue;
        const cover = hits / 5;
        const key = hash3(col, row, seed);
        const set = cover >= 0.5 ? HEAVY_I : LIGHT_I;
        flag[i] = FLAG_EDGE;
        owner[i] = ownerId;
        glyph[i] = set[Math.floor(key * set.length)];
        ink[i] = edgeInk;
        alpha[i] = Math.round((0.36 + 0.55 * cover) * 255);
        continue;
      }

      const s = cS[i];
      const a = cA[i];
      const x = (s - HEAD_END) * L;
      paintSkin(m, s, a, x, L, cw, seed, paint);

      // Glossy cylinder: Lambert plus a tight Blinn highlight along the back.
      const aa = Math.min(0.97, Math.abs(a));
      const nz = Math.sqrt(1 - aa * aa);
      const Nx = cNx[i] * aa;
      const Ny = cNy[i] * aa;
      const lambert = Math.max(0, Nx * LIGHT[0] + Ny * LIGHT[1] + nz * LIGHT[2]);
      let spec = Math.pow(Math.max(0, Nx * HALF[0] + Ny * HALF[1] + nz * HALF[2]), 26) * m.gloss;
      let light = 0.36 + 0.8 * lambert;
      if (cTop[i] < cP[i] - LOOP_GAP) {
        // A higher loop of the coil shades this one.
        light *= 0.42;
        spec *= 0.15;
      }
      const R = (paint[0] * light + spec * 120) * dim;
      const G = (paint[1] * light + spec * 120) * dim;
      const B = (paint[2] * light + spec * 124) * dim;

      // Body-anchored key, so each scale glyph rides along with the skin.
      const gu = Math.round((s * L) / (cw * 0.95));
      const gv = Math.round((a * hwAt(s) * L) / (ch * 0.8));
      const key = (hash3(gu, gv, seed) * 4294967295) >>> 0;
      const lum = 0.3 * R + 0.59 * G + 0.11 * B;
      const jitter = key % 5 === 0 ? ((key >>> 4) % 2) * 2 - 1 : 0;
      const level = clamp(Math.floor((1 - lum / 235) * (SCALE_RAMP.length - 0.01)) + jitter, 0, SCALE_RAMP.length - 1);

      flag[i] = FLAG_BODY;
      owner[i] = ownerId;
      blockPix[i] = pack(R, G, B);
      glyph[i] = RAMP_I[level];
      // Glints re-roll on a staggered clock so the skin shimmers like real scales.
      const roll = hash3(key, Math.floor(t * 2.2 + (key % 997) / 97), 7);
      if (spec > 0.18 && roll < 0.07) {
        ink[i] = this.slot(GLINT[key % GLINT.length]);
        alpha[i] = 255;
      } else {
        // Dark glyphs throughout: pale skin reads as texture, dark markings stay solid
        // (on the darkest blocks a dark glyph wouldn't show, so none is drawn).
        ink[i] = black;
        alpha[i] = lum > 70 ? 163 : lum > 42 ? 128 : 0;
      }

      const sc = col + shadowDc;
      const sr = row + shadowDr;
      if (sc < cols && sr < rows) shadow[sr * cols + sc] = 1;
    }

    // Eyes: one cell each side, placed from the spine so they never drop out.
    const N = SNAKE_NODES;
    const f = EYE_S * (N - 1);
    const k = Math.floor(f);
    const u = f - k;
    const nd = sh.nodes;
    const ex = nd[k * 2] + (nd[(k + 1) * 2] - nd[k * 2]) * u;
    const ey = nd[k * 2 + 1] + (nd[(k + 1) * 2 + 1] - nd[k * 2 + 1]) * u;
    let tx = nd[(k + 1) * 2] - nd[k * 2];
    let ty = nd[(k + 1) * 2 + 1] - nd[k * 2 + 1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const off = EYE_A * hwAt(EYE_S) * L;
    const eyeInk = this.slot(rgb(m.eye[0], m.eye[1], m.eye[2]));
    for (let side = -1; side <= 1; side += 2) {
      const i = this.cellIndex(ex - ty * off * side, ey + tx * off * side);
      if (i < 0 || owner[i] !== ownerId || flag[i] !== FLAG_BODY || cS[i] > 0.12) continue;
      flag[i] = FLAG_EYE;
      blockPix[i] = pack(m.eyeBlock[0], m.eyeBlock[1], m.eyeBlock[2]);
      glyph[i] = EYE_I;
      ink[i] = eyeInk;
      alpha[i] = 255;
    }
  }

  private drawSnakeGlyphs() {
    const { ctx, flag, glyph, ink, alpha } = this;
    const n = this.cols * this.rows;
    let a = -1;
    for (let i = 0; i < n; i++) {
      if (!flag[i] || !alpha[i]) continue;
      if (alpha[i] !== a) {
        a = alpha[i];
        ctx.globalAlpha = a / 255;
      }
      this.stampGlyph(ink[i], glyph[i], i);
    }
    ctx.globalAlpha = 1;
  }

  /** A red forked tongue flicking out ahead of the snout. */
  private drawTongues(snakes: Snake[], t: number) {
    const { cw, ch, flag } = this;
    const stemFor = (dx: number, dy: number) => {
      const ang = ((Math.atan2(dy, dx) % Math.PI) + Math.PI) % Math.PI;
      return STEM_I[Math.round(ang / (Math.PI / 4)) % 4];
    };
    const put = (sheet: number, g: number, x: number, y: number) => {
      const i = this.cellIndex(x, y);
      if (i < 0 || flag[i] === FLAG_BODY || flag[i] === FLAG_EYE) return;
      this.stampGlyph(sheet, g, i);
    };
    for (const sh of snakes) {
      if (sh.tongue < 0) continue;
      const p = sh.tongue;
      // Out fast, flutter, back in.
      const ext = Math.min(1, p / 0.18) * Math.min(1, (1 - p) / 0.22);
      const reach = (sh.length * 0.045 + cw * 2) * ext;
      if (reach < cw) continue;
      const n = sh.nodes;
      let dx = n[0] - n[4];
      let dy = n[1] - n[5];
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      const m = MORPHS[sh.morph];
      const sheet = this.slot(rgb(m.tongue[0], m.tongue[1], m.tongue[2]));
      const step = (Math.abs(dx) * cw + Math.abs(dy) * ch) * 0.85;
      const stem = stemFor(dx, dy);
      const forkLen = Math.min(reach * 0.4, step * 2.2);
      const stemLen = reach - forkLen;
      for (let d = step * 0.6; d <= stemLen; d += step) put(sheet, stem, n[0] + dx * d, n[1] + dy * d);
      // Two tips that flutter apart and together.
      const spread = Math.floor(t * 14) % 2 === 0 ? 0.42 : 0.7;
      const bx = n[0] + dx * stemLen;
      const by = n[1] + dy * stemLen;
      for (let side = -1; side <= 1; side += 2) {
        const c = Math.cos(spread * side);
        const sn = Math.sin(spread * side);
        const tx = dx * c - dy * sn;
        const ty = dx * sn + dy * c;
        const g = stemFor(tx, ty);
        for (let d = step * 0.7; d <= forkLen + 0.01; d += step) put(sheet, g, bx + tx * d, by + ty * d);
      }
    }
  }

  /** The mouse: a big "@" (小老鼠) with a swishing tail, drawn over everything. */
  private drawMouse(world: World, t: number) {
    const m = world.mouse;
    if (!m.present) return;
    const { ctx, dpr, cw, ch } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const dx = Math.cos(m.dir);
    const dy = Math.sin(m.dir);

    ctx.font = `700 ${Math.round(ch * 1.25)}px ${this.fontFamily}`;
    ctx.fillStyle = MOUSE_TAIL;
    let px = m.x - dx * ch * 0.95;
    let py = m.y - dy * ch * 0.95;
    for (let k = 0; k < 5; k++) {
      // Each link swings a little more than the one before it.
      const swing = Math.sin(t * 7 - k * 0.9) * (0.25 + k * 0.12);
      const lx = -(dx * Math.cos(swing) - dy * Math.sin(swing));
      const ly = -(dx * Math.sin(swing) + dy * Math.cos(swing));
      px += lx * cw * 1.05;
      py += ly * ch * 0.75;
      const horizontal = Math.abs(lx) > Math.abs(ly) * 1.4;
      const g = horizontal ? "~" : STEMS[Math.round((((Math.atan2(ly, lx) % Math.PI) + Math.PI) % Math.PI) / (Math.PI / 4)) % 4];
      ctx.fillText(k === 4 ? "'" : g, px, py);
    }

    ctx.font = `700 ${Math.max(18, Math.round(ch * 2.3))}px ${this.fontFamily}`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.background;
    ctx.strokeText("@", m.x, m.y);
    ctx.fillStyle = MOUSE_BODY;
    ctx.fillText("@", m.x, m.y);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
