import { describe, it, expect, beforeEach } from 'vitest';
import {
  open,
  close,
  focus,
  minimize,
  restore,
  toggleFullscreen,
  move,
  resize,
  MIN_W,
  MIN_H,
  topWindow,
  type Win,
  type OpenSpec,
} from './windows';

const VP = { vw: 1280, vh: 800 };

function makeSpec(overrides: Partial<OpenSpec> = {}): OpenSpec {
  return { app: 'finder', title: 'Test', ...overrides };
}

// Reset module-level counter between test suites by opening in isolation
// Each test starts from a fresh empty state.

describe('open', () => {
  it('appends a window to empty state', () => {
    const s0: Win[] = [];
    const s1 = open(s0, makeSpec(), VP);
    expect(s1).toHaveLength(1);
  });

  it('assigns unique incrementing ids', () => {
    const s0: Win[] = [];
    const s1 = open(s0, makeSpec(), VP);
    const s2 = open(s1, makeSpec(), VP);
    expect(s2[0].id).not.toBe(s2[1].id);
    expect(s2[1].id).toBeGreaterThan(s2[0].id);
  });

  it('assigns z = 1 for first window', () => {
    const s0: Win[] = [];
    const s1 = open(s0, makeSpec(), VP);
    expect(s1[0].z).toBe(1);
  });

  it('assigns z = max existing z + 1', () => {
    const s0: Win[] = [];
    const s1 = open(s0, makeSpec(), VP);
    const s2 = open(s1, makeSpec(), VP);
    expect(s2[1].z).toBe(s2[0].z + 1);
  });

  it('defaults size to 720×480', () => {
    const s1 = open([], makeSpec(), VP);
    expect(s1[0].w).toBe(720);
    expect(s1[0].h).toBe(480);
  });

  it('uses spec w/h when provided', () => {
    const s1 = open([], makeSpec({ w: 400, h: 300 }), VP);
    expect(s1[0].w).toBe(400);
    expect(s1[0].h).toBe(300);
  });

  it('sets minimized: false and fullscreen: false', () => {
    const s1 = open([], makeSpec(), VP);
    expect(s1[0].minimized).toBe(false);
    expect(s1[0].fullscreen).toBe(false);
  });

  it('defaults props to {}', () => {
    const s1 = open([], makeSpec(), VP);
    expect(s1[0].props).toEqual({});
  });

  it('uses provided props', () => {
    const s1 = open([], makeSpec({ props: { foo: 'bar' } }), VP);
    expect(s1[0].props).toEqual({ foo: 'bar' });
  });

  it('cascades position: first window at x=80, y=60', () => {
    const s1 = open([], makeSpec(), VP);
    expect(s1[0].x).toBe(80);
    expect(s1[0].y).toBe(60);
  });

  it('cascades +32 per existing window (k=0 -> 80,60; k=1 -> 112,92)', () => {
    const s1 = open([], makeSpec(), VP);
    const s2 = open(s1, makeSpec(), VP);
    expect(s2[1].x).toBe(80 + 32);
    expect(s2[1].y).toBe(60 + 32);
  });

  it('clamps x so window fits inside viewport', () => {
    const smallVP = { vw: 800, vh: 600 };
    // Open enough windows to push cascade past viewport edge
    let state: Win[] = [];
    for (let i = 0; i < 30; i++) {
      state = open(state, makeSpec({ w: 720, h: 480 }), smallVP);
    }
    for (const w of state) {
      expect(w.x).toBeGreaterThanOrEqual(0);
      expect(w.x).toBeLessThanOrEqual(smallVP.vw - w.w);
      expect(w.y).toBeGreaterThanOrEqual(24);
      expect(w.y).toBeLessThanOrEqual(smallVP.vh - w.h);
    }
  });

  it('path dedupe: focuses existing window instead of duplicating', () => {
    const s1 = open([], makeSpec({ path: '/foo' }), VP);
    const id = s1[0].id;
    const s2 = open(s1, makeSpec({ path: '/foo' }), VP);
    expect(s2).toHaveLength(1);
    expect(s2[0].id).toBe(id);
  });

  it('path dedupe: raises z when refocusing', () => {
    const s1 = open([], makeSpec({ path: '/foo' }), VP);
    const s2 = open(s1, makeSpec(), VP); // second unrelated window, higher z
    const prevZ = s2[0].z;
    const maxZ = s2[1].z;
    expect(maxZ).toBeGreaterThan(prevZ);
    const s3 = open(s2, makeSpec({ path: '/foo' }), VP); // re-focus /foo
    expect(s3).toHaveLength(2);
    const refocused = s3.find((w) => w.id === s2[0].id)!;
    expect(refocused.z).toBeGreaterThan(maxZ);
  });

  it('path dedupe: unminimizes minimized window', () => {
    const s1 = open([], makeSpec({ path: '/bar' }), VP);
    const s2 = minimize(s1, s1[0].id);
    expect(s2[0].minimized).toBe(true);
    const s3 = open(s2, makeSpec({ path: '/bar' }), VP);
    expect(s3[0].minimized).toBe(false);
  });

  it('does not mutate input state', () => {
    const s0: Win[] = [];
    open(s0, makeSpec(), VP);
    expect(s0).toHaveLength(0);
  });
});

