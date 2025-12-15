// src/ui/hud.js
export function createHud(dom, modelUrl){
  const state = { warnings: [] };

  function hideLoader(){
    dom.loader?.classList.add('hidden');
  }

  function pushWarn(msg){
    state.warnings.push(msg);
    if (state.warnings.length > 3) state.warnings.shift();
    dom.errdot?.classList.add('on');
    render();
  }

  let modeText = 'DRIVE';
  let chaseText = 'on';
  let paintHex = 0xdadada;
  let timeText = 'auto';
  let timeMeta = '';

  function setStatus({ modeDrive, chaseOn, paintColorHex, timeMode, timeModeMeta }){
    modeText = modeDrive ? 'DRIVE' : 'SCROLL';
    chaseText = chaseOn ? 'on' : 'off';
    paintHex = paintColorHex;
    timeText = timeMode;
    timeMeta = timeModeMeta || '';
  }

  function render(extra=''){
    if (!dom.hud) return;
    const lines = [];
    lines.push(`model: ${String(modelUrl).split('/').pop()}`);
    lines.push(`mode: ${modeText} · chase: ${chaseText}`);
    lines.push(`paint: #${paintHex.toString(16).padStart(6,'0')} · time: ${timeText}${timeMeta ? (' ' + timeMeta) : ''}`);
    if (state.warnings.length) lines.push(`warn: ${state.warnings.join(' | ')}`);
    if (extra) lines.push(extra);
    dom.hud.textContent = lines.join('\n');
  }

  return { hideLoader, pushWarn, setStatus, render };
}
