### 3) `src/config.js`

```js
// src/config.js
export const MODEL_URL = 'https://tripreport.github.io/3D/k-8.glb';

export const PAINT = {
  orange: 0xf28c28,
  navy:   0x0b2a5b,
  stock:  0xdadada,
};

export const MODE_DEFAULT = { drive: true, chaseCam: true };

export const DAY_NIGHT = {
  enabled: true,
  periodSec: 120,
  timeOffset: 0,
  manual: false,
  manualHour: 12.0,

  daySky: 0xffffff,
  nightSky: 0x0b1220,
  dayFog: 0xffffff,
  nightFog: 0x0b1220,

  daySunIntensity: 0.95,
  nightSunIntensity: 0.18,
  dayAmbientIntensity: 0.28,
  nightAmbientIntensity: 0.07,

  dayExposure: 1.15,
  nightExposure: 0.78,
};

export const RENDER = {
  maxDpr: 2,
};

export const SOLID = {
  forceSolidColor: true,
  mat: { roughness: 0.96, metalness: 0.0 },
};

export const CAMERA = {
  floorY: 0.0,
  minY: 0.10,
  targetMinY: 0.10,
  terrainClamp: true,
  cameraTerrainClearance: 1.25,
  targetTerrainClearance: 0.35,

  floating: true,
  floatPosStrength: 0.02,
  floatYStrength: 0.008,
  floatFreqA: 0.18,
  floatFreqB: 0.09,
  floatFreqC: 0.14,
  floatMaxOffset: 0.55,
  floatMaxY: 0.18,

  wheelZoomRequiresModifier: true,
};

export const WORLD = {
  envSize: 320,
  envSegments: 140,
  amplitude: 4.2,
  frequency: 0.035,
  seed: 1337,
  trackHalfWidth: 22.0,
  roadLevel: 0.10,
};

export const VEHICLE = {
  forwardOffset: 10.0,

  phys: {
    clearance: 0.01,
    gravity: 34.0,
    maxFallSpeed: 80.0,
    velDamping: 0.18,
  },

  drive: {
    accelRate: 16.0,
    brakeRate: 26.0,
    coastRate: 8.0,
    maxSpeed: 24.0,
    maxReverse: 10.0,
    yawRateAtSpeed: 1.35,
    yawRateAtZero: 0.95,
    steerSmoothing: 0.20,
    zSpring: 7.5,
    chaseOffset: { x: 0, y: 8.5, z: -18 },
    chaseLerp: 0.075,
    targetLerp: 0.12,
  },
};

export const MINIMAP = {
  sizeCSS: 220,
  range: 95,
  followLerp: 0.12,
  camHeight: 260,
  helperRadius: 34,
};

export const MISSIONS = [
  { id:'delivery-01', title:'Доставка', cargo:'Ящик',     pickup:{ x: 18,  z: 0  }, drop:{ x: 140, z: 6  } },
  { id:'delivery-02', title:'Доставка', cargo:'Топливо',  pickup:{ x: -24, z: -4 }, drop:{ x: 210, z: -8 } },
  { id:'delivery-03', title:'Доставка', cargo:'Запчасти', pickup:{ x: 62,  z: 8  }, drop:{ x: 320, z: 0  } },
];

export const MISSION_RULES = {
  pickupRadius: 6.0,
  dropRadius: 7.0,
};

export const FALLBACK_PNG_1x1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0S9y8AAAAASUVORK5CYII=';
```

---

### 4) `src/ui/dom.js`

```js
// src/ui/dom.js
export function getDom(){
  const $ = (id) => document.getElementById(id);

  return {
    canvas: $('bg'),
    loader: $('loader'),
    errdot: $('errdot'),
    hud: $('hud'),

    // dashboard
    spdVal: $('spdVal'),
    gearMode: $('gearMode'),
    gearVal: $('gearVal'),
    rpmVal: $('rpmVal'),
    rpmFill: $('rpmFill'),

    // time
    timeVal: $('timeVal'),
    timeAuto: $('timeAuto'),
    timeSlider: $('timeSlider'),

    // paint buttons
    btnStock: $('btnStock'),
    btnOrange: $('btnOrange'),
    btnNavy: $('btnNavy'),

    // missions topbar
    taskList: $('taskList'),
    tasksDone: $('tasksDone'),
    tasksTotal: $('tasksTotal'),
    tasksFill: $('tasksFill'),
    taskHint: $('taskHint'),
    cargoState: $('cargoState'),

    // minimap
    minimapWrap: $('minimapWrap'),
    minimap: $('minimap'),
    minimapOverlay: $('minimapOverlay'),
  };
}
```

