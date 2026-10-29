/**
 * Ball pythons on the forest floor, and the mouse they hunt.
 *
 * Locomotion: lateral undulation. The head swings left and right around a
 * slowly wandering base heading, and every point of the body follows the exact
 * track the head laid down, the way a real snake travels along its own path.
 * The spine is sampled from a ring buffer of past head positions.
 *
 * The mouse is drawn as an "@" (Taiwanese 小老鼠). On a desktop it is the pointer;
 * on a touch screen, tapping bare ground lets one loose to scurry about on its own.
 * It is warm, and ball pythons see warmth with the pits along their lips.
 *
 * Behaviour:
 *   cruise   – wander, with the occasional pause to rest and taste the air
 *   curious  – the mouse is close: crawl up to it, stop, and keep tasting the air
 *   strike   – stared long enough: lunge. A hit means a meal, and the lump of it
 *              travels down the body while the snake rests
 *   balling  – touched: the head spirals inward and the body coils behind it,
 *              each loop resting partly on the one outside it
 *   tucking  – the head slides under the coils and out of sight
 *   balled   – waiting it out
 *   emerging – the head works its way out from under the coils and the body unwinds
 */
import { angleDiff, clamp, rand, TAU } from "./math";
import { BODY_HALF_WIDTH, bodyHalfWidth, MORPH_IDS, MORPHS, type MorphId } from "./morphs";

export const SNAKE_NODES = 80;
const PATH_PER_SEG = 2;
const PATH_CAP = (SNAKE_NODES - 1) * PATH_PER_SEG + 12;

/** Which snakes to put out; size is relative to the biggest. */
export type SnakeSpec = { morph: MorphId; size: number };

type Mode = "cruise" | "rest" | "curious" | "strike" | "balling" | "tucking" | "balled" | "emerging";

/** Coiled loops sit closer than a body width, so they stack like a real ball. */
const coilSpacing = (L: number) => 2 * BODY_HALF_WIDTH * L * 0.72;
const coilInner = (L: number) => coilSpacing(L) * 0.55;

export interface Snake {
  id: number;
  morph: MorphId;
  length: number;
  /** Render spine, snout first: [x0, y0, x1, y1, ...], evenly spaced. */
  nodes: Float32Array;
  /** Ring buffer of past head positions. */
  path: Float32Array;
  pathHead: number;
  pathCount: number;
  /** Travel direction this instant, including the swing. */
  heading: number;
  /** Heading the swing oscillates around. */
  base: number;
  speed: number;
  cruise: number;
  /** Undulation phase and amplitude (rad). */
  phase: number;
  wiggle: number;
  wander: number;
  /** Smoothed turning rate (rad/s). */
  turn: number;
  mode: Mode;
  modeUntil: number;
  coilR: number;
  coilDir: 1 | -1;
  coilLeft: number;
  emergeLeft: number;
  /** Head drawn beneath the rest of the body (hidden under the coils). */
  tuck: boolean;
  tuckLeft: number;
  /** Curious and close enough: stopped, watching the mouse. */
  watching: boolean;
  watchTime: number;
  strikeAt: number;
  strikeLeft: number;
  /** Just ate: not interested in mice until then. */
  fullUntil: number;
  /** Position (s) of a swallowed mouse on its way down, or 0. */
  bulge: number;
  /** Tongue flick progress 0 → 1, or -1 while it's in. */
  tongue: number;
  nextFlick: number;
  /** 0 far / dim → 1 near / bright. */
  depth: number;
}

export interface Mouse {
  x: number;
  y: number;
  /** Direction it last ran in; the tail trails the other way. */
  dir: number;
  /** On the ground and catchable. */
  present: boolean;
  /** Pointer mouse: hidden after being eaten, until it "respawns". */
  hiddenUntil: number;
  /** A loose mouse (touch screens) that moves by itself. */
  wild: boolean;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  dashUntil: number;
  nextDash: number;
  leaveAt: number;
  leaving: boolean;
}

