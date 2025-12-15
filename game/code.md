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
          model.base = { pos: root.position.clone(), rot: root.rotation.clone(), scl: root.scale.clone() };

          cleanup();
          resolve(model);
        },
        undefined,
        (err) => {
          cleanup();
          reject(err);
        }
      );
    });
  }

  return { model, load, setColor, prepRoot };
}
```

---

### 15) `src/vehicle/physics.js`

```js
// src/vehicle/physics.js
import * as THREE from 'three';

export function createVehiclePhysics({ model, terrainY, trackClampZ=1.25, phys }){
  let state = null;

  function computeContactTargetY(clearance){
    const root = model.root;
    if (!root) return 0;

    const prevY = root.position.y;
    root.position.y = 0;
    root.updateWorldMatrix(true,true);

    const box = new THREE.Box3().setFromObject(root);
    const minY = box.min.y;
    const minX = box.min.x, maxX = box.max.x;
    const minZ = box.min.z, maxZ = box.max.z;
    const mx = (minX + maxX) * 0.5;
    const mz = (minZ + maxZ) * 0.5;

    const samples = [
      [minX,minZ],[maxX,minZ],[minX,maxZ],[maxX,maxZ],
      [mx,minZ],[mx,maxZ],[minX,mz],[maxX,mz],[mx,mz],
    ];

    let maxGround = -Infinity;
    for (const s of samples){
      const gx = s[0];
      const gz = THREE.MathUtils.clamp(s[1], -trackClampZ, trackClampZ);
      maxGround = Math.max(maxGround, terrainY(gx, gz));
    }

    const targetY = (maxGround - minY) + clearance;

    root.position.y = prevY;
    root.updateWorldMatrix(true,true);
    return targetY;
  }

  function init(){
    if (!model.root) return;
    const targetY = computeContactTargetY(phys.clearance);
    state = { y: targetY + 0.25, vy: -2.0, targetY };
    model.root.position.y = state.y;
    model.root.updateWorldMatrix(true,true);
  }

  function step(dt){
    if (!model.root || !state) return;

    state.targetY = computeContactTargetY(phys.clearance);
    state.vy -= phys.gravity * dt;
    state.vy = THREE.MathUtils.clamp(state.vy, -phys.maxFallSpeed, phys.maxFallSpeed);
    state.vy *= (1.0 - phys.velDamping);
    state.y += state.vy * dt;

    if (state.y < state.targetY){
      state.y = state.targetY;
      if (state.vy < 0) state.vy = 0;
    }

    model.root.position.y = state.y;
    model.root.updateWorldMatrix(true,true);
  }

  return { init, step };
}
```

---

### 16) `src/vehicle/drive.js`

```js
// src/vehicle/drive.js
import * as THREE from 'three';

export function createDriveController({ model, input, dashboard, cfg, mode, controls, camera }){
  const dc = {
    yaw: 0,
    speed: 0,
    speedTarget: 0,
    steerSm: 0,
    zLimit: cfg.trackHalfWidth * 0.92,
  };

  const chaseOffset = new THREE.Vector3(cfg.chaseOffset.x, cfg.chaseOffset.y, cfg.chaseOffset.z);

  function step(dt){
    if (!model.root) return;

    dt = Math.min(dt, 1/30);

    const throttle = (input.w ? 1 : 0) + (input.s ? -1 : 0);
    // A=left, D=right (как ты просил: инверсию убрали)
    const steerRaw = (input.d ? -1 : 0) + (input.a ? 1 : 0);

    dc.steerSm = THREE.MathUtils.lerp(
      dc.steerSm,
      steerRaw,
      1 - Math.pow(1 - cfg.steerSmoothing, dt * 60)
    );

    const maxF = input.shift ? (cfg.maxSpeed * 1.25) : cfg.maxSpeed;
    const tgt = (throttle > 0) ? maxF : (throttle < 0 ? -cfg.maxReverse : 0);
    dc.speedTarget = tgt;

    const v0 = dc.speed;

    if (input.space){
      const sign = Math.sign(v0);
      const dv = cfg.brakeRate * dt;
      dc.speed = (Math.abs(v0) <= dv) ? 0 : (v0 - sign * dv);
    } else {
      const dv = (dc.speedTarget - v0);
      const rate = (Math.abs(dc.speedTarget) > 0.001) ? cfg.accelRate : cfg.coastRate;
      const step = THREE.MathUtils.clamp(dv, -rate * dt, rate * dt);
      dc.speed = v0 + step;
    }

    const speedAbs = Math.abs(dc.speed);
    const yawRate = THREE.MathUtils.lerp(
      cfg.yawRateAtZero,
      cfg.yawRateAtSpeed,
      THREE.MathUtils.clamp(speedAbs / 10, 0, 1)
    );

    dc.yaw += dc.steerSm * yawRate * dt;

    const fwd = new THREE.Vector3(Math.sin(dc.yaw), 0, Math.cos(dc.yaw));
    model.root.position.x += fwd.x * (dc.speed * dt);
    model.root.position.z += fwd.z * (dc.speed * dt);

    const lim = dc.zLimit;
    const z = model.root.position.z;
    if (Math.abs(z) > lim){
      const over = Math.abs(z) - lim;
      const pull = Math.sign(z) * over * cfg.zSpring * dt;
      model.root.position.z -= pull;
    }

    model.root.rotation.y = dc.yaw;

    dashboard.updateFromSpeed(speedAbs, dt);

    if (mode.chaseCam){
      const desiredTarget = model.root.position.clone();
      const off = chaseOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), dc.yaw);
      const desiredPos = desiredTarget.clone().add(off);

      camera.position.lerp(desiredPos, cfg.chaseLerp);
      controls.target.lerp(desiredTarget, cfg.targetLerp);
    }
  }

  return { step };
}
```

---

### 17) `src/missions/missionRuntime.js`

```js
// src/missions/missionRuntime.js
import { dist2D } from './utils.js';

