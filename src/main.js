import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const viewport = document.querySelector('#viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071015);
scene.fog = new THREE.FogExp2(0x071015, 0.018);

const camera = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 120);
camera.position.set(15, 18, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.domElement.setAttribute('aria-label', 'โมเดลโรงงานสามมิติแบบโต้ตอบ');
renderer.domElement.tabIndex = 0;
viewport.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.minDistance = 6;
controls.maxDistance = 42;
controls.maxPolarAngle = Math.PI * 0.47;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xbbeff0, 0x102129, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-8, 18, 11);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -18;
keyLight.shadow.camera.right = 18;
keyLight.shadow.camera.top = 22;
keyLight.shadow.camera.bottom = -22;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x35d7d0, 1.0);
rimLight.position.set(16, 8, -15);
scene.add(rimLight);

const planWidth = 18.5;
const planDepth = 20;
const planPixels = { width: 1184, height: 1280 };
const worldFromPixel = (x, y) => ({
  x: (x / planPixels.width - 0.5) * planWidth,
  z: (y / planPixels.height - 0.5) * planDepth,
});

const textureLoader = new THREE.TextureLoader();
const planTexture = textureLoader.load('./assets/factory-layout.jpg', () => {
  planTexture.colorSpace = THREE.SRGBColorSpace;
  document.querySelector('#loading-screen').classList.add('done');
});
planTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const planMaterial = new THREE.MeshStandardMaterial({
  map: planTexture,
  transparent: true,
  opacity: 0.33,
  roughness: 0.92,
  metalness: 0.02,
});
const planFloor = new THREE.Mesh(new THREE.PlaneGeometry(planWidth, planDepth), planMaterial);
planFloor.rotation.x = -Math.PI / 2;
planFloor.receiveShadow = true;
scene.add(planFloor);

const base = new THREE.Mesh(
  new THREE.BoxGeometry(planWidth + 0.5, 0.28, planDepth + 0.5),
  new THREE.MeshStandardMaterial({ color: 0x13242a, roughness: 0.8, metalness: 0.18 }),
);
base.position.y = -0.18;
base.receiveShadow = true;
scene.add(base);

const grid = new THREE.GridHelper(34, 34, 0x214e55, 0x16353b);
grid.position.y = -0.31;
scene.add(grid);

const lineTypes = {
  HYD: { name: '3P HYD', color: '#55c88a', controller: 'FANUC 0i-MF' },
  TMC: { name: 'TM C28, C63', color: '#ff6b63', controller: 'FANUC 31i-B' },
  HST: { name: 'HST COMBINED', color: '#e6d855', controller: 'Mitsubishi M80' },
  VALVE: { name: 'LOADER VALVE 2', color: '#6f777a', controller: 'Mixed controllers' },
  GH4B: { name: 'GH4B', color: '#64aef2', controller: 'FANUC 0i-MF Plus' },
  CLUTCH: { name: 'CLUTCH CYLINDER', color: '#ff9d2d', controller: 'Mitsubishi M80' },
  TMBX: { name: 'TM BX [NEW MODEL]', color: '#9a78d0', controller: 'FANUC 31i-B5 Plus' },
};