/** Soft no-go zone for heads, e.g. around a headline. */
export interface Ellipse {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface WorldEvent {
  kind: "ripple" | "catch" | "pop";
  x: number;
  y: number;
}

export interface WorldOptions {
  /** Keep heads out of a centred ellipse, so a headline stays readable. */
  avoidCenter?: boolean;
}

const DEFAULT_ROSTER: MorphId[] = ["banana", "piebald", "normal", "clown", "albino"];

export function defaultSnakes(count: number): SnakeSpec[] {
  return DEFAULT_ROSTER.slice(0, count).map((morph, i) => ({ morph, size: 1 - i * 0.07 }));
}

export class World {
  width = 0;
  height = 0;
  time = 0;
  snakes: Snake[] = [];
  events: WorldEvent[] = [];
  pointer = { x: 0, y: 0, active: false };
  mouse: Mouse = {
    x: 0, y: 0, dir: 0, present: false, hiddenUntil: 0,
    wild: false, homeX: 0, homeY: 0, vx: 0, vy: 0, dashUntil: 0, nextDash: 0, leaveAt: 0, leaving: false,
  };
  avoidCenter: boolean;
  /** Explicit no-go zone; overrides avoidCenter. */
  avoid: Ellipse | null = null;

  constructor(private specs?: SnakeSpec[], options: WorldOptions = {}) {
    this.avoidCenter = options.avoidCenter ?? false;
  }

  resize(width: number, height: number) {
    const first = this.width === 0;
    this.width = width;
    this.height = height;
    if (first || this.snakes.length === 0) this.seed();
  }

  setSnakes(specs?: SnakeSpec[]) {
    this.specs = specs;
    if (this.width > 0) this.seed();
  }

  seed() {
    const { width: W, height: H } = this;
    const area = Math.sqrt(W * H);
    // On a narrow (phone) screen, keep them shorter than the screen is wide so two have room to pass.
    const baseLength = Math.min(clamp(area * 0.76, 280, 1200), W * 0.82);
    const specs = this.specs ?? defaultSnakes(clamp(Math.round((W * H) / 650000), 2, 4));

    this.snakes = specs.map((spec, i) => {
      const length = baseLength * spec.size;
      // Spread the heads out over the screen.
      const a = (i / specs.length) * TAU + rand(-0.5, 0.5);
      const hx = W / 2 + Math.cos(a) * W * 0.3;
      const hy = H / 2 + Math.sin(a) * H * 0.28;
      const heading = a + Math.PI / 2 + rand(-0.6, 0.6);
      const sh: Snake = {
        id: i + 1,
        morph: MORPHS[spec.morph] ? spec.morph : MORPH_IDS[i % MORPH_IDS.length],
        length,
        nodes: new Float32Array(SNAKE_NODES * 2),
        path: new Float32Array(PATH_CAP * 2),
        pathHead: 0,
        pathCount: 0,
        heading,
        base: heading,
        speed: 0,
        cruise: 24 + length * 0.042,
        phase: rand(0, TAU),
        wiggle: 0.5,
        wander: 0,
        turn: 0,
        mode: "cruise",
        modeUntil: rand(4, 12),
        coilR: 0,
        coilDir: 1,
        coilLeft: 0,
        emergeLeft: 0,
        tuck: false,
        tuckLeft: 0,
        watching: false,
        watchTime: 0,
        strikeAt: 0,
        strikeLeft: 0,
        fullUntil: 0,
        bulge: 0,
        tongue: -1,
        nextFlick: rand(0.5, 3),
        depth: spec.size,
      };
      this.layTrail(sh, hx, hy);
      return sh;
    });
    // Smaller (farther) snakes draw first so the big one crawls over them.
    this.snakes.sort((p, q) => p.length - q.length);
  }

  /** Pre-fill the path with a gentle S-curve behind the head. */
  private layTrail(sh: Snake, hx: number, hy: number) {
    const spacing = sh.length / (SNAKE_NODES - 1) / PATH_PER_SEG;
    const dx = Math.cos(sh.heading);
    const dy = Math.sin(sh.heading);
    const wave = sh.length * 0.4;
    for (let j = 0; j < PATH_CAP; j++) {
      const along = (j + 1) * spacing;
      const off = sh.length * 0.04 * Math.sin((along / wave) * TAU + sh.phase);
      const idx = (PATH_CAP - j) % PATH_CAP;
      sh.path[idx * 2] = hx - dx * along - dy * off;
      sh.path[idx * 2 + 1] = hy - dy * along + dx * off;
    }
    sh.pathHead = 0;
    sh.pathCount = PATH_CAP;
    sh.nodes[0] = hx;
    sh.nodes[1] = hy;
    this.layout(sh);
  }