export function createMissionRuntime({ missions, rules, ui, markers, groundYAt }){
  const state = {
    activeIndex: 0,
    stage: 'toPickup', // 'toPickup' | 'toDropoff'
    carrying: false,
    done: 0,
    total: missions.length,
  };

  const current = () => missions[state.activeIndex] || null;

  function updateUi(){
    const m = current();
    ui.setMissionState({
      mission: m,
      stage: state.stage,
      carrying: state.carrying,
      done: state.done,
      total: state.total,
    });
  }

  function updateMarkers(){
    markers.setFromMission(current(), state.stage, groundYAt);
  }

  function init(){
    updateUi();
    updateMarkers();
  }

  function step(vehiclePos){
    const m = current();
    if (!m) return;

    const px = vehiclePos.x;
    const pz = vehiclePos.z;

    if (state.stage === 'toPickup'){
      const d = dist2D(px, pz, m.pickup.x, m.pickup.z);
      if (d < rules.pickupRadius){
        state.stage = 'toDropoff';
        state.carrying = true;
        updateUi();
        updateMarkers();
      }
    } else {
      const d = dist2D(px, pz, m.drop.x, m.drop.z);
      if (d < rules.dropRadius){
        state.done += 1;
        state.activeIndex += 1;
        state.stage = 'toPickup';
        state.carrying = false;
        updateUi();
        updateMarkers();
      }
    }
  }

  return { state, current, init, step, updateUi, updateMarkers };
}
```

---

### 18) `src/missions/utils.js`

```js
// src/missions/utils.js
export function dist2D(ax, az, bx, bz){
  const dx = ax - bx;
  const dz = az - bz;
  return Math.sqrt(dx*dx + dz*dz);
}
```

---

### 19) `src/ui/missionsUi.js`

```js
// src/ui/missionsUi.js
export function createMissionsUi(dom){
  function missionText(mission, stage){
    if (!mission) return 'Все задания выполнены';
    if (stage === 'toPickup') return `${mission.title}: забрать груз (${mission.cargo})`;
    return `${mission.title}: выгрузить груз (${mission.cargo})`;
  }

  function setMissionState({ mission, stage, carrying, done, total }){
    if (dom.tasksTotal) dom.tasksTotal.textContent = String(total);
    if (dom.tasksDone) dom.tasksDone.textContent = String(done);

    if (dom.tasksFill){
      const p = total <= 0 ? 0 : (done / total);
      dom.tasksFill.style.width = (p * 100).toFixed(1) + '%';
    }

    if (!mission){
      if (dom.taskList) dom.taskList.textContent = '—';
      if (dom.taskHint) dom.taskHint.textContent = '—';
      if (dom.cargoState) dom.cargoState.textContent = 'Груз: —';
      return;
    }

    if (dom.taskList) dom.taskList.textContent = missionText(mission, stage);
    if (dom.cargoState) dom.cargoState.textContent = carrying ? `Груз: ${mission.cargo}` : 'Груз: —';
    if (dom.taskHint){
      dom.taskHint.textContent = (stage === 'toPickup') ? 'Подъедь к точке взятия' : 'Подъедь к точке выгрузки';
    }
  }

  return { setMissionState };
}
```

---

### 20) `src/world/minimap.js`

```js
// src/world/minimap.js
import * as THREE from 'three';