const zones = [
  { id: 'hyd-main', type: 'HYD', rect: [225, 244, 350, 669], machines: 7 },
  { id: 'tmc-main', type: 'TMC', rect: [354, 247, 456, 670], machines: 7 },
  { id: 'hst-main', type: 'HST', rect: [458, 247, 544, 671], machines: 6 },
  { id: 'gh4b-main', type: 'GH4B', rect: [550, 247, 633, 477], machines: 3 },
  { id: 'clutch-main', type: 'CLUTCH', rect: [552, 484, 631, 535], machines: 2 },
  { id: 'valve-main', type: 'VALVE', rect: [552, 537, 634, 668], machines: 3 },
  { id: 'tmbx-main', type: 'TMBX', rect: [669, 244, 916, 669], machines: 10 },
  { id: 'tmc-mid-a', type: 'TMC', rect: [226, 768, 351, 901], machines: 4 },
  { id: 'hst-mid-a', type: 'HST', rect: [353, 768, 431, 901], machines: 3 },
  { id: 'tmbx-mid-a', type: 'TMBX', rect: [432, 766, 634, 901], machines: 6 },
  { id: 'tmc-mid-b', type: 'TMC', rect: [668, 765, 845, 901], machines: 5 },
  { id: 'tmbx-mid-b', type: 'TMBX', rect: [846, 707, 1042, 900], machines: 6 },
  { id: 'valve-low', type: 'VALVE', rect: [226, 921, 453, 1019], machines: 5 },
  { id: 'hyd-low', type: 'HYD', rect: [456, 922, 530, 1018], machines: 2 },
  { id: 'gh4b-low', type: 'GH4B', rect: [531, 922, 635, 1018], machines: 3 },
  { id: 'hst-low', type: 'HST', rect: [668, 918, 751, 1017], machines: 2 },
  { id: 'tmc-bottom-a', type: 'TMC', rect: [227, 1040, 387, 1111], machines: 3 },
  { id: 'hst-bottom-a', type: 'HST', rect: [227, 1111, 387, 1216], machines: 4 },
  { id: 'tmbx-bottom-a', type: 'TMBX', rect: [392, 1040, 495, 1217], machines: 4 },
  { id: 'tmbx-bottom-b', type: 'TMBX', rect: [544, 1040, 650, 1218], machines: 4 },
  { id: 'tmbx-bottom-c', type: 'TMBX', rect: [669, 1040, 780, 1218], machines: 4 },
  { id: 'tmc-bottom-b', type: 'TMC', rect: [780, 1040, 876, 1218], machines: 4 },
];

// Read-only snapshot from the canonical Machine Master Production v4 API.
// Positions are visual approximations until the AutoCAD DXF is available.
const loaderValve2Machines = [
  {
    machineId: 'MC049', masterId: 'KPMT-MC-0081', machineName: 'CNC MACHINING LV2-OP2',
    brand: 'MAKINO', model: 'J4', station: 'OP2', controller: 'FANUC SERIES : 210i-MB', priority: 'A', modelType: 'makino-j4',
  },
  {
    machineId: 'MC050', masterId: 'KPMT-MC-0082', machineName: 'CNC MACHINING LV2-OP3',
    brand: 'MAKINO', model: 'J4', station: 'OP3', controller: 'FANUC SERIES : 210i-MB', priority: 'A', modelType: 'makino-j4',
  },
  {
    machineId: 'MC051', masterId: 'KPMT-MC-0083', machineName: 'CNC MACHINING LV2-OP4',
    brand: 'MAKINO', model: 'J4', station: 'OP4', controller: 'FANUC SERIES : 210i-MB', priority: 'A', modelType: 'makino-j4',
  },
  {
    machineId: 'MC048', masterId: 'KPMT-MC-0080', machineName: 'CNC MACHINING LV2-OP1',
    brand: 'MORISEIKI', model: 'NV4000 DCG', station: 'OP1', controller: 'FANUC SERIES : 31i-B', priority: 'A',
  },
  {
    machineId: 'HN005', masterId: 'KPMT-MC-0084', machineName: 'HONING MACHINE LV2-ST1-OP5',
    brand: 'TOYO', model: 'SL7', station: 'ST1-OP5', controller: 'PLC', priority: 'B',
  },
  {
    machineId: 'HN006', masterId: 'KPMT-MC-0085', machineName: 'HONING MACHINE LV2-ST2-OP6',
    brand: 'TOYO', model: 'SL7', station: 'ST2-OP6', controller: 'PLC', priority: 'B',
  },
  {
    machineId: 'WA016', masterId: 'KPMT-MC-0086', machineName: 'WASHING MACHINE LV2-OP7',
    brand: 'KATAOKA', model: 'SPC-203-B', station: 'OP7', controller: 'PLC', priority: 'B',
  },
  {
    machineId: 'ES004', masterId: 'KPMT-MC-0087', machineName: 'END SCOPE LV1-OP8',
    brand: 'MAPOSS', model: 'E4N LVDT', station: 'OP8', controller: '—', priority: 'B',
  },
];
let loaderValve2Cursor = 0;