describe('focus', () => {
  it('raises z above all others', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const target = state[0]; // lowest z
    const raised = focus(state, target.id);
    const maxZ = Math.max(...raised.map((w) => w.z));
    const raisedWin = raised.find((w) => w.id === target.id)!;
    expect(raisedWin.z).toBe(maxZ);
  });

  it('does not mutate input', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const snapshot = state.map((w) => ({ ...w }));
    focus(state, state[0].id);
    state.forEach((w, i) => expect(w.z).toBe(snapshot[i].z));
  });
});

describe('close', () => {
  it('removes the window by id', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const id = state[0].id;
    const next = close(state, id);
    expect(next).toHaveLength(1);
    expect(next.find((w) => w.id === id)).toBeUndefined();
  });

  it('does not mutate input', () => {
    const state = open([], makeSpec(), VP);
    const len = state.length;
    close(state, state[0].id);
    expect(state).toHaveLength(len);
  });
});

describe('minimize', () => {
  it('sets minimized flag', () => {
    const state = open([], makeSpec(), VP);
    const next = minimize(state, state[0].id);
    expect(next[0].minimized).toBe(true);
  });

  it('does not mutate input', () => {
    const state = open([], makeSpec(), VP);
    minimize(state, state[0].id);
    expect(state[0].minimized).toBe(false);
  });
});

describe('topWindow', () => {
  it('returns window with highest z', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const top = topWindow(state)!;
    const maxZ = Math.max(...state.map((w) => w.z));
    expect(top.z).toBe(maxZ);
  });

  it('returns null when state is empty', () => {
    expect(topWindow([])).toBeNull();
  });

  it('skips minimized windows', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const lastId = state[state.length - 1].id; // highest z
    state = minimize(state, lastId);
    const top = topWindow(state);
    expect(top?.id).not.toBe(lastId);
  });

  it('returns null if all windows are minimized', () => {
    let state = open([], makeSpec(), VP);
    state = minimize(state, state[0].id);
    expect(topWindow(state)).toBeNull();
  });
});

describe('restore', () => {
  it('clears minimized flag', () => {
    let state = open([], makeSpec(), VP);
    state = minimize(state, state[0].id);
    const next = restore(state, state[0].id);
    expect(next[0].minimized).toBe(false);
  });

  it('focuses (raises z) the window', () => {
    let state = open([], makeSpec(), VP);
    state = open(state, makeSpec(), VP);
    const id = state[0].id;
    state = minimize(state, id);
    const next = restore(state, id);
    const maxZ = Math.max(...next.map((w) => w.z));
    expect(next.find((w) => w.id === id)!.z).toBe(maxZ);
  });

  it('does not mutate input', () => {
    let state = open([], makeSpec(), VP);
    state = minimize(state, state[0].id);
    const snap = { ...state[0] };
    restore(state, state[0].id);
    expect(state[0].minimized).toBe(snap.minimized);
  });
});