---

### 5) `src/ui/hud.js`

```js
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
```

---

### 6) `src/ui/dashboard.js`

```js
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
```

---

### 7) `src/ui/timeControls.js`

```js
// src/ui/timeControls.js
export function createTimeControls(dom, dayNight, onChange){
  function applyUi(){
    if (dom.timeAuto) dom.timeAuto.textContent = dayNight.manual ? 'Manual' : 'Auto';
    if (dom.timeSlider) dom.timeSlider.style.opacity = dayNight.manual ? '1' : '0.35';
  }

  function toggleMode(){
    dayNight.manual = !dayNight.manual;
    applyUi();
    onChange?.();
  }

  if (dom.timeAuto){
    dom.timeAuto.addEventListener('click', toggleMode);
  }

  if (dom.timeSlider){
    dom.timeSlider.min = '0';
    dom.timeSlider.max = '24';
    dom.timeSlider.step = '0.05';
    dom.timeSlider.value = String(dayNight.manualHour);
    dom.timeSlider.addEventListener('input', () => {
      dayNight.manual = true;
      dayNight.manualHour = parseFloat(dom.timeSlider.value) || 12;
      applyUi();
      onChange?.();
    });
  }

  applyUi();
  return { toggleMode, applyUi };
}
```

---

### 8) `src/input/input.js`

```js
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
```

---

### 9) `src/loaders/gltfLoader.js`

```js
// src/loaders/gltfLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

export function createGLTFLoader({ renderer, baseUrl, fallbackDataUri, onWarn }){
  const manager = new THREE.LoadingManager();

  // Resolve broken/unparseable URLs safely and keep the model rendering
  if (baseUrl){
    let base = null;
    try { base = new URL(baseUrl, window.location.href); } catch { base = null; }
    manager.setURLModifier((u) => {
      try {
        if (!u) return fallbackDataUri;
        const s = String(u);
        if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('http://') || s.startsWith('https://')) return s;
        if (!base) return s;
        return new URL(s, base).href;
      } catch {
        return fallbackDataUri;
      }
    });
  }

  manager.onError = (url) => {
    console.warn('[LoadingManager] resource error:', url);
    onWarn?.(\"Couldn't load texture\");
  };

  const loader = new GLTFLoader(manager);
  loader.setCrossOrigin('anonymous');
  loader.setMeshoptDecoder(MeshoptDecoder);

  const draco = new DRACOLoader();
  draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  loader.setDRACOLoader(draco);

  const ktx2 = new KTX2Loader(manager);
  ktx2.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
  ktx2.detectSupport(renderer);
  loader.setKTX2Loader(ktx2);

  function cleanup(){
    try { draco.dispose(); } catch {}
    try { ktx2.dispose(); } catch {}
  }

  return { loader, cleanup };
}
```

---

### 10) `src/world/terrain.js`

```js
// src/world/terrain.js
import * as THREE from 'three';

export function createTerrainMath({ frequency, amplitude, seed, trackHalfWidth, roadLevel }){
  const fract = (x) => x - Math.floor(x);
  const lerp = (a,b,t) => a + (b-a)*t;
  const smoothstep = (t) => t*t*(3-2*t);

  function hash2(ix, iz){
    const s = Math.sin(ix * 127.1 + iz * 311.7 + seed) * 43758.5453123;
    return fract(s);
  }

  function noise2(x, z){
    const fx = Math.floor(x), fz = Math.floor(z);
    const tx = smoothstep(x - fx), tz = smoothstep(z - fz);
    const a = hash2(fx,     fz);
    const b = hash2(fx + 1, fz);
    const c = hash2(fx,     fz + 1);
    const d = hash2(fx + 1, fz + 1);
    return lerp(lerp(a,b,tx), lerp(c,d,tx), tz);
  }

  function fbm(x, z){
    let v = 0, amp = 1, freq = 1;
    for (let i=0;i<5;i++){
      v += amp * noise2(x*freq, z*freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return v;
  }

  function baseHeightAt(x, z){
    const nx = x * frequency;
    const nz = z * frequency;
    const h = fbm(nx + 10.0, nz - 7.0);
    const r = Math.sqrt(x*x + z*z);
    const centerMask = THREE.MathUtils.clamp(1.0 - (r / 55.0), 0.0, 1.0);
    const h2 = lerp(h, 0.48, centerMask * 0.55);
    return (h2 - 0.5) * 2.0 * amplitude;
  }

  function terrainY(x, z){
    let y = baseHeightAt(x, z);
    const onTrack = Math.abs(z) < trackHalfWidth;
    if (onTrack){
      const t = 1.0 - (Math.abs(z) / trackHalfWidth);
      const a = THREE.MathUtils.clamp(t*t, 0.0, 1.0);
      y = lerp(y, roadLevel, a);
    }
    return y;
  }

  return { terrainY, noise2 };
}
```