const statusSequence = ['RUNNING', 'RUNNING', 'IDLE', 'RUNNING', 'PM', 'RUNNING', 'ALARM'];
const statusColors = { RUNNING: '#35d7d0', IDLE: '#8d9ba0', PM: '#ffb33f', ALARM: '#ff5d5d', ACTIVE: '#55c88a' };
const machineRoots = [];
const interactiveParts = [];
const lineGroups = new Map();
const lineBounds = new Map();
const lineCounters = Object.fromEntries(Object.keys(lineTypes).map((key) => [key, 0]));

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.28, ...options });
}

function addInteractiveMesh(group, geometry, meshMaterial, position, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.machineRoot = group;
  interactiveParts.push(mesh);
  group.add(mesh);
  return mesh;
}

function makeLabelSprite(text, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 340;
  canvas.height = 92;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(4, 16, 20, .92)';
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(4, 4, 332, 84, 18);
  context.fill();
  context.stroke();
  context.fillStyle = '#e9ffff';
  context.font = '600 34px Bahnschrift, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 170, 49);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(1.65, 0.45, 1);
  sprite.renderOrder = 9;
  return sprite;
}

function createCncMachine(data, size) {
  const group = new THREE.Group();
  group.userData = data;
  const accent = new THREE.Color(lineTypes[data.lineType].color);
  const bodyMaterial = material(0xd7e0df);
  bodyMaterial.emissive = accent.clone();
  bodyMaterial.emissiveIntensity = 0.025;
  const darkMaterial = material(0x13262b, { roughness: 0.38, metalness: 0.45 });
  const glassMaterial = material(0x163842, { roughness: 0.15, metalness: 0.12, emissive: 0x0f7480, emissiveIntensity: 0.18 });
  const accentMaterial = material(accent, { emissive: accent, emissiveIntensity: 0.28 });

  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), bodyMaterial, [0, size.h / 2, 0], [size.w, size.h, size.d]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), darkMaterial, [0.08 * size.w, size.h * 0.56, size.d * 0.505], [size.w * 0.58, size.h * 0.48, 0.035]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), glassMaterial, [0.08 * size.w, size.h * 0.58, size.d * 0.527], [size.w * 0.42, size.h * 0.28, 0.025]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), accentMaterial, [size.w * 0.42, size.h * 0.57, size.d * 0.55], [size.w * 0.12, size.h * 0.24, 0.08]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), darkMaterial, [0, size.h + 0.06, 0], [size.w * 0.34, 0.12, size.d * 0.45]);

  const statusMaterial = material(statusColors[data.status], { emissive: statusColors[data.status], emissiveIntensity: 1.4 });
  addInteractiveMesh(group, new THREE.CylinderGeometry(0.04, 0.04, 0.32, 10), darkMaterial, [-size.w * 0.35, size.h + 0.24, -size.d * 0.2]);
  addInteractiveMesh(group, new THREE.CylinderGeometry(0.07, 0.07, 0.11, 12), statusMaterial, [-size.w * 0.35, size.h + 0.43, -size.d * 0.2]);

  group.userData.bodyMaterial = bodyMaterial;
  const label = makeLabelSprite(data.machineId, lineTypes[data.lineType].color);
  label.position.set(0, size.h + 0.85, 0);
  label.visible = false;
  group.userData.label = label;
  group.add(label);
  return group;
}