  /**
   * A tap. Only a snake that is actually touched balls up. On a touch screen a tap
   * on bare ground lets a mouse loose there; with a mouse it does nothing (the
   * pointer already is the mouse).
   */
  tap(x: number, y: number, touch: boolean) {
    // A fingertip is less exact than a cursor, so it gets a little more slack.
    const hit = this.snakeAt(x, y, touch ? 10 : 3);
    if (hit) {
      this.touch(hit, x, y);
      return;
    }
    if (!touch) return;
    const m = this.mouse;
    m.wild = true;
    m.present = true;
    m.hiddenUntil = 0;
    m.x = m.homeX = x;
    m.y = m.homeY = y;
    m.vx = m.vy = 0;
    m.dashUntil = 0;
    m.nextDash = this.time + 0.5;
    m.leaveAt = this.time + 20;
    m.leaving = false;
    this.events.push({ kind: "pop", x, y });
  }

  /** The topmost snake whose body outline is under (x, y), give or take `slack` px. */
  private snakeAt(x: number, y: number, slack: number): Snake | null {
    const N = SNAKE_NODES;
    // Later snakes are drawn on top, so they get first claim on the touch.
    for (let i = this.snakes.length - 1; i >= 0; i--) {
      const sh = this.snakes[i];
      const n = sh.nodes;
      for (let k = 0; k < N - 1; k++) {
        const ax = n[k * 2];
        const ay = n[k * 2 + 1];
        const sx = n[(k + 1) * 2] - ax;
        const sy = n[(k + 1) * 2 + 1] - ay;
        const u = clamp(((x - ax) * sx + (y - ay) * sy) / (sx * sx + sy * sy || 1e-6), 0, 1);
        const d = Math.hypot(x - ax - sx * u, y - ay - sy * u);
        if (d <= bodyHalfWidth((k + u) / (N - 1)) * sh.length + slack) return sh;
      }
    }
    return null;
  }

  /** Touched: curl up into a ball (unless it already is one). */
  private touch(sh: Snake, x: number, y: number) {
    if (sh.mode === "balling" || sh.mode === "tucking" || sh.mode === "balled") return;
    this.events.push({ kind: "ripple", x, y });
    this.startBalling(sh);
  }

  private startBalling(sh: Snake) {
    const L = sh.length;
    const spacing = coilSpacing(L);
    const rMin = coilInner(L);
    const r0 = Math.sqrt((0.86 * L * spacing) / Math.PI + rMin * rMin);
    // Curl the way the head is already swinging, unless that coil would land off-screen.
    let dir: 1 | -1 = sh.turn + sh.wiggle * Math.cos(sh.phase) >= 0 ? 1 : -1;
    const fits = (d: number) => {
      const cx = sh.nodes[0] - Math.sin(sh.heading) * r0 * d;
      const cy = sh.nodes[1] + Math.cos(sh.heading) * r0 * d;
      return Math.min(cx - r0, this.width - cx - r0, cy - r0, this.height - cy - r0);
    };
    if (fits(-dir) > fits(dir) + 40) dir = dir > 0 ? -1 : 1;
    sh.mode = "balling";
    sh.coilDir = dir;
    sh.coilR = r0;
    sh.coilLeft = 0.86 * L;
    sh.tuck = false;
    sh.watching = false;
    sh.tongue = -1;
  }

  step(dt: number) {
    this.time += dt;
    this.stepMouse(dt);
    this.pickHunter();
    for (const sh of this.snakes) this.stepSnake(sh, dt);
  }

  /** Only the nearest hungry snake goes for the mouse, so two never pile onto the same spot. */
  private hunter: Snake | null = null;
  private pickHunter() {
    const m = this.mouse;
    const keep = this.hunter;
    // Whoever is already stalking or striking keeps the claim.
    if (keep && m.present && (keep.mode === "curious" || keep.mode === "strike")) return;
    this.hunter = null;
    if (!m.present) return;
    let best = Infinity;
    for (const sh of this.snakes) {
      if (this.time <= sh.fullUntil || sh.mode === "balling" || sh.mode === "tucking" || sh.mode === "balled") continue;
      const d = Math.hypot(sh.nodes[0] - m.x, sh.nodes[1] - m.y);
      if (d < best) {
        best = d;
        this.hunter = sh;
      }
    }
  }

