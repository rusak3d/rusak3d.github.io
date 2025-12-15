// src/ui/dashboard.js
import * as THREE from 'three';

export function createDashboard(dom){
  const DRIVE = {
    speedKmhSm: 0,
    rpmSm: 800,
    gear: 1,
    mode: 'D',
    speedSmooth: 0.10,
    rpmSmooth: 0.12,
  };

  function updateFromSpeed(speedMS, dt){
    const kmh = Math.max(0, speedMS) * 3.6;
    DRIVE.speedKmhSm = THREE.MathUtils.lerp(DRIVE.speedKmhSm, kmh, 1 - Math.pow(1 - DRIVE.speedSmooth, dt * 60));

    const s = DRIVE.speedKmhSm;
    let g = 1;
    if (s > 18) g = 2;
    if (s > 36) g = 3;
    if (s > 58) g = 4;
    if (s > 86) g = 5;
    if (s > 118) g = 6;
    DRIVE.gear = g;

    const idle = 820;
    const red = 6800;
    const gearMul = [0, 130, 95, 75, 62, 54, 48][g];
    const targetRpm = THREE.MathUtils.clamp(idle + s * gearMul, idle, red);
    DRIVE.rpmSm = THREE.MathUtils.lerp(DRIVE.rpmSm, targetRpm, 1 - Math.pow(1 - DRIVE.rpmSmooth, dt * 60));

    if (dom.spdVal) dom.spdVal.textContent = String(Math.round(DRIVE.speedKmhSm));
    if (dom.gearVal) dom.gearVal.textContent = String(DRIVE.gear);
    if (dom.gearMode) dom.gearMode.textContent = DRIVE.mode;
    if (dom.rpmVal) dom.rpmVal.textContent = String(Math.round(DRIVE.rpmSm));
    if (dom.rpmFill){
      const p = THREE.MathUtils.clamp((DRIVE.rpmSm - idle) / (red - idle), 0, 1);
      dom.rpmFill.style.width = (p * 100).toFixed(1) + '%';
    }
  }

  return { updateFromSpeed };
}
