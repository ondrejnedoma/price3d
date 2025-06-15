import { Vector3 } from "three";
import { STLLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import { ThreeMFLoader } from "three-stdlib";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

function signedVolumeOfTriangle(p1, p2, p3) {
  return p1.dot(p2.clone().cross(p3)) / 6;
}

function areaOfTriangle(p1, p2, p3) {
  const v1 = p2.clone().sub(p1);
  const v2 = p3.clone().sub(p1);
  return v1.cross(v2).length() / 2;
}

function computeMetrics(geometry) {
  let geom = geometry.clone();
  if (geom.index) geom = geom.toNonIndexed();
  const pos = geom.attributes.position;
  let volume = 0,
    surface = 0;

  const p1 = new Vector3(),
    p2 = new Vector3(),
    p3 = new Vector3();

  for (let i = 0; i < pos.count; i += 3) {
    p1.fromBufferAttribute(pos, i);
    p2.fromBufferAttribute(pos, i + 1);
    p3.fromBufferAttribute(pos, i + 2);

    volume += signedVolumeOfTriangle(p1, p2, p3);
    surface += areaOfTriangle(p1, p2, p3);
  }

  return {
    volume: Math.abs(volume).toFixed(2),
    surfaceArea: surface.toFixed(2),
  };
}

async function loadSTL(file) {
  const buffer = await readFileAsArrayBuffer(file);
  const loader = new STLLoader();
  return loader.parse(buffer);
}

async function loadOBJ(file) {
  const data = await readFileAsText(file);
  const loader = new OBJLoader();
  const obj = loader.parse(data);

  const geometries = [];
  obj.traverse((child) => {
    if (child.isMesh && child.geometry) {
      geometries.push(child.geometry);
    }
  });

  return BufferGeometryUtils.mergeGeometries(geometries, false);
}

async function load3MF(file) {
  const buffer = await readFileAsArrayBuffer(file);
  const loader = new ThreeMFLoader();
  const obj = loader.parse(buffer);

  const geometries = [];
  obj.traverse((child) => {
    if (child.isMesh && child.geometry) {
      geometries.push(child.geometry);
    }
  });

  return BufferGeometryUtils.mergeGeometries(geometries, false);
}

export default async function calc(file) {
  const name = file.name;
  let geometry;
  if (name.endsWith(".stl")) {
    geometry = await loadSTL(file);
  } else if (name.endsWith(".obj")) {
    geometry = await loadOBJ(file);
  } else if (name.endsWith(".3mf")) {
    geometry = await load3MF(file);
  } else {
    console.error("Unsupported file type. Use STL, OBJ, or 3MF.");
    process.exit(1);
  }

  return computeMetrics(geometry);
}