  private stepMouse(dt: number) {
    const { pointer: p, mouse: m, time } = this;
    if (!p.active) {
      m.present = m.wild;
      if (m.wild) this.stepWildMouse(m, dt);
      return;
    }
    // A real pointer takes over from any loose mouse.
    m.wild = false;
    const was = m.present;
    m.present = time >= m.hiddenUntil;
    if (!m.present) return;
    if (!was) {
      // Back from being eaten (or the pointer just came in).
      if (m.hiddenUntil > 0 && time - m.hiddenUntil < 0.2) this.events.push({ kind: "pop", x: p.x, y: p.y });
    } else {
      const dx = p.x - m.x;
      const dy = p.y - m.y;
      if (dx * dx + dy * dy > 2) m.dir += angleDiff(m.dir, Math.atan2(dy, dx)) * Math.min(1, dt * 12);
    }
    m.x = p.x;
    m.y = p.y;
  }

  /** Short dashes and pauses around where it was let go; after a while it runs off. */
  private stepWildMouse(m: Mouse, dt: number) {
    const { time, width: W, height: H } = this;
    if (time > m.leaveAt) m.leaving = true;
    if (time >= m.nextDash) {
      let ang: number;
      if (m.leaving) {
        const edges = [m.x, W - m.x, m.y, H - m.y];
        ang = [Math.PI, 0, -Math.PI / 2, Math.PI / 2][edges.indexOf(Math.min(...edges))];
      } else {
        const hx = m.homeX - m.x;
        const hy = m.homeY - m.y;
        ang = Math.hypot(hx, hy) > 80 ? Math.atan2(hy, hx) + rand(-0.8, 0.8) : rand(0, TAU);
      }
      const speed = m.leaving ? 260 : rand(90, 160);
      m.vx = Math.cos(ang) * speed;
      m.vy = Math.sin(ang) * speed;
      m.dashUntil = time + (m.leaving ? 4 : rand(0.15, 0.4));
      m.nextDash = m.dashUntil + (m.leaving ? 0 : rand(0.6, 1.9));
    }
    if (time < m.dashUntil) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.dir += angleDiff(m.dir, Math.atan2(m.vy, m.vx)) * Math.min(1, dt * 20);
    }
    if (!m.leaving) {
      m.x = clamp(m.x, 16, W - 16);
      m.y = clamp(m.y, 16, H - 16);
    } else if (m.x < -40 || m.y < -40 || m.x > W + 40 || m.y > H + 40) {
      m.wild = false;
      m.present = false;
    }
  }

