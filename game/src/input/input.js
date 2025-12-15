// src/input/input.js
export function createInput({
  onToggleMode,
  onToggleChase,
  onToggleHelpers,
  onToggleTimeMode,
  onPaintKey,
}){
  const INPUT = { w:false,a:false,s:false,d:false, shift:false, space:false };

  function preventKeys(e){
    if (['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)) e.preventDefault();
  }

  window.addEventListener('keydown', (e) => {
    preventKeys(e);

    if (e.code === 'KeyW') INPUT.w = true;
    if (e.code === 'KeyA') INPUT.a = true;
    if (e.code === 'KeyS') INPUT.s = true;
    if (e.code === 'KeyD') INPUT.d = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') INPUT.shift = true;
    if (e.code === 'Space') INPUT.space = true;

    if (e.code === 'KeyG') onToggleMode?.();
    if (e.code === 'KeyC') onToggleChase?.();
    if (e.code === 'KeyH') onToggleHelpers?.();
    if (e.code === 'KeyT') onToggleTimeMode?.();

    if (e.code === 'Digit1') onPaintKey?.(1);
    if (e.code === 'Digit2') onPaintKey?.(2);
    if (e.code === 'Digit3') onPaintKey?.(3);
  }, { passive:false });

  window.addEventListener('keyup', (e) => {
    preventKeys(e);

    if (e.code === 'KeyW') INPUT.w = false;
    if (e.code === 'KeyA') INPUT.a = false;
    if (e.code === 'KeyS') INPUT.s = false;
    if (e.code === 'KeyD') INPUT.d = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') INPUT.shift = false;
    if (e.code === 'Space') INPUT.space = false;
  }, { passive:false });

  return { INPUT };
}