---

### 11) `src/world/environment.js`

```js
// src/world/environment.js
import * as THREE from 'three';
import { createTerrainMath } from './terrain.js';

export function makeLowPolyEnvironment({ world, size, segments }){
  const { terrainY, noise2 } = createTerrainMath(world);

  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI/2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const cSnow  = new THREE.Color(0xffffff);
  const cRock  = new THREE.Color(0xcfd5df);
  const cMud   = new THREE.Color(0xc8b8a8);
  const cDirt  = new THREE.Color(0xb9a892);

  for (let i=0;i<pos.count;i++){
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = terrainY(x, z);
    pos.setY(i, y);

    const onTrack = Math.abs(z) < world.trackHalfWidth;
    let col = cDirt;
    if (y > 1.4) col = cSnow;
    else if (y > 0.5) col = cRock;
    else col = onTrack ? cMud : cDirt;

    const v = (noise2((x+100)*0.08, (z-50)*0.08) - 0.5) * 0.10;
    colors[i*3+0] = THREE.MathUtils.clamp(col.r + v, 0, 1);
    colors[i*3+1] = THREE.MathUtils.clamp(col.g + v, 0, 1);
    colors[i*3+2] = THREE.MathUtils.clamp(col.b + v, 0, 1);
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.98, metalness:0.0, flatShading:true });
  const terrain = new THREE.Mesh(geo, mat);
  terrain.receiveShadow = true;
  group.add(terrain);

  return { group, terrainY };
}
```

---

### 12) `src/world/markers.js`

```js
// src/world/markers.js
import * as THREE from 'three';

export function createMissionMarkers(scene, groundYAt){
  const markerGroup = new THREE.Group();
  scene.add(markerGroup);

  const makeMarker = (color) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.22, 10, 18),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.55 })
    );
    ring.rotation.x = Math.PI/2;
    ring.position.y = 0.12;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.6, 12),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.75 })
    );
    cone.position.y = 1.25;

    g.add(ring, cone);
    return g;
  };

  const markers = {
    pickup: makeMarker(0x22c55e),
    drop: makeMarker(0xef4444),
  };

  markerGroup.add(markers.pickup, markers.drop);

  function setFromMission(mission, stage){
    if (!mission){
      markers.pickup.visible = false;
      markers.drop.visible = false;
      return;
    }
    const showPickup = stage === 'toPickup';
    const showDrop = stage === 'toDropoff';
    markers.pickup.visible = showPickup;
    markers.drop.visible = showDrop;

    if (showPickup){
      const y = groundYAt(mission.pickup.x, mission.pickup.z) + 0.02;
      markers.pickup.position.set(mission.pickup.x, y, mission.pickup.z);
    }
    if (showDrop){
      const y = groundYAt(mission.drop.x, mission.drop.z) + 0.02;
      markers.drop.position.set(mission.drop.x, y, mission.drop.z);
    }
  }

  return { setFromMission, markers };
}
```

---

### 13) `src/world/dayNight.js`

