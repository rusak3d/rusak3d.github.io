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