  private stepSnake(sh: Snake, dt: number) {
    const { width: W, height: H, time, mouse } = this;
    const L = sh.length;
    const hx = sh.nodes[0];
    const hy = sh.nodes[1];
    const minSide = Math.min(W, H);

    if (sh.bulge > 0) {
      sh.bulge += dt * 0.075;
      if (sh.bulge > 0.62) sh.bulge = 0;
    }

    // ── mode transitions ──
    const senseR = L * 0.3 + 120;
    const pd = mouse.present ? Math.hypot(mouse.x - hx, mouse.y - hy) : Infinity;
    if (sh.mode === "cruise" || sh.mode === "rest") {
      // A snake lying still is an obstacle the other can't always steer round in time,
      // so don't settle down next to another snake, and get moving if one comes close.
      const crowded = this.nearOther(sh, 2.2);
      if (pd < senseR && time > sh.fullUntil && sh === this.hunter) sh.mode = "curious";
      else if (sh.mode === "rest" && crowded && time > sh.fullUntil - 8) {
        sh.mode = "cruise";
        sh.modeUntil = time + rand(6, 12);
      } else if (time > sh.modeUntil) {
        if (sh.mode === "cruise" && crowded) sh.modeUntil = time + 2;
        else if (sh.mode === "cruise") {
          sh.mode = "rest";
          sh.modeUntil = time + rand(2.5, 6);
        } else {
          sh.mode = "cruise";
          sh.modeUntil = time + rand(8, 18);
        }
      }
    } else if (sh.mode === "curious") {
      if (pd > senseR * 1.35 || sh !== this.hunter) {
        sh.mode = "cruise";
        sh.watching = false;
        sh.modeUntil = time + rand(6, 14);
      }
    } else if (sh.mode === "balled" && time > sh.modeUntil) {
      sh.mode = "emerging";
      sh.emergeLeft = L * 0.45;
      sh.base = sh.heading;
      sh.wiggle = 0;
      sh.nextFlick = time + 0.4;
    }

    // ── speed & swing targets ──
    let targetSpeed = sh.cruise;
    let targetWiggle = 0.5;
    let flickGap: [number, number] = [1.6, 4.2];
    switch (sh.mode) {
      case "rest":
        targetSpeed = 0;
        break;
      case "curious": {
        // Crawl up to the mouse, then hold still facing it and keep tasting the air.
        // A mouse behind or beside the head means circling round to face it first.
        const facing = ((mouse.x - hx) * Math.cos(sh.base) + (mouse.y - hy) * Math.sin(sh.base)) / (pd || 1);
        const stopR = L * 0.1 + 40;
        if (!sh.watching && pd < stopR && facing > 0.35) {
          sh.watching = true;
          sh.watchTime = 0;
          sh.strikeAt = mouse.wild ? rand(0.5, 1.2) : rand(1.6, 3.6);
        } else if (pd > stopR * 1.6 || facing < 0) sh.watching = false;
        if (sh.watching) {
          sh.watchTime += dt;
          if (sh.watchTime > sh.strikeAt && facing > 0.7) {
            this.startStrike(sh, pd);
            break;
          }
        }
        targetSpeed = sh.watching ? 0 : sh.cruise * (pd < stopR * 1.6 ? 0.35 : 0.62);
        targetWiggle = 0.3;
        flickGap = sh.watching ? [0.25, 0.6] : [0.4, 1];
        break;
      }
      case "balling":
        targetSpeed = L * 0.26;
        targetWiggle = 0;
        break;
      case "tucking":
        targetSpeed = L * 0.1;
        targetWiggle = 0;
        break;
      case "balled":
        targetSpeed = 0;
        targetWiggle = 0;
        break;
      case "emerging":
        targetSpeed = sh.cruise * 0.45;
        targetWiggle = 0.22;
        flickGap = [0.5, 1.2];
        break;
    }
    if (sh.mode !== "strike") {
      const accel = sh.mode === "balling" ? 5 : sh.mode === "balled" || sh.mode === "tucking" ? 6 : 1.4;
      sh.speed += (targetSpeed - sh.speed) * Math.min(1, dt * accel);
      sh.wiggle += (targetWiggle - sh.wiggle) * Math.min(1, dt * 1.2);
    }

    // ── steering ──
    const before = sh.heading;
    if (sh.mode === "strike") {
      // Straight at it, too fast to steer.
      sh.strikeLeft -= sh.speed * dt;
    } else if (sh.mode === "balling") {
      // Inward spiral: each turn sits one body-width inside the last.
      const spacing = coilSpacing(L);
      const rMin = coilInner(L);
      const ds = sh.speed * dt;
      sh.heading += (ds / sh.coilR) * sh.coilDir;
      sh.coilR = Math.max(rMin, sh.coilR - (ds * spacing) / (TAU * sh.coilR));
      sh.coilLeft -= ds;
      sh.base = sh.heading;
      if (sh.coilLeft <= 0 || sh.coilR <= rMin + 0.5) {
        // Finish by slipping the head under the innermost loop.
        sh.mode = "tucking";
        sh.tuck = true;
        sh.tuckLeft = L * 0.12;
      }
    } else if (sh.mode === "tucking") {
      const ds = sh.speed * dt;
      sh.heading += (ds / (sh.coilR * 2.2)) * sh.coilDir;
      sh.base = sh.heading;
      sh.tuckLeft -= ds;
      if (sh.tuckLeft <= 0) {
        sh.mode = "balled";
        sh.modeUntil = time + rand(3.5, 6.5);
      }
    } else if (sh.mode !== "balled") {
      let dx = Math.cos(sh.base);
      let dy = Math.sin(sh.base);

      sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 2.4, -0.9, 0.9);
      dx += Math.cos(sh.base + sh.wander) * 0.5;
      dy += Math.sin(sh.base + sh.wander) * 0.5;

      if (sh.mode === "curious" && pd < Infinity) {
        // Heat pits: home in on the warm mouse.
        const w = 2.6 * Math.sqrt(clamp(1 - pd / senseR, 0, 1)) + 0.6;
        dx += ((mouse.x - hx) / (pd || 1)) * w;
        dy += ((mouse.y - hy) / (pd || 1)) * w;
      }

      // Give other snakes room. A snake can't pivot on the spot, so it feels ahead with three
      // whiskers and starts turning while there is still room; the nearest whisker counts most.
      const fx = Math.cos(sh.base);
      const fy = Math.sin(sh.base);
      for (const other of this.snakes) {
        if (other === sh) continue;
        const clear = (L + other.length) * BODY_HALF_WIDTH * 1.35 + 28;
        for (let w = 0; w < 4; w++) {
          const ahead = L * w * 0.1;
          const px = hx + fx * ahead;
          const py = hy + fy * ahead;
          let best = Infinity;
          let ox = 0;
          let oy = 0;
          for (let k = 0; k < SNAKE_NODES; k += 2) {
            const ex = px - other.nodes[k * 2];
            const ey = py - other.nodes[k * 2 + 1];
            const d2 = ex * ex + ey * ey;
            if (d2 < best) {
              best = d2;
              ox = ex;
              oy = ey;
            }
          }
          const d = Math.sqrt(best);
          if (d >= clear || d < 1e-3) continue;
          const urgency = (1 - d / clear) * (4 - w) * 1.5;
          // Away from the body, plus a sideways nudge so a body dead ahead still means a turn, not a stall.
          const ax = ox / d;
          const ay = oy / d;
          const side = -fy * ax + fx * ay >= 0 ? 1 : -1;
          dx += (ax - fy * side * 0.8) * urgency;
          dy += (ay + fx * side * 0.8) * urgency;
        }
      }

      // Don't crawl over your own body (except when climbing out of a coil).
      if (sh.mode !== "emerging") {
        const range = L * BODY_HALF_WIDTH * 2.8;
        for (let k = Math.floor(SNAKE_NODES * 0.28); k < SNAKE_NODES; k += 3) {
          const ox = hx - sh.nodes[k * 2];
          const oy = hy - sh.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 1.6;
            dx += (ox / d) * w;
            dy += (oy / d) * w;
          }
        }
      }