export function createMinimap({ dom, scene, model, cfg, helpersRef, getMissionPin }){
  const wrap = dom.minimapWrap;
  const mmCanvas = dom.minimap;
  const overlay = dom.minimapOverlay;

  const mmCtx = overlay.getContext('2d');

  const mapRenderer = new THREE.WebGLRenderer({ canvas:mmCanvas, antialias:true, alpha:true, powerPreference:'low-power' });
  mapRenderer.outputColorSpace = THREE.SRGBColorSpace;
  mapRenderer.toneMapping = THREE.NoToneMapping;

  const mapCamera = new THREE.OrthographicCamera(-cfg.range, cfg.range, cfg.range, -cfg.range, 0.1, 2000);
  mapCamera.position.set(0, cfg.camHeight, 0);
  mapCamera.up.set(0,0,-1);
  mapCamera.lookAt(0,0,0);

  const mapOverride = new THREE.MeshBasicMaterial({ vertexColors:true, color:0xffffff });
  const follow = { x:0, z:0 };

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    const size = Math.max(120, Math.min(rect.width, rect.height));

    mapRenderer.setPixelRatio(dpr);
    mapRenderer.setSize(size, size, false);

    overlay.width = Math.floor(size * dpr);
    overlay.height = Math.floor(size * dpr);
    overlay.style.width = size + 'px';
    overlay.style.height = size + 'px';
    mmCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pin(pt, rgba){
    const rect = wrap.getBoundingClientRect();
    const size = rect.width;
    const cx = size*0.5;
    const cy = size*0.5;

    const nx = (pt.x - follow.x) / cfg.range;
    const nz = (pt.z - follow.z) / cfg.range;

    const px = cx + nx * cx;
    const py = cy + nz * cy;

    mmCtx.save();
    mmCtx.translate(px, py);
    mmCtx.globalAlpha = 0.95;
    mmCtx.fillStyle = rgba;
    mmCtx.strokeStyle = 'rgba(0,0,0,.22)';
    mmCtx.lineWidth = 2;

    mmCtx.beginPath();
    mmCtx.arc(0, -6, 7, 0, Math.PI*2);
    mmCtx.fill();
    mmCtx.stroke();

    mmCtx.beginPath();
    mmCtx.moveTo(0, 16);
    mmCtx.lineTo(-7, -2);
    mmCtx.lineTo(7, -2);
    mmCtx.closePath();
    mmCtx.fill();
    mmCtx.stroke();

    mmCtx.fillStyle = 'rgba(255,255,255,.85)';
    mmCtx.beginPath();
    mmCtx.arc(0, -6, 2.2, 0, Math.PI*2);
    mmCtx.fill();
    mmCtx.restore();
  }

  function drawOverlay(){
    const rect = wrap.getBoundingClientRect();
    const size = rect.width;
    mmCtx.clearRect(0,0,size,size);
    if (!model.root) return;

    const fwd = new THREE.Vector3(0,0,1).applyQuaternion(model.root.quaternion);
    const ang = Math.atan2(fwd.x, fwd.z);

    // mission pin (pickup/drop)
    const mp = getMissionPin?.();
    if (mp){
      pin(mp.pt, mp.color);
    }

    // player arrow
    const cx = size*0.5;
    const cy = size*0.5;

    mmCtx.save();
    mmCtx.translate(cx, cy);
    mmCtx.rotate(ang);

    mmCtx.globalAlpha = 0.95;
    mmCtx.fillStyle = 'rgba(17,24,39,0.85)';
    mmCtx.beginPath();
    mmCtx.moveTo(0, -16);
    mmCtx.lineTo(10, 12);
    mmCtx.lineTo(-10, 12);
    mmCtx.closePath();
    mmCtx.fill();

    mmCtx.globalAlpha = 0.95;
    mmCtx.fillStyle = 'rgba(30,144,255,0.95)';
    mmCtx.beginPath();
    mmCtx.moveTo(0, -16);
    mmCtx.lineTo(4, -4);
    mmCtx.lineTo(-4, -4);
    mmCtx.closePath();
    mmCtx.fill();
    mmCtx.restore();

    if (!helpersRef.value) return;

    const drawAxisArrow = (localAng, color, len) => {
      mmCtx.save();
      mmCtx.translate(cx, cy);
      mmCtx.rotate(ang + localAng);
      mmCtx.globalAlpha = 0.80;
      mmCtx.strokeStyle = color;
      mmCtx.fillStyle = color;
      mmCtx.lineWidth = 3;

      const r = cfg.helperRadius;
      mmCtx.beginPath();
      mmCtx.moveTo(0, -r);
      mmCtx.lineTo(0, -r - len);
      mmCtx.stroke();

      mmCtx.beginPath();
      mmCtx.moveTo(0, -r - len);
      mmCtx.lineTo(-6, -r - len + 10);
      mmCtx.lineTo(6, -r - len + 10);
      mmCtx.closePath();
      mmCtx.fill();
      mmCtx.restore();
    };

    drawAxisArrow(0,          'rgba(30,144,255,0.9)', 18);
    drawAxisArrow(Math.PI,    'rgba(148,163,184,0.9)', 12);
    drawAxisArrow(Math.PI/2,  'rgba(34,197,94,0.9)',  12);
    drawAxisArrow(-Math.PI/2, 'rgba(239,68,68,0.9)',  12);
  }

  function render(){
    if (!model.root) return;
    wrap?.setAttribute('aria-hidden', 'false');

    follow.x = THREE.MathUtils.lerp(follow.x, model.root.position.x, cfg.followLerp);
    follow.z = THREE.MathUtils.lerp(follow.z, model.root.position.z, cfg.followLerp);

    mapCamera.position.set(follow.x, cfg.camHeight, follow.z);
    mapCamera.lookAt(follow.x, 0, follow.z);
    mapCamera.updateMatrixWorld();

    const oldFog = scene.fog;
    const oldOverride = scene.overrideMaterial;
    scene.fog = null;
    scene.overrideMaterial = mapOverride;

    const oldVis = model.root.visible;
    model.root.visible = false;

    mapRenderer.setClearColor(0xffffff, 0.0);
    mapRenderer.render(scene, mapCamera);

    model.root.visible = oldVis;
    scene.overrideMaterial = oldOverride;
    scene.fog = oldFog;

    drawOverlay();
  }

  resize();
  return { resize, render };
}
```

---

### 21) `src/tests/selfTests.js`

```js
// src/tests/selfTests.js
export function runSelfTests({ MODEL_URL, FALLBACK_PNG_1x1, missions, terrainY, roadLevel, onWarn }){
  const tests = [];
  const t = (name, fn) => {
    try { fn(); tests.push({name, ok:true}); }
    catch(e){ tests.push({name, ok:false, err:e}); }
  };

  t('MODEL_URL ends with .glb/.gltf', () => {
    if (!/\.(glb|gltf)(\?.*)?$/.test(MODEL_URL)) throw new Error('Bad MODEL_URL: ' + MODEL_URL);
  });

  t('WebGL available', () => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) throw new Error('WebGL not available');
  });

  t('terrain: road center equals roadLevel', () => {
    const y0 = terrainY(0, 0);
    if (Math.abs(y0 - roadLevel) > 0.001) throw new Error('road not flat at center: ' + y0);
  });

  t('fallback png exists', () => {
    if (!FALLBACK_PNG_1x1.startsWith('data:image/png;base64,')) throw new Error('fallback missing');
  });

  t('missions exist', () => {
    if (!Array.isArray(missions) || missions.length < 1) throw new Error('no missions');
    const m = missions[0];
    if (!m.pickup || !m.drop) throw new Error('mission missing points');
  });

  const failed = tests.filter(x => !x.ok);
  if (failed.length){
    console.groupCollapsed('[SelfTests] failed');
    for (const f of failed) console.error(f.name, f.err);
    console.groupEnd();
    onWarn?.('selftests failed');
  }
}
```

---

### 22) `src/main.js` (входной файл)

```js
// src/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import {
  MODEL_URL, PAINT, MODE_DEFAULT, DAY_NIGHT,
  RENDER, SOLID, CAMERA, WORLD, VEHICLE,
  MINIMAP, MISSIONS, MISSION_RULES, FALLBACK_PNG_1x1
} from './config.js';

