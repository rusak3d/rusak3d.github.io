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