```js
// src/world/dayNight.js
import * as THREE from 'three';

export function createDayNight({ scene, renderer, fog, ambient, key, fill, dayNight, timeValEl }){
  const _daySky = new THREE.Color(dayNight.daySky);
  const _nightSky = new THREE.Color(dayNight.nightSky);
  const _dayFog = new THREE.Color(dayNight.dayFog);
  const _nightFog = new THREE.Color(dayNight.nightFog);

  const _sunDay = new THREE.Color(0xffffff);
  const _sunNight = new THREE.Color(0xb8d2ff);

  const _tmpSky = new THREE.Color();
  const _tmpFog = new THREE.Color();
  const _tmpSun = new THREE.Color();
  const _tmpFill = new THREE.Color();

  function update(elapsedSec){
    if (!dayNight.enabled) return;

    let cyc;
    if (dayNight.manual){
      cyc = ((dayNight.manualHour / 24) % 1 + 1) % 1;
    } else {
      const w = (elapsedSec + dayNight.timeOffset) / Math.max(1e-3, dayNight.periodSec);
      cyc = (w % 1 + 1) % 1;
    }

    const phase = cyc * Math.PI * 2;
    const night = (1 - Math.cos(phase)) * 0.5;

    _tmpSky.copy(_daySky).lerp(_nightSky, night);
    scene.background = _tmpSky;

    if (fog?.color){
      _tmpFog.copy(_dayFog).lerp(_nightFog, night);
      fog.color.copy(_tmpFog);
    }

    renderer.toneMappingExposure = THREE.MathUtils.lerp(dayNight.dayExposure, dayNight.nightExposure, night);
    key.intensity = THREE.MathUtils.lerp(dayNight.daySunIntensity, dayNight.nightSunIntensity, night);
    ambient.intensity = THREE.MathUtils.lerp(dayNight.dayAmbientIntensity, dayNight.nightAmbientIntensity, night);
    fill.intensity = THREE.MathUtils.lerp(0.40, 0.12, night);

    _tmpSun.copy(_sunDay).lerp(_sunNight, night);
    _tmpFill.copy(_sunDay).lerp(_sunNight, night * 0.85);
    key.color.copy(_tmpSun);
    fill.color.copy(_tmpFill);

    const elev = THREE.MathUtils.lerp(1.2, 0.15, night);
    const az = phase * 0.55;
    key.position.set(Math.cos(az) * 14, 10 * elev, Math.sin(az) * 14);

    if (timeValEl){
      const dayHours = cyc * 24;
      const hh = Math.floor(dayHours) % 24;
      const mm = Math.floor((dayHours - hh) * 60);
      timeValEl.textContent = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    }
  }

  return { update };
}
```

---

### 14) `src/vehicle/vehicle.js`

```js
// src/vehicle/vehicle.js
import * as THREE from 'three';
import { createGLTFLoader } from '../loaders/gltfLoader.js';

export function createVehicle({
  scene,
  renderer,
  modelUrl,
  solid,
  paintHex,
  fallbackPng,
  onWarn,
}){
  const model = { root:null, mixer:null, base:null };
  let solidMaterial = null;

  function prepRoot(root){
    if (!solidMaterial){
      solidMaterial = new THREE.MeshStandardMaterial({
        color: paintHex,
        roughness: solid.mat.roughness,
        metalness: solid.mat.metalness,
      });
    }
    solidMaterial.color.setHex(paintHex);

    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (solid.forceSolidColor) obj.material = solidMaterial;
    });
  }

  function setColor(hex){
    paintHex = hex;
    if (solidMaterial){
      solidMaterial.color.setHex(hex);
      solidMaterial.needsUpdate = true;
    }
  }

  function recenterToGround(root){
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;

    const box2 = new THREE.Box3().setFromObject(root);
    root.position.y -= box2.min.y;
  }

  function normalizeScaleTo(root, targetMaxDim=12){
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    root.scale.setScalar(targetMaxDim / maxDim);
  }

  function placeOnRoad(root){
    root.position.set(0, root.position.y, 0);
  }

  async function load(){
    return new Promise((resolve, reject) => {
      const { loader, cleanup } = createGLTFLoader({
        renderer,
        baseUrl: modelUrl,
        fallbackDataUri: fallbackPng,
        onWarn,
      });

      loader.load(
        modelUrl,
        (gltf) => {
          const root = gltf.scene;
          prepRoot(root);
          normalizeScaleTo(root, 12);
          recenterToGround(root);
          placeOnRoad(root);

          scene.add(root);

          let mixer = null;
          if (gltf.animations && gltf.animations.length){
            mixer = new THREE.AnimationMixer(root);
            for (const clip of gltf.animations) mixer.clipAction(clip).play();
          }

          model.root = root;
          model.mixer = mixer;
          model.base = { pos: root.position.clone(), rot: root.rotation.clone(), scl: root.