import { getDom } from './ui/dom.js';
import { createHud } from './ui/hud.js';
import { createDashboard } from './ui/dashboard.js';
import { createTimeControls } from './ui/timeControls.js';
import { createMissionsUi } from './ui/missionsUi.js';

import { createInput } from './input/input.js';

import { makeLowPolyEnvironment } from './world/environment.js';
import { createMissionMarkers } from './world/markers.js';
import { createDayNight } from './world/dayNight.js';
import { createMinimap } from './world/minimap.js';

import { createVehicle } from './vehicle/vehicle.js';
import { createVehiclePhysics } from './vehicle/physics.js';
import { createDriveController } from './vehicle/drive.js';

import { createTerrainMath } from './world/terrain.js';
import { runSelfTests } from './tests/selfTests.js';

import { createMissionRuntime } from './missions/missionRuntime.js';

const dom = getDom();

const MODE = { ...MODE_DEFAULT };
let solidColor = PAINT.stock;

// HUD
const hud = createHud(dom, MODEL_URL);
hud.render();

// Dashboard + Missions UI
const dashboard = createDashboard(dom);
const missionsUi = createMissionsUi(dom);

// Scene / Renderer
const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, RENDER.maxDpr));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = DAY_NIGHT.dayExposure;
renderer.shadowMap.enabled = true;
if ('useLegacyLights' in renderer) renderer.useLegacyLights = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(DAY_NIGHT.daySky);