      const zone = this.avoid ?? (this.avoidCenter ? { x: W / 2, y: H / 2, rx: W * 0.3, ry: H * 0.17 } : null);
      if (zone) {
        const ex = (hx - zone.x) / zone.rx;
        const ey = (hy - zone.y) / zone.ry;
        const e2 = ex * ex + ey * ey;
        if (e2 < 1.2) {
          const e = Math.sqrt(e2) || 1e-3;
          const w = (1.2 - e) * 2.2;
          dx += (ex / e) * w;
          dy += (ey / e) * w;
        }
      }

      // Turn back once the head nears the edge; bodies may trail off-screen.
      const margin = minSide * 0.06;
      const over = Math.max(-hx, hx - W, -hy, hy - H);
      if (over > -margin) {
        const w = clamp((over + margin) / (L * 0.25), 0, 1) * 3.5;
        const toX = W / 2 - hx;
        const toY = H / 2 - hy;
        const d = Math.hypot(toX, toY) || 1;
        dx += (toX / d) * w;
        dy += (toY / d) * w;
      }

      // Turning circle: the base heading can't bend tighter than ~0.15 L.
      const desired = Math.atan2(dy, dx);
      const maxTurn = (sh.speed / (L * 0.15)) * dt;
      sh.base += clamp(angleDiff(sh.base, desired), -maxTurn, maxTurn);

      // Lateral undulation: wavelength ~0.4 L, so 2–3 waves run down the body.
      sh.phase += (TAU * sh.speed * dt) / (L * 0.4);
      sh.heading = sh.base + sh.wiggle * Math.sin(sh.phase);