function createMakinoJ4(data, size) {
  const group = new THREE.Group();
  group.userData = data;
  const accent = new THREE.Color(0x26c6ee);
  const whiteMaterial = material(0xe6e9e5, { roughness: 0.72, metalness: 0.12 });
  whiteMaterial.emissive = accent.clone();
  whiteMaterial.emissiveIntensity = 0.025;
  const darkMaterial = material(0x10191c, { roughness: 0.4, metalness: 0.52 });
  const windowMaterial = material(0x071012, { roughness: 0.12, metalness: 0.16, emissive: 0x0e5260, emissiveIntensity: 0.12 });
  const panelMaterial = material(0x243136, { roughness: 0.44, metalness: 0.48 });
  const makinoBlue = material(0x1799c5, { emissive: 0x07546d, emissiveIntensity: 0.35 });
  const locatorMaterial = material(0x26c6ee, { transparent: true, opacity: 0.42, emissive: 0x26c6ee, emissiveIntensity: 0.8 });

  const w = size.w * 1.08;
  const h = size.h * 1.28;
  const d = size.d * 1.06;

  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), locatorMaterial, [0, 0.035, 0], [w * 1.24, 0.045, d * 1.2]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), darkMaterial, [0, 0.13, 0], [w * 0.96, 0.2, d]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), whiteMaterial, [0, h * 0.56, -d * 0.1], [w, h * 0.88, d * 0.78]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), whiteMaterial, [-w * 0.22, h * 0.34, d * 0.38], [w * 0.56, h * 0.54, d * 0.34]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), whiteMaterial, [w * 0.26, h * 0.37, d * 0.38], [w * 0.35, h * 0.6, d * 0.32]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), windowMaterial, [-w * 0.23, h * 0.43, d * 0.56], [w * 0.26, h * 0.26, 0.025]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), panelMaterial, [w * 0.32, h * 0.46, d * 0.57], [w * 0.17, h * 0.38, 0.06]);
  addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), makinoBlue, [-w * 0.05, h * 0.63, d * 0.57], [w * 0.18, 0.035, 0.035]);

  const roof = addInteractiveMesh(group, new THREE.BoxGeometry(1, 1, 1), whiteMaterial, [0, h * 1.02, -d * 0.12], [w * 0.78, h * 0.28, d * 0.74]);
  roof.rotation.z = -0.16;

  const statusMaterial = material(statusColors.ACTIVE, { emissive: statusColors.ACTIVE, emissiveIntensity: 1.25 });
  addInteractiveMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 0.28, 10), darkMaterial, [-w * 0.38, h * 1.16, -d * 0.2]);
  addInteractiveMesh(group, new THREE.CylinderGeometry(0.065, 0.065, 0.1, 12), statusMaterial, [-w * 0.38, h * 1.34, -d * 0.2]);

  group.userData.bodyMaterial = whiteMaterial;
  const label = makeLabelSprite(`${data.machineId} · ${data.station}`, '#26c6ee');
  label.scale.set(0.8, 0.22, 1);
  label.position.set(0, h + 0.72, 0);
  label.visible = false;
  group.userData.label = label;
  group.add(label);
  return group;
}

