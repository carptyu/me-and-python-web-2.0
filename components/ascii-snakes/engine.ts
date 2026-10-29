import { AsciiRenderer } from "./renderer";
import { World, type Ellipse, type SnakeSpec } from "./world";

const STEP = 1 / 60;
const MAX_STEPS = 4;
/** A tap: released quickly, without moving far (so starting a scroll doesn't count). */
const TAP_MS = 350;
const TAP_PX = 12;

export interface SnakeEngineOptions {
  /** Canvas background colour. Default black. */
  background?: string;
  /** Keep heads out of a centred ellipse so a headline stays readable. */
  avoidCenter?: boolean;
  /** Sparse leaf-litter glyphs on the ground. Default on. */
  litter?: boolean;
  /** Frame-rate cap. Default 60, or 30 on touch-first devices to spare the battery. */
  maxFps?: number;
}

/**
 * Wires World + AsciiRenderer to a canvas: fixed-timestep loop, resize,
 * pointer input, pausing off-screen, and prefers-reduced-motion.
 */
export class SnakeEngine {
  private world: World;
  private renderer: AsciiRenderer;
  private raf = 0;
  private last = 0;
  private lastDraw = 0;
  private minFrameMs: number;
  private acc = 0;
  private visible = true;
  private reducedMotion: MediaQueryList;
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private disposed = false;
  private down: { id: number; x: number; y: number; t: number } | null = null;
  private lastClient: { x: number; y: number; type: string; overUi: boolean } | null = null;

  constructor(private canvas: HTMLCanvasElement, snakes?: SnakeSpec[], options: SnakeEngineOptions = {}) {
    this.world = new World(snakes, { avoidCenter: options.avoidCenter });
    this.renderer = new AsciiRenderer(canvas, { background: options.background, litter: options.litter });
    this.renderer.setFontFamily(getComputedStyle(canvas).fontFamily);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchFirst = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    this.minFrameMs = 1000 / (options.maxFps ?? (touchFirst ? 30 : 60)) - 2;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas);

    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    window.addEventListener("pointercancel", this.onPointerCancel, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);

    this.resize();
    // Canvas text can't trigger a webfont load; once the mono face is in, re-render the glyphs.
    document.fonts?.load(`600 16px ${getComputedStyle(canvas).fontFamily}`).then(() => {
      if (this.disposed) return;
      this.renderer.refreshGlyphs();
      if (this.reducedMotion.matches) this.drawStill();
    });
    this.schedule();
  }

  /** Swap the snakes on the ground (re-seeds the scene). */
  setSnakes(snakes?: SnakeSpec[]) {
    this.world.setSnakes(snakes);
    this.settle();
    if (this.reducedMotion.matches) this.drawStill();
  }

  setAvoidCenter(on: boolean) {
    this.world.avoidCenter = on;
  }

  /** Keep heads out of this ellipse (canvas px), e.g. measured around a headline. */
  setAvoid(zone: Ellipse | null) {
    this.world.avoid = zone;
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
    window.removeEventListener("scroll", this.onScroll);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fresh = this.world.width === 0;
    this.renderer.resize(rect.width, rect.height, dpr);
    this.world.resize(rect.width, rect.height);
    if (fresh) this.settle();
    if (this.reducedMotion.matches) this.drawStill();
  }

  /** Let the snakes crawl for a moment so the first frame doesn't look staged. */
  private settle() {
    for (let i = 0; i < 90; i++) this.world.step(STEP);
  }

  private schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (now - this.lastDraw < this.minFrameMs) return;
    this.lastDraw = now;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.world.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    this.renderer.render(this.world, dt);
  };

  /** Reduced motion: let the snakes settle, then show a single frame. */
  private drawStill() {
    if (this.world.time < 5) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    this.renderer.render(this.world, STEP);
  }

  private onMotionPreference = () => {
    if (this.reducedMotion.matches) {
      cancelAnimationFrame(this.raf);
      this.drawStill();
    } else {
      this.schedule();
    }
  };

  private toLocal(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    return { x, y, inside };
  }

  private updatePointer() {
    const c = this.lastClient;
    if (!c) return;
    const { x, y, inside } = this.toLocal(c.x, c.y);
    const p = this.world.pointer;
    p.x = x;
    p.y = y;
    // Touch has no hover, so it can't play the mouse; nor can a pointer resting on overlaid UI.
    p.active = inside && !c.overUi && c.type !== "touch";
  }

  private onPointerMove = (e: PointerEvent) => {
    const overUi = !!(e.target as Element | null)?.closest?.("[data-snake-ignore]");
    this.lastClient = { x: e.clientX, y: e.clientY, type: e.pointerType, overUi };
    this.updatePointer();
  };

  /** The page scrolled under a still pointer: it now sits somewhere else on the canvas. */
  private onScroll = () => this.updatePointer();

  private onPointerDown = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.("[data-snake-ignore]")) return;
    this.down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
  };

  private onPointerUp = (e: PointerEvent) => {
    const d = this.down;
    this.down = null;
    if (!d || d.id !== e.pointerId || this.reducedMotion.matches) return;
    if (performance.now() - d.t > TAP_MS || Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_PX) return;
    const { x, y, inside } = this.toLocal(e.clientX, e.clientY);
    if (inside) this.world.tap(x, y, e.pointerType !== "mouse");
  };

  private onPointerCancel = () => {
    this.down = null;
  };

  private onPointerLeave = () => {
    this.world.pointer.active = false;
    this.lastClient = null;
  };
}