// environment lighting
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 6000);
scene.add(camera);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.enableZoom = !CAMERA.wheelZoomRequiresModifier;
controls.zoomSpeed = 1.05;
controls.rotateSpeed = 0.75;
controls.panSpeed = 0.85;
controls.minPolarAngle = 0.001;
controls.maxPolarAngle = Math.PI * 0.5 - 0.02;

// manual zoom (ctrl/cmd + wheel)
function manualWheelZoom(e){
  if (!CAMERA.wheelZoomRequiresModifier) return;
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  e.stopPropagation();

  const factor = Math.exp(e.deltaY * 0.0012);
  const target = controls.target;
  const dir = new THREE.Vector3().subVectors(camera.position, target);
  const dist = dir.length();
  if (dist <= 1e-6) return;

  let newDist = dist * factor;
  newDist = THREE.MathUtils.clamp(newDist, controls.minDistance || 0.01, controls.maxDistance || 1e9);
  dir.normalize().multiplyScalar(newDist);
  camera.position.copy(target).add(dir);
  camera.updateMatrixWorld();
  controls.update();
}
renderer.domElement.addEventListener('wheel', manualWheelZoom, { passive:false });

// lights
const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 0.9);
key.position.set(7, 12, 8);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 300;
scene.add(key);
scene.add(key.target);

const fill = new THREE.DirectionalLight(0xffffff, 0.35);
fill.position.set(-10, 6, -7);
scene.add(fill);

// fog
scene.fog = new THREE.Fog(DAY_NIGHT.dayFog, 40, 210);

// WORLD/TERRAIN
const worldParams = {
  frequency: WORLD.frequency,
  amplitude: WORLD.amplitude,
  seed: WORLD.seed,
  trackHalfWidth: WORLD.trackHalfWidth,
  roadLevel: WORLD.roadLevel,
};
const { terrainY } = createTerrainMath(worldParams);

const { group: envGroup } = makeLowPolyEnvironment({
  world: worldParams,
  size: WORLD.envSize,
  segments: WORLD.envSegments,
});
scene.add(envGroup);

// groundYAt helper
function groundYAt(x, z){
  const half = WORLD.envSize * 0.5;
  if (Math.abs(x) > half || Math.abs(z) > half) return CAMERA.floorY;
  return terrainY(x, z);
}

// markers
const markers = createMissionMarkers(scene, groundYAt);

// day/night
const dayNight = createDayNight({
  scene,
  renderer,
  fog: scene.fog,
  ambient,
  key,
  fill,
  dayNight: DAY_NIGHT,
  timeValEl: dom.timeVal,
});

// time controls
createTimeControls(dom, DAY_NIGHT, () => {
  hud.setStatus({
    modeDrive: MODE.drive,
    chaseOn: MODE.chaseCam,
    paintColorHex: solidColor,
    timeMode: DAY_NIGHT.manual ? 'manual' : 'auto',
    timeModeMeta: DAY_NIGHT.manual ? '' : `${DAY_NIGHT.periodSec}s`,
  });
  hud.render();
});