describe('toggleFullscreen', () => {
  it('flips fullscreen from false to true', () => {
    const state = open([], makeSpec(), VP);
    const next = toggleFullscreen(state, state[0].id);
    expect(next[0].fullscreen).toBe(true);
  });

  it('flips fullscreen from true to false', () => {
    let state = open([], makeSpec(), VP);
    state = toggleFullscreen(state, state[0].id);
    const next = toggleFullscreen(state, state[0].id);
    expect(next[0].fullscreen).toBe(false);
  });

  it('does not mutate input', () => {
    const state = open([], makeSpec(), VP);
    toggleFullscreen(state, state[0].id);
    expect(state[0].fullscreen).toBe(false);
  });
});

describe('move', () => {
  it('updates x and y', () => {
    const state = open([], makeSpec(), VP);
    const next = move(state, state[0].id, 200, 300);
    expect(next[0].x).toBe(200);
    expect(next[0].y).toBe(300);
  });

  it('does not change other properties', () => {
    const state = open([], makeSpec(), VP);
    const orig = state[0];
    const next = move(state, orig.id, 200, 300);
    const w = next[0];
    expect(w.w).toBe(orig.w);
    expect(w.h).toBe(orig.h);
    expect(w.z).toBe(orig.z);
    expect(w.minimized).toBe(orig.minimized);
    expect(w.fullscreen).toBe(orig.fullscreen);
  });

  it('does not mutate input', () => {
    const state = open([], makeSpec(), VP);
    const origX = state[0].x;
    move(state, state[0].id, 999, 999);
    expect(state[0].x).toBe(origX);
  });
});

describe('resize', () => {
  const vp = { vw: 1440, vh: 900 };

  it('updates the rect of the target window only', () => {
    let s = open([], { app: 'doc', title: 'a' }, vp);
    s = open(s, { app: 'doc', title: 'b' }, vp);
    const other = { ...s[1] };
    const out = resize(s, s[0].id, 100, 80, 800, 500);
    expect(out[0]).toMatchObject({ x: 100, y: 80, w: 800, h: 500 });
    expect(out[1]).toMatchObject({ x: other.x, y: other.y, w: other.w, h: other.h });
  });

  it('enforces minimum width and height', () => {
    const s = open([], { app: 'doc', title: 'a' }, vp);
    const out = resize(s, s[0].id, 100, 80, 10, 10);
    expect(out[0].w).toBe(MIN_W);
    expect(out[0].h).toBe(MIN_H);
  });

  it('keeps the window below the menu bar (y >= 24)', () => {
    const s = open([], { app: 'doc', title: 'a' }, vp);
    const out = resize(s, s[0].id, 100, 4, 800, 500);
    expect(out[0].y).toBe(24);
  });

  it('is a no-op for an unknown id', () => {
    const s = open([], { app: 'doc', title: 'a' }, vp);
    const out = resize(s, 99999, 1, 1, 1, 1);
    expect(out[0]).toMatchObject({ x: s[0].x, y: s[0].y, w: s[0].w, h: s[0].h });
  });

  it('does not mutate the input state', () => {
    const s = open([], { app: 'doc', title: 'a' }, vp);
    const before = { ...s[0] };
    resize(s, s[0].id, 5, 50, 900, 600);
    expect(s[0]).toMatchObject(before);
  });
});

describe('open with explicit position', () => {
  const vp = { vw: 1440, vh: 900 };

  it('uses spec.x/spec.y instead of the cascade', () => {
    const s = open([], { app: 'finder', title: 'f', x: 240, y: 170 }, vp);
    expect(s[0].x).toBe(240);
    expect(s[0].y).toBe(170);
  });

  it('clamps an explicit position to the viewport and menu bar', () => {
    const s = open([], { app: 'finder', title: 'f', x: -50, y: 4, w: 400, h: 300 }, vp);
    expect(s[0].x).toBe(0);
    expect(s[0].y).toBe(24);
  });
});
