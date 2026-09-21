<script lang="ts">
  import type { Win } from '../../lib/os/windows';
  import { MIN_W, MIN_H } from '../../lib/os/windows';
  import type { Snippet } from 'svelte';

  type Props = {
    win: Win;
    active: boolean;
    children: Snippet;
    onclose: () => void;
    onminimize: () => void;
    onfullscreen: () => void;
    onfocus: () => void;
    onmove: (x: number, y: number) => void;
    onresize: (x: number, y: number, w: number, h: number) => void;
    reducedMotion?: boolean;
    onmounted?: (el: HTMLElement) => void;
    onunmounted?: () => void;
  };

  let {
    win,
    active,
    children,
    onclose,
    onminimize,
    onfullscreen,
    onfocus,
    onmove,
    onresize,
    reducedMotion = false,
    onmounted,
    onunmounted,
  }: Props = $props();

  let rootEl: HTMLElement | null = null;

  // Action: focus the window root on mount (brings keyboard focus into the window),
  // and call register/unregister so Desktop can track DOM elements for focus return.
  function windowMount(node: HTMLElement) {
    rootEl = node;
    node.focus();
    onmounted?.(node);
    return {
      destroy() {
        rootEl = null;
        onunmounted?.();
      },
    };
  }

  // Drag state
  let dragging = $state(false);
  let dx = 0; // pointer offset from window x
  let dy = 0; // pointer offset from window y

  function onTitlePointerDown(e: PointerEvent) {
    if (win.fullscreen) return;
    // Don't start a drag from a button (traffic lights)
    if ((e.target as HTMLElement).closest('button')) return;
    dragging = true;
    dx = e.clientX - win.x;
    dy = e.clientY - win.y;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onTitlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    const nx = e.clientX - dx;
    // Clamp so the title bar can't slide under the 24px menu bar.
    const ny = Math.max(24, e.clientY - dy);
    onmove(nx, ny);
  }

  function onTitlePointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // onpointerdown anywhere focuses the window (before drag logic on the bar).
  function onWindowPointerDown() {
    onfocus();
  }

  // ---- Fullscreen geometry animation ----
  // The window's rect is always inline styles; toggling fullscreen swaps the
  // target rect, and this flag turns on a CSS transition just for the flight.
  let animatingGeom = $state(false);
  let prevFullscreen = win.fullscreen;
  $effect(() => {
    if (win.fullscreen === prevFullscreen) return;
    prevFullscreen = win.fullscreen;
    if (reducedMotion) return;
    animatingGeom = true;
    const t = setTimeout(() => (animatingGeom = false), 420);
    return () => clearTimeout(t);
  });

  // ---- Minimize animation ----
  // Fly the window toward the dock (bottom center), then commit the minimize.
  let minimizing = $state(false);
  let minDx = $state(0);
  let minDy = $state(0);

  function requestMinimize() {
    if (minimizing) return;
    if (reducedMotion) {
      onminimize();
      return;
    }
    const rect = rootEl?.getBoundingClientRect();
    if (rect) {
      minDx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      minDy = window.innerHeight - (rect.top + rect.height / 2);
    }
    minimizing = true;
    setTimeout(() => {
      minimizing = false;
      onminimize();
    }, 330);
  }

  // ---- Resize (Apple style: corners and edges reshape the window) ----
  type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  const RESIZE_DIRS: ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  let rs: {
    dir: ResizeDir;
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null = null;

  function startResize(e: PointerEvent, dir: ResizeDir) {
    onfocus();
    rs = { dir, px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function moveResize(e: PointerEvent) {
    if (!rs) return;
    const ddx = e.clientX - rs.px;
    const ddy = e.clientY - rs.py;
    let { x, y, w, h } = rs;
    if (rs.dir.includes('e')) w = rs.w + ddx;
    if (rs.dir.includes('s')) h = rs.h + ddy;
    if (rs.dir.includes('w')) {
      w = rs.w - ddx;
      x = rs.x + ddx;
    }
    if (rs.dir.includes('n')) {
      h = rs.h - ddy;
      y = rs.y + ddy;
    }
    // Anchor the opposite edge when hitting the minimum size.
    if (w < MIN_W) {
      if (rs.dir.includes('w')) x = rs.x + rs.w - MIN_W;
      w = MIN_W;
    }
    if (h < MIN_H) {
      if (rs.dir.includes('n')) y = rs.y + rs.h - MIN_H;
      h = MIN_H;
    }
    // Don't let a north drag push the title bar under the menu bar.
    if (y < 24) {
      h -= 24 - y;
      y = 24;
    }
    onresize(x, y, w, h);
  }

  function endResize(e: PointerEvent) {
    if (!rs) return;
    rs = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }
</script>

{#if !win.minimized}
  <!-- Use div (no implicit role) so role="dialog" can be applied freely without
       a Svelte a11y warning. Dialog is an interactive ARIA landmark; this also
       legitimately resolves any a11y_no_static_element_interactions warning.
       aria-modal="false": windows are deliberately non-modal — the desktop
       metaphor allows multiple simultaneous windows without trapping focus. -->
  <div
    class="window"
    class:active
    class:fullscreen={win.fullscreen}
    class:animate-geom={animatingGeom}
    class:minimizing
    style:left={win.fullscreen ? '0px' : `${win.x}px`}
    style:top={win.fullscreen ? '24px' : `${win.y}px`}
    style:width={win.fullscreen ? '100%' : `${win.w}px`}
    style:height={win.fullscreen ? 'calc(100% - 24px)' : `${win.h}px`}
    style:z-index={win.z}
    style:--min-dx={`${minDx}px`}
    style:--min-dy={`${minDy}px`}
    role="dialog"
    aria-modal="false"
    aria-label={win.title}
    tabindex="-1"
    onpointerdown={onWindowPointerDown}
    use:windowMount
  >
    <!-- role="none" suppresses the implicit <header> landmark role so Svelte's
         a11y lint does not warn about pointer/dblclick handlers on a static
         element. If the compiler warns with role="none", revert to role="group". -->
    <header
      class="titlebar"
      role="none"
      onpointerdown={onTitlePointerDown}
      onpointermove={onTitlePointerMove}
      onpointerup={onTitlePointerUp}
      onpointercancel={onTitlePointerUp}
      ondblclick={() => onfullscreen()}
    >
      <div class="lights">
        <button
          class="light close"
          aria-label="Close"
          title="Close"
          onclick={(e) => {
            e.stopPropagation();
            onclose();
          }}><span class="glyph">×</span></button>
        <button
          class="light min"
          aria-label="Minimize"
          title="Minimize"
          onclick={(e) => {
            e.stopPropagation();
            requestMinimize();
          }}><span class="glyph">−</span></button>
        <button
          class="light zoom"
          aria-label="Enter full screen"
          title="Enter full screen"
          onclick={(e) => {
            e.stopPropagation();
            onfullscreen();
          }}><span class="glyph">⤢</span></button>
      </div>
      <div class="title">{win.title}</div>
    </header>

    <div class="body">
      {@render children()}
    </div>

    {#if !win.fullscreen}
      {#each RESIZE_DIRS as dir (dir)}
        <div
          class={`rh rh-${dir}`}
          aria-hidden="true"
          onpointerdown={(e) => startResize(e, dir)}
          onpointermove={moveResize}
          onpointerup={endResize}
          onpointercancel={endResize}
        ></div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .window {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--win-bg);
    border-radius: var(--radius-win);
    border: 0.5px solid var(--win-border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    overflow: hidden;
    /* Windows receive programmatic focus for Esc handling — suppress visible outline
       on the window root itself (focus is not keyboard-initiated here). */
    outline: none;
  }

  .window.active {
    box-shadow: var(--shadow-win);
  }

  .window.fullscreen {
    border-radius: 0;
    border-width: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .window {
      animation: window-open 140ms ease-out;
    }

    /* Fullscreen flight: transition the rect only while toggling (drag/resize
       stay instant). Curve approximates macOS window motion. */
    .window.animate-geom {
      transition:
        left 380ms cubic-bezier(0.32, 0.72, 0, 1),
        top 380ms cubic-bezier(0.32, 0.72, 0, 1),
        width 380ms cubic-bezier(0.32, 0.72, 0, 1),
        height 380ms cubic-bezier(0.32, 0.72, 0, 1),
        border-radius 380ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    /* Minimize flight: shrink and fall toward the dock, then commit. */
    .window.minimizing {
      animation: window-minimize 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
      pointer-events: none;
    }
  }

  @keyframes window-open {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes window-minimize {
    to {
      transform: translate(var(--min-dx), var(--min-dy)) scale(0.08);
      opacity: 0;
    }
  }

  .titlebar {
    position: relative;
    flex: 0 0 var(--titlebar-h);
    height: var(--titlebar-h);
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 0.5px solid var(--hairline);
    background: var(--titlebar-bg);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  .lights {
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1;
  }

  .light {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.5px solid rgba(0, 0, 0, 0.12);
    line-height: 0;
  }

  .light.close {
    background: #ff5f57;
  }
  .light.min {
    background: #febc2e;
  }
  .light.zoom {
    background: #28c840;
  }

  .glyph {
    font-size: 8px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.55);
    opacity: 0;
    line-height: 1;
    transition: opacity 80ms ease;
  }

  .lights:hover .glyph {
    opacity: 1;
  }

  .title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-family: var(--chrome-font);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 72px;
  }

  .window:not(.active) .title {
    opacity: 0.55;
  }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  /* ---- Resize handles: invisible strips just inside the window edges ---- */
  .rh {
    position: absolute;
    z-index: 5;
    touch-action: none;
  }

  .rh-n {
    top: 0;
    left: 12px;
    right: 12px;
    height: 5px;
    cursor: ns-resize;
  }
  .rh-s {
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 6px;
    cursor: ns-resize;
  }
  .rh-e {
    top: 12px;
    bottom: 12px;
    right: 0;
    width: 6px;
    cursor: ew-resize;
  }
  .rh-w {
    top: 12px;
    bottom: 12px;
    left: 0;
    width: 6px;
    cursor: ew-resize;
  }
  .rh-ne {
    top: 0;
    right: 0;
    width: 13px;
    height: 13px;
    cursor: nesw-resize;
  }
  .rh-nw {
    top: 0;
    left: 0;
    width: 13px;
    height: 13px;
    cursor: nwse-resize;
  }
  .rh-se {
    bottom: 0;
    right: 0;
    width: 13px;
    height: 13px;
    cursor: nwse-resize;
  }
  .rh-sw {
    bottom: 0;
    left: 0;
    width: 13px;
    height: 13px;
    cursor: nesw-resize;
  }
</style>
