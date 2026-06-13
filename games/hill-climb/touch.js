// touch.js — tiny shared touch/pointer helpers for Gamf games.
// Uses Pointer Events so the same code works for touch, mouse and stylus.
// Copy this into a game folder so the game stays self-contained.

// Call onTap(el, fn) to fire fn(x, y) on a quick tap (not a drag).
export function onTap(el, fn, moveTolerance = 10) {
  let startX = 0, startY = 0, moved = false;
  el.addEventListener('pointerdown', (e) => {
    startX = e.clientX; startY = e.clientY; moved = false;
  });
  el.addEventListener('pointermove', (e) => {
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > moveTolerance) moved = true;
  });
  el.addEventListener('pointerup', (e) => {
    if (!moved) fn(e.clientX, e.clientY, e);
  });
}

// Call onDrag(el, {start, move, end}) for drag gestures.
// Each callback gets {x, y, dx, dy} where dx/dy is movement since last event.
export function onDrag(el, { start, move, end } = {}) {
  let active = false, lastX = 0, lastY = 0;
  el.addEventListener('pointerdown', (e) => {
    active = true; lastX = e.clientX; lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
    start && start({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 });
  });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    move && move({ x: e.clientX, y: e.clientY, dx, dy });
  });
  const stop = (e) => {
    if (!active) return;
    active = false;
    end && end({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 });
  };
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
}

// Detect a 4-direction swipe. Calls fn('left'|'right'|'up'|'down').
export function onSwipe(el, fn, threshold = 30) {
  let startX = 0, startY = 0;
  el.addEventListener('pointerdown', (e) => { startX = e.clientX; startY = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) fn(dx > 0 ? 'right' : 'left');
    else fn(dy > 0 ? 'down' : 'up');
  });
}

// Request fullscreen (best-effort; ignored where unsupported, e.g. iOS Safari).
export function goFullscreen(el = document.documentElement) {
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
}