function createZone(zone) {
  const [x1, y1, x2, y2] = zone.rect;
  const a = worldFromPixel(x1, y1);
  const b = worldFromPixel(x2, y2);
  const width = Math.abs(b.x - a.x);
  const depth = Math.abs(b.z - a.z);
  const center = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
  const line = lineTypes[zone.type];
  const group = new THREE.Group();
  group.userData = { lineType: zone.type, zoneId: zone.id, center, width, depth };
  scene.add(group);

  const zoneMaterial = material(line.color, { transparent: true, opacity: 0.24, roughness: 0.8, metalness: 0.06 });
  const zoneFloor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, depth), zoneMaterial);
  zoneFloor.position.set(center.x, 0.055, center.z);
  zoneFloor.receiveShadow = true;
  group.add(zoneFloor);

  const outlineMaterial = new THREE.LineBasicMaterial({ color: line.color, transparent: true, opacity: 0.78 });
  const outlinePoints = [
    new THREE.Vector3(center.x - width / 2, 0.105, center.z - depth / 2),
    new THREE.Vector3(center.x + width / 2, 0.105, center.z - depth / 2),
    new THREE.Vector3(center.x + width / 2, 0.105, center.z + depth / 2),
    new THREE.Vector3(center.x - width / 2, 0.105, center.z + depth / 2),
    new THREE.Vector3(center.x - width / 2, 0.105, center.z - depth / 2),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outlinePoints), outlineMaterial));

  const longAxisIsDepth = depth >= width;
  const columns = longAxisIsDepth ? Math.min(2, zone.machines) : Math.min(4, zone.machines);
  const rows = Math.ceil(zone.machines / columns);
  const cellW = width / Math.max(columns, 1);
  const cellD = depth / Math.max(rows, 1);
  const machineW = Math.max(0.34, Math.min(0.75, cellW * 0.56));
  const machineD = Math.max(0.38, Math.min(0.82, cellD * 0.54));
  const machineH = Math.max(0.48, Math.min(0.78, Math.min(machineW, machineD) * 1.15));

  for (let index = 0; index < zone.machines; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = center.x - width / 2 + cellW * (column + 0.5);
    const z = center.z - depth / 2 + cellD * (row + 0.5);
    lineCounters[zone.type] += 1;
    const sequence = String(lineCounters[zone.type]).padStart(2, '0');
    const actualMachine = zone.type === 'VALVE' ? loaderValve2Machines[loaderValve2Cursor++] : null;
    const status = actualMachine ? 'ACTIVE' : statusSequence[(index + lineCounters[zone.type]) % statusSequence.length];
    const machineData = actualMachine ? {
      ...actualMachine,
      lineType: zone.type,
      lineName: 'LOADER VALVE 2',
      status,
      dataSource: 'Machine Master Production v4',
      positionAccuracy: 'Approximate from plotted layout',
      verifiedMaster: true,
    } : {
      machineId: `${zone.type}-${sequence}`,
      masterId: `MM-DEMO-${zone.type}-${sequence}`,
      lineType: zone.type,
      lineName: line.name,
      controller: line.controller,
      status,
      dataSource: 'Demo data',
      positionAccuracy: 'Visual simulation',
      verifiedMaster: false,
    };
    const machine = actualMachine?.modelType === 'makino-j4'
      ? createMakinoJ4(machineData, { w: machineW, h: machineH, d: machineD })
      : createCncMachine(machineData, { w: machineW, h: machineH, d: machineD });
    machine.position.set(x, 0.12, z);
    machine.rotation.y = longAxisIsDepth ? Math.PI / 2 : 0;
    group.add(machine);
    machineRoots.push(machine);
  }

  if (!lineGroups.has(zone.type)) lineGroups.set(zone.type, []);
  lineGroups.get(zone.type).push(group);
  if (!lineBounds.has(zone.type)) lineBounds.set(zone.type, new THREE.Box3());
  lineBounds.get(zone.type).expandByObject(group);
}

zones.forEach(createZone);
document.querySelector('#machine-total').textContent = machineRoots.length;

const perimeterMaterial = material(0x244149, { roughness: 0.72, metalness: 0.18 });
const wallHeight = 0.42;
const wallThickness = 0.12;
[
  [0, wallHeight / 2, -planDepth / 2, planWidth, wallHeight, wallThickness],
  [0, wallHeight / 2, planDepth / 2, planWidth, wallHeight, wallThickness],
  [-planWidth / 2, wallHeight / 2, 0, wallThickness, wallHeight, planDepth],
  [planWidth / 2, wallHeight / 2, 0, wallThickness, wallHeight, planDepth],
].forEach(([x, y, z, w, h, d]) => {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), perimeterMaterial);
  wall.position.set(x, y, z);
  wall.castShadow = true;
  scene.add(wall);
});

