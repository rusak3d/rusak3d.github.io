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
