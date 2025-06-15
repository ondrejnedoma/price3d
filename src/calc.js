import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Vector3,
  Mesh,
  MeshNormalMaterial,
  AmbientLight,
  DirectionalLight,
  Box3,
  MeshStandardMaterial,
  MeshPhongMaterial,
} from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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

function renderGeometryToImage(geometry, width = 512, height = 512) {
  const scene = new Scene();
  const renderer = new WebGLRenderer({
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.setSize(width, height);

  const material = new MeshStandardMaterial({
    color: 0x3b82f6,
    flatShading: true,
  });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  // Auto-center and frame the geometry
  const box = new Box3().setFromObject(mesh);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3()).length();
  mesh.position.sub(center);

  const aspect = width / height;
  const d = size * 0.5;
  const camera = new OrthographicCamera(
    -d * aspect, // left
    d * aspect, // right
    d, // top
    -d, // bottom
    0.1, // near
    1000, // far
  );
  camera.up.set(0, 0, 1);
  camera.position.set(d, d, d);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  // Lighting
  scene.add(new AmbientLight(0xffffff, 0.3));
  const light = new DirectionalLight(0xffffff, 1.5);
  light.position.set(2, 5, 3);
  scene.add(light);

  renderer.render(scene, camera);
  return renderer.domElement.toDataURL(); // base64 image string
}

export default async function calc(file) {
  const name = file.name.toLowerCase();
  let geometry;

  if (name.endsWith(".stl")) {
    geometry = await loadSTL(file);
  } else if (name.endsWith(".obj")) {
    geometry = await loadOBJ(file);
  } else if (name.endsWith(".3mf")) {
    geometry = await load3MF(file);
  } else {
    throw new Error("Unsupported file type. Use STL, OBJ, or 3MF.");
  }

  const metrics = computeMetrics(geometry);
  const imageData = renderGeometryToImage(geometry);

  return {
    ...metrics,
    previewImage: imageData, // base64 PNG string
  };
}