const lineCounts = machineRoots.reduce((counts, machine) => {
  counts[machine.userData.lineType] = (counts[machine.userData.lineType] || 0) + 1;
  return counts;
}, {});

const lineList = document.querySelector('#line-list');
Object.entries(lineTypes).forEach(([key, line]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'line-button';
  button.dataset.line = key;
  button.style.setProperty('--line-color', line.color);
  button.innerHTML = `<span class="line-swatch"></span><span class="line-name">${line.name}</span><span class="line-count">${lineCounts[key] || 0}</span>`;
  button.addEventListener('click', () => {
    focusLine(key);
    if (window.matchMedia('(max-width: 780px)').matches) closeMobilePanels();
  });
  lineList.append(button);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.querySelector('#hover-tooltip');
let hoveredMachine = null;
let selectedMachine = null;
let cameraTween = null;
let focusedLine = null;
let focusedModelType = null;

function hasPersistentLabel(machine) {
  return Boolean(
    focusedLine
    && machine?.userData.verifiedMaster
    && machine.userData.lineType === focusedLine
    && (!focusedModelType || machine.userData.modelType === focusedModelType),
  );
}

const selectionRing = new THREE.Mesh(
  new THREE.RingGeometry(0.48, 0.58, 48),
  new THREE.MeshBasicMaterial({ color: 0x35d7d0, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthTest: false }),
);
selectionRing.rotation.x = -Math.PI / 2;
selectionRing.visible = false;
selectionRing.renderOrder = 8;
scene.add(selectionRing);

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function getMachineFromPointer(event) {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactiveParts, false)[0];
  return hit?.object.userData.machineRoot || null;
}

function setHoveredMachine(machine, event) {
  if (hoveredMachine && hoveredMachine !== selectedMachine) {
    hoveredMachine.userData.bodyMaterial.emissiveIntensity = 0.025;
    hoveredMachine.userData.label.visible = hasPersistentLabel(hoveredMachine);
  }
  hoveredMachine = machine;
  if (!machine) {
    tooltip.style.display = 'none';
    renderer.domElement.style.cursor = 'grab';
    return;
  }
  machine.userData.bodyMaterial.emissiveIntensity = 0.28;
  machine.userData.label.visible = true;
  tooltip.textContent = `${machine.userData.machineId}${machine.userData.station ? ` · ${machine.userData.station}` : ''} · ${machine.userData.status}`;
  tooltip.style.display = 'block';
  tooltip.style.left = `${event.clientX + 14}px`;
  tooltip.style.top = `${event.clientY + 14}px`;
  renderer.domElement.style.cursor = 'pointer';
}

renderer.domElement.addEventListener('pointermove', (event) => setHoveredMachine(getMachineFromPointer(event), event));
renderer.domElement.addEventListener('pointerleave', () => setHoveredMachine(null, { clientX: 0, clientY: 0 }));
renderer.domElement.addEventListener('click', (event) => {
  const machine = getMachineFromPointer(event);
  if (machine) selectMachine(machine);
});

function selectMachine(machine) {
  if (selectedMachine && selectedMachine !== machine) {
    selectedMachine.userData.bodyMaterial.emissiveIntensity = 0.025;
    selectedMachine.userData.label.visible = hasPersistentLabel(selectedMachine);
  }
  selectedMachine = machine;
  machine.userData.bodyMaterial.emissiveIntensity = 0.42;
  machine.userData.label.visible = true;
  const position = new THREE.Vector3();
  machine.getWorldPosition(position);
  selectionRing.position.set(position.x, 0.14, position.z);
  selectionRing.visible = true;

  document.querySelector('#empty-state').hidden = true;
  const detail = document.querySelector('#machine-detail');
  detail.hidden = false;
  document.querySelector('#detail-machine-id').textContent = machine.userData.machineId;
  document.querySelector('#detail-name').textContent = machine.userData.machineName || 'Demo CNC machine';
  document.querySelector('#detail-line').textContent = machine.userData.lineName;
  document.querySelector('#detail-master-id').textContent = machine.userData.masterId;
  document.querySelector('#detail-controller').textContent = machine.userData.controller;
  document.querySelector('#detail-model').textContent = machine.userData.brand
    ? `${machine.userData.brand} ${machine.userData.model}`
    : 'Generic CNC (Demo)';
  document.querySelector('#detail-station').textContent = machine.userData.station || '—';
  document.querySelector('#detail-priority').textContent = machine.userData.priority || '—';
  document.querySelector('#detail-source').textContent = machine.userData.dataSource;
  document.querySelector('#detail-position').textContent = machine.userData.positionAccuracy;
  document.querySelector('#detail-connection').textContent = machine.userData.verifiedMaster
    ? 'Read-only verified snapshot'
    : 'Demo / Offline';
  const status = document.querySelector('#detail-status');
  status.textContent = machine.userData.status;
  status.style.color = statusColors[machine.userData.status];
  status.style.background = `${statusColors[machine.userData.status]}14`;
  if (window.matchMedia('(max-width: 780px)').matches) {
    closeMobilePanels();
    document.querySelector('.machine-panel').classList.add('mobile-open');
    document.querySelector('#mobile-machine').classList.add('active');
  }
}

function tweenCamera(position, target) {
  cameraTween = {
    startPosition: camera.position.clone(),
    endPosition: position.clone(),
    startTarget: controls.target.clone(),
    endTarget: target.clone(),
    startedAt: performance.now(),
    duration: 950,
  };
}

function focusLine(type) {
  const bounds = lineBounds.get(type);
  if (!bounds || bounds.isEmpty()) return;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const reach = Math.max(size.x, size.z, 2.5);
  tweenCamera(
    new THREE.Vector3(center.x + reach * 1.15, reach * 1.12 + 3.8, center.z + reach * 1.28),
    new THREE.Vector3(center.x, 0.15, center.z),
  );
  focusedLine = type;
  focusedModelType = null;
  machineRoots.forEach((machine) => {
    machine.userData.label.visible = hasPersistentLabel(machine) || machine === selectedMachine || machine === hoveredMachine;
  });
  const isLoaderValve = type === 'VALVE';
  document.querySelector('#focus-banner').hidden = !isLoaderValve;
  document.querySelector('#scene-title').textContent = isLoaderValve ? 'LOADER VALVE 2 · REAL DATA' : lineTypes[type].name;
  document.querySelector('#scene-subtitle').textContent = isLoaderValve
    ? 'ป้ายสีฟ้า = MAKINO J4 · แตะเครื่องเพื่อดู Machine Master'
    : 'ลากเพื่อหมุน • Scroll เพื่อซูม • คลิกเครื่องเพื่อดูข้อมูล';
  document.querySelectorAll('.line-button').forEach((button) => button.classList.toggle('active', button.dataset.line === type));
}

function focusMakinoJ4() {
  const targets = machineRoots.filter((machine) => machine.userData.modelType === 'makino-j4');
  if (!targets.length) return;
  const bounds = new THREE.Box3();
  targets.forEach((machine) => bounds.expandByObject(machine));
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const reach = Math.max(size.x, size.z, 2.2);
  focusedLine = 'VALVE';
  focusedModelType = 'makino-j4';
  machineRoots.forEach((machine) => {
    machine.userData.label.visible = hasPersistentLabel(machine) || machine === selectedMachine || machine === hoveredMachine;
  });
  tweenCamera(
    new THREE.Vector3(center.x + reach * 1.05, reach * 1.45 + 2.2, center.z + reach * 1.15),
    new THREE.Vector3(center.x, 0.3, center.z),
  );
  document.querySelector('#focus-banner').hidden = false;
  document.querySelector('#scene-title').textContent = 'MAKINO J4 · 3 MACHINES';
  document.querySelector('#scene-subtitle').textContent = 'MC049 · MC050 · MC051 — แตะเครื่องเพื่อดู Machine Master';
  document.querySelectorAll('.line-button').forEach((button) => button.classList.toggle('active', button.dataset.line === 'VALVE'));
}

document.querySelector('#home-view').addEventListener('click', () => {
  tweenCamera(new THREE.Vector3(15, 18, 20), new THREE.Vector3(0, 0, 0));
  focusedLine = null;
  focusedModelType = null;
  machineRoots.forEach((machine) => {
    machine.userData.label.visible = machine === selectedMachine || machine === hoveredMachine;
  });
  document.querySelector('#focus-banner').hidden = true;
  document.querySelector('#scene-title').textContent = 'FACTORY OVERVIEW';
  document.querySelector('#scene-subtitle').textContent = 'ลากเพื่อหมุน • Scroll เพื่อซูม • คลิกเครื่องเพื่อดูข้อมูล';
  document.querySelectorAll('.line-button').forEach((button) => button.classList.remove('active'));
});

document.querySelector('#toggle-rotate').addEventListener('click', (event) => {
  controls.autoRotate = !controls.autoRotate;
  controls.autoRotateSpeed = 0.55;
  event.currentTarget.classList.toggle('active', controls.autoRotate);
});

document.querySelector('#toggle-plan').addEventListener('click', (event) => {
  planMaterial.opacity = planMaterial.opacity > 0 ? 0 : 0.33;
  event.currentTarget.classList.toggle('active', planMaterial.opacity > 0);
});

const mobileLinesButton = document.querySelector('#mobile-lines');
const mobileMachineButton = document.querySelector('#mobile-machine');
const linePanel = document.querySelector('.line-panel');
const machinePanel = document.querySelector('.machine-panel');

function closeMobilePanels() {
  linePanel.classList.remove('mobile-open');
  machinePanel.classList.remove('mobile-open');
  mobileLinesButton.classList.remove('active');
  mobileMachineButton.classList.remove('active');
}

mobileLinesButton.addEventListener('click', () => {
  const shouldOpen = !linePanel.classList.contains('mobile-open');
  closeMobilePanels();
  linePanel.classList.toggle('mobile-open', shouldOpen);
  mobileLinesButton.classList.toggle('active', shouldOpen);
});

mobileMachineButton.addEventListener('click', () => {
  const shouldOpen = !machinePanel.classList.contains('mobile-open');
  closeMobilePanels();
  machinePanel.classList.toggle('mobile-open', shouldOpen);
  mobileMachineButton.classList.toggle('active', shouldOpen);
});

const urlParameters = new URLSearchParams(window.location.search);
const requestedFocus = urlParameters.get('focus')?.toUpperCase();
const requestedLine = urlParameters.get('line')?.toUpperCase();
if (requestedFocus === 'J4') {
  window.setTimeout(focusMakinoJ4, 350);
} else if (requestedLine && lineTypes[requestedLine]) {
  window.setTimeout(() => focusLine(requestedLine), 350);
}

function updateCameraTween(time) {
  if (!cameraTween) return;
  const raw = Math.min(1, (time - cameraTween.startedAt) / cameraTween.duration);
  const eased = raw < 0.5 ? 4 * raw ** 3 : 1 - ((-2 * raw + 2) ** 3) / 2;
  camera.position.lerpVectors(cameraTween.startPosition, cameraTween.endPosition, eased);
  controls.target.lerpVectors(cameraTween.startTarget, cameraTween.endTarget, eased);
  if (raw >= 1) cameraTween = null;
}

function animate(time) {
  requestAnimationFrame(animate);
  updateCameraTween(time);
  controls.update();
  selectionRing.material.opacity = selectedMachine ? 0.58 + Math.sin(time * 0.004) * 0.2 : 0;
  renderer.render(scene, camera);
}
animate(0);

window.addEventListener('resize', () => {
  camera.aspect = viewport.clientWidth / viewport.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
});