// input
const helpersRef = { value: true };

const input = createInput({
  onToggleMode: () => { MODE.drive = !MODE.drive; hud.render(); },
  onToggleChase: () => { MODE.chaseCam = !MODE.chaseCam; hud.render(); },
  onToggleHelpers: () => { helpersRef.value = !helpersRef.value; },
  onToggleTimeMode: () => {
    DAY_NIGHT.manual = !DAY_NIGHT.manual;
    if (dom.timeAuto) dom.timeAuto.textContent = DAY_NIGHT.manual ? 'Manual' : 'Auto';
    if (dom.timeSlider) dom.timeSlider.style.opacity = DAY_NIGHT.manual ? '1' : '0.35';
  },
  onPaintKey: (n) => {
    if (n === 1) setPaint(PAINT.orange, 'orange');
    if (n === 2) setPaint(PAINT.navy, 'navy');
    if (n === 3) setPaint(PAINT.stock, 'stock');
  },
});

function setActivePaint(which){
  dom.btnStock?.setAttribute('data-active', which === 'stock' ? '1' : '0');
  dom.btnOrange?.setAttribute('data-active', which === 'orange' ? '1' : '0');
  dom.btnNavy?.setAttribute('data-active', which === 'navy' ? '1' : '0');
}

function setPaint(hex, which){
  solidColor = hex;
  vehicle.setColor(hex);
  setActivePaint(which);
  hud.setStatus({
    modeDrive: MODE.drive,
    chaseOn: MODE.chaseCam,
    paintColorHex: solidColor,
    timeMode: DAY_NIGHT.manual ? 'manual' : 'auto',
    timeModeMeta: DAY_NIGHT.manual ? '' : `${DAY_NIGHT.periodSec}s`,
  });
  hud.render();
}

dom.btnStock?.addEventListener('click', () => setPaint(PAINT.stock, 'stock'));
dom.btnOrange?.addEventListener('click', () => setPaint(PAINT.orange, 'orange'));
dom.btnNavy?.addEventListener('click', () => setPaint(PAINT.navy, 'navy'));
setActivePaint('stock');

// vehicle loader
const vehicle = createVehicle({
  scene,
  renderer,
  modelUrl: MODEL_URL,
  solid: { forceSolidColor: SOLID.forceSolidColor, mat: SOLID.mat },
  paintHex: solidColor,
  fallbackPng: FALLBACK_PNG_1x1,
  onWarn: (m) => hud.pushWarn(m),
});

// physics
const physics = createVehiclePhysics({
  model: vehicle.model,
  terrainY,
  trackClampZ: 1.25,
  phys: VEHICLE.phys,
});

// drive
const drive = createDriveController({
  model: vehicle.model,
  input: input.INPUT,
  dashboard,
  cfg: {
    ...VEHICLE.drive,
    trackHalfWidth: WORLD.trackHalfWidth,
  },
  mode: MODE,
  controls,
  camera,
});

// missions runtime (auto A)
const missionRuntime = createMissionRuntime({
  missions: MISSIONS,
  rules: MISSION_RULES,
  ui: missionsUi,
  markers: {
    setFromMission: (m, stage) => markers.setFromMission(m, stage),
  },
  groundYAt,
});

missionRuntime.init();

// minimap pin provider
function getMissionPin(){
  const m = missionRuntime.current();
  if (!m) return null;
  if (missionRuntime.state.stage === 'toPickup') return { pt: m.pickup, color: 'rgba(34,197,94,0.95)' };
  return { pt: m.drop, color: 'rgba(239,68,68,0.95)' };
}

const minimap = createMinimap({
  dom,
  scene,
  model: vehicle.model,
  cfg: MINIMAP,
  helpersRef,
  getMissionPin,
});

// camera floor clamp
function enforceAboveFloor(){
  const tx = controls.target.x;
  const tz = controls.target.z;
  const cx = camera.position.x;
  const cz = camera.position.z;

  const tMin = Math.max(CAMERA.targetMinY, CAMERA.terrainClamp ? (groundYAt(tx, tz) + CAMERA.targetTerrainClearance) : CAMERA.floorY);
  const cMin = Math.max(CAMERA.minY, CAMERA.terrainClamp ? (groundYAt(cx, cz) + CAMERA.cameraTerrainClearance) : CAMERA.floorY);

  if (controls.target.y < tMin) controls.target.y = tMin;
  if (camera.position.y < cMin) camera.position.y = cMin;
}