      if (sh.mode === "emerging") {
        sh.emergeLeft -= sh.speed * dt;
        // Out from under the coils: the head comes back on top.
        if (sh.emergeLeft < L * 0.17) sh.tuck = false;
        if (sh.emergeLeft <= 0) {
          sh.mode = "cruise";
          sh.modeUntil = time + rand(8, 16);
        }
      }
    }
    sh.turn += (angleDiff(before, sh.heading) / dt - sh.turn) * Math.min(1, dt * 3);

    // ── tongue ──
    if (sh.tongue >= 0) {
      sh.tongue += dt / 0.6;
      if (sh.tongue >= 1) sh.tongue = -1;
    } else if (time > sh.nextFlick && !sh.tuck && sh.mode !== "balling" && sh.mode !== "strike") {
      sh.tongue = 0;
      sh.nextFlick = time + rand(flickGap[0], flickGap[1]);
    }

    // ── move the head and lay track ──
    sh.nodes[0] += Math.cos(sh.heading) * sh.speed * dt;
    sh.nodes[1] += Math.sin(sh.heading) * sh.speed * dt;
    const spacing = L / (SNAKE_NODES - 1) / PATH_PER_SEG;
    const last = sh.pathHead * 2;
    if (Math.hypot(sh.nodes[0] - sh.path[last], sh.nodes[1] - sh.path[last + 1]) >= spacing) {
      sh.pathHead = (sh.pathHead + 1) % PATH_CAP;
      sh.path[sh.pathHead * 2] = sh.nodes[0];
      sh.path[sh.pathHead * 2 + 1] = sh.nodes[1];
      sh.pathCount = Math.min(PATH_CAP, sh.pathCount + 1);
    }
    this.layout(sh);

    if (sh.mode === "strike") this.resolveStrike(sh);
  }

  private startStrike(sh: Snake, pd: number) {
    const m = this.mouse;
    sh.mode = "strike";
    sh.watching = false;
    sh.strikeLeft = Math.min(pd + 14, sh.length * 0.22);
    sh.heading = sh.base = Math.atan2(m.y - sh.nodes[1], m.x - sh.nodes[0]);
    sh.wiggle = 0;
    sh.speed = sh.length * 1.4;
    sh.tongue = -1;
  }

  private resolveStrike(sh: Snake) {
    const m = this.mouse;
    const L = sh.length;
    if (m.present && Math.hypot(m.x - sh.nodes[0], m.y - sh.nodes[1]) < L * 0.03 + 12) {
      // Caught. The mouse is gone for a moment; the meal goes down as a lump.
      m.present = false;
      if (m.wild) m.wild = false;
      else m.hiddenUntil = this.time + 1.8;
      this.events.push({ kind: "catch", x: m.x, y: m.y });
      sh.mode = "rest";
      sh.modeUntil = this.time + rand(5, 7);
      sh.fullUntil = this.time + 14;
      sh.bulge = 0.05;
      sh.speed *= 0.08;
    } else if (sh.strikeLeft <= 0) {
      // Missed: freeze for a beat, then carry on.
      sh.mode = "rest";
      sh.modeUntil = this.time + rand(1, 2);
      sh.speed *= 0.12;
    }
  }

  /** Is another snake's head or body within `k` combined body-widths of this one's head? */
  private nearOther(sh: Snake, k: number) {
    const hx = sh.nodes[0];
    const hy = sh.nodes[1];
    for (const other of this.snakes) {
      if (other === sh) continue;
      const r = (sh.length + other.length) * BODY_HALF_WIDTH * k;
      for (let n = 0; n < SNAKE_NODES; n += 3) {
        if (Math.hypot(hx - other.nodes[n * 2], hy - other.nodes[n * 2 + 1]) < r) return true;
      }
      // Its head nearing my body counts too.
      for (let n = 0; n < SNAKE_NODES; n += 3) {
        if (Math.hypot(other.nodes[0] - sh.nodes[n * 2], other.nodes[1] - sh.nodes[n * 2 + 1]) < r) return true;
      }
    }
    return false;
  }

  /** Place the body nodes at even arc lengths back along the head's track. */
  private layout(sh: Snake) {
    const { nodes, path } = sh;
    const N = SNAKE_NODES;
    const seg = sh.length / (N - 1);
    let px = nodes[0];
    let py = nodes[1];
    let acc = 0;
    let k = 1;
    for (let j = 0; j < sh.pathCount && k < N; j++) {
      const idx = ((sh.pathHead - j) % PATH_CAP + PATH_CAP) % PATH_CAP;
      const qx = path[idx * 2];
      const qy = path[idx * 2 + 1];
      const d = Math.hypot(qx - px, qy - py);
      while (k < N && acc + d >= k * seg) {
        const t = d > 0 ? (k * seg - acc) / d : 0;
        nodes[k * 2] = px + (qx - px) * t;
        nodes[k * 2 + 1] = py + (qy - py) * t;
        k++;
      }
      acc += d;
      px = qx;
      py = qy;
    }
    // Track too short (only right after seeding): carry on straight.
    for (; k < N; k++) {
      nodes[k * 2] = nodes[(k - 1) * 2] - Math.cos(sh.heading) * seg;
      nodes[k * 2 + 1] = nodes[(k - 1) * 2 + 1] - Math.sin(sh.heading) * seg;
    }
  }
}