// floating cam
const camFloat = { prev: new THREE.Vector3() };
function applyFloatingCamera(t){
  if (!CAMERA.floating) return;

  camera.position.sub(camFloat.prev);
  camFloat.prev.set(0,0,0);

  const target = controls.target;
  const dist = Math.max(0.001, camera.position.distanceTo(target));
  const amp = Math.min(dist * CAMERA.floatPosStrength, CAMERA.floatMaxOffset);

  const ox = (Math.sin(t * CAMERA.floatFreqA + 0.35) + Math.sin(t * CAMERA.floatFreqB + 1.70)) * 0.5 * amp;
  const oz = (Math.cos(t * (CAMERA.floatFreqA * 0.92) + 2.10) + Math.cos(t * (CAMERA.floatFreqB * 1.08) + 0.90)) * 0.5 * amp;
  const oy = (Math.sin(t * CAMERA.floatFreqC + 2.40)) * Math.min(dist * CAMERA.floatYStrength, CAMERA.floatMaxY);

  camFloat.prev.set(ox, oy, oz);
  camera.position.add(camFloat.prev);

  enforceAboveFloor();
}

// self tests
runSelfTests({
  MODEL_URL,
  FALLBACK_PNG_1x1,
  missions: MISSIONS,
  terrainY,
  roadLevel: WORLD.roadLevel,
  onWarn: (m) => hud.pushWarn(m),
});

// load model then start
const clock = new THREE.Clock();

hud.setStatus({
  modeDrive: MODE.drive,
  chaseOn: MODE.chaseCam,
  paintColorHex: solidColor,
  timeMode: DAY_NIGHT.manual ? 'manual' : 'auto',
  timeModeMeta: DAY_NIGHT.manual ? '' : `${DAY_NIGHT.periodSec}s`,
});
hud.render();

vehicle.load()
  .then(() => {
    physics.init();

    // sync markers for current mission stage
    markers.setFromMission(missionRuntime.current(), missionRuntime.state.stage);

    hud.hideLoader();
  })
  .catch((err) => {
    console.error('GLB load failed:', err);
    hud.pushWarn('glb load failed');
    hud.hideLoader();
  });

function applyScroll(p){
  const root = vehicle.model.root;
  const base = vehicle.model.base;
  if (!root || !base) return;
  root.rotation.y = base.rot.y + p * Math.PI * 1.6;
  root.rotation.x = base.rot.x + (p - 0.5) * 0.08;
  root.position.x = base.pos.x + VEHICLE.forwardOffset;
  root.position.z = base.pos.z;
}

function getScrollProgress(){
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
}

let prevScrollY = window.scrollY;
let prevT = performance.now();
function updateDriveFromScroll(){
  if (MODE.drive) return;
  const now = performance.now();
  const dt = Math.max(0.001, (now - prevT) / 1000);
  const dy = (window.scrollY - prevScrollY);
  prevScrollY = window.scrollY;
  prevT = now;

  const v = Math.abs(dy) / dt;
  const targetKmh = THREE.MathUtils.clamp(v * 0.032, 0, 160);
  dashboard.updateFromSpeed(targetKmh / 3.6, dt);
}

function tick(){
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  dayNight.update(t);
  updateDriveFromScroll();

  if (vehicle.model.mixer) vehicle.model.mixer.update(dt);

  if (MODE.drive) drive.step(dt);
  else applyScroll(getScrollProgress());

  physics.step(dt);

  // mission auto
  if (vehicle.model.root){
    missionRuntime.step(vehicle.model.root.position);
    markers.setFromMission(missionRuntime.current(), missionRuntime.state.stage);
  }

  controls.update();
  enforceAboveFloor();
  applyFloatingCamera(t);

  renderer.render(scene, camera);
  minimap.render();

  requestAnimationFrame(tick);
}
tick();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, RENDER.maxDpr));

  minimap.resize();
}, { passive:true });
```

---

Если дальше идём “как надо”, следующий шаг такой:

1. я дам **недостающий файл `src/world/markers.js` в формате, который реально совпадает с вызовами из `main.js`** (там сейчас сигнатуры слегка отличаются),
2. и коротко сверю все импорты/экспорты, чтобы **проект сразу собирался** без ручной правки.

Сказать “давай синхронизируй markers/minimap вызовы” — и я выдам исправленные 2–3 файла точечно.

