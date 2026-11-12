// MODU builder: scene, placement logic and user interface
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SNAP, SWIRLY_DROP, CATALOG, ORDER, DEFAULT_INV, DEF, HOLES, PROTO, V, Y, NEG_Y,
         applyFlip, defaultDepth, clampDepth, objectFromRec } from './pieces.js';
import { TEMPLATES, GROUPS } from './templates.js';
import { LANGS, L, t, num, initLang, setLang, getLang, applyStatic } from './i18n.js';

initLang();
const $ = id => document.getElementById(id);
const pname = type => t('p.' + type);

/* ---------------- Icons ---------------- */
const ICONS = {
  menu:'M4 6h16M4 12h16M4 18h16',
  undo:'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  redo:'m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  drop:'M12 3v13m0 0-5-5m5 5 5-5M4 21h16',
  layers:'M12 2 2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5',
  list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  box:'M3 7h18v13H3zM3 7l2-4h14l2 4M9 11h6',
  folder:'M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01',
  rot:'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  move:'M12 3v18M3 12h18M12 3 9 6m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3M21 12l-3-3m3 3-3 3',
  copy:'M9 9h11v11H9zM5 15H4V4h11v1',
  trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  minus:'M5 12h14', plus:'M12 5v14M5 12h14',
  flip:'M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3',
  x:'M6 6l12 12M18 6 6 18',
  left:'M15 6l-6 6 6 6', right:'M9 6l6 6-6 6', up:'M6 15l6-6 6 6', down:'M6 9l6 6 6-6',
  raise:'M12 19V7m0 0-4 4m4-4 4 4M5 4h14', lower:'M12 5v12m0 0-4-4m4 4 4-4M5 20h14',
  play:'M7 4l13 8-13 8z', pause:'M7 4v16M17 4v16',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
};
const ic = name => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
document.querySelectorAll('i[data-ic]').forEach(el => { el.outerHTML = ic(el.dataset.ic); });

/* ---------------- Storage helpers ---------------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} },
};
let inv = Object.assign({}, DEFAULT_INV, store.get('modu.inv.v2', {}));
let unlimited = store.get('modu.unlimited.v1', false);

/* ---------------- Materials for the placement ghost ---------------- */
const GHOST_OK = new THREE.MeshStandardMaterial({ color:0xE6C977, transparent:true, opacity:.55, depthWrite:false });
const GHOST_BAD = new THREE.MeshStandardMaterial({ color:0xC4553A, transparent:true, opacity:.5, depthWrite:false });

/* ---------------- Scene ---------------- */
const view = $('view');
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
view.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF2EFEA);
const camera = new THREE.PerspectiveCamera(42, 1, 1, 6000);
camera.position.set(140,120,180);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,10,0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2 - 0.02;

scene.add(new THREE.HemisphereLight(0xffffff, 0xCFC8BC, 1.4));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(120,220,90);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera, { left:-250, right:250, top:250, bottom:-250, near:10, far:700 });
sun.shadow.bias = -0.0005;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000,3000), new THREE.MeshStandardMaterial({ color:0xD9D4CB, roughness:1 }));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; ground.userData.ground = true;
scene.add(ground);
const grid = new THREE.GridHelper(400, 40, 0xBDB6AA, 0xCFC9BF);
grid.position.y = 0.02; scene.add(grid);

const piecesGroup = new THREE.Group();
scene.add(piecesGroup);

function resize(){
  const w = view.clientWidth, h = view.clientHeight;
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = w+'px'; renderer.domElement.style.height = h+'px';
  camera.aspect = w/Math.max(h,1); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(view);
resize();
renderer.setAnimationLoop(now => { asmFrame(now ?? performance.now()); controls.update(); renderer.render(scene, camera); });

/* ---------------- Thumbnails (pieces and examples) ---------------- */
const thumbs = (() => {
  let r = null, sc, cam, grp;
  function init(){
    r = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
    r.setPixelRatio(1); r.setSize(256, 192, false);
    r.outputColorSpace = THREE.SRGBColorSpace;
    sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xffffff, 0xBFB8AC, 1.5));
    const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(1,2.2,1.4); sc.add(d);
    cam = new THREE.PerspectiveCamera(28, 256/192, 1, 8000);
    grp = new THREE.Group(); sc.add(grp);
  }
  function render(recs){
    if (!r) init();
    grp.clear();
    for (const rec of recs) grp.add(objectFromRec(rec));
    const box = new THREE.Box3().setFromObject(grp), c = box.getCenter(V(0,0,0));
    const rad = Math.max(box.getSize(V(0,0,0)).length()/2, 6);
    const dist = rad / Math.sin(cam.fov*Math.PI/360) * 0.95;
    cam.position.copy(c).add(V(0.62,0.5,0.75).normalize().multiplyScalar(dist));
    cam.lookAt(c);
    r.render(sc, cam);
    grp.clear();
    return r.domElement.toDataURL('image/webp', 0.9);
  }
  function done(){ if (r){ r.forceContextLoss(); r.dispose(); r = null; } }
  return { render, done };
})();
const pieceThumb = {};
for (const type of ORDER){
  const q = CATALOG[type].group === 'peg' ? [0,0,0.3827,0.9239] : [0,0,0,1]; // pegs slightly tilted
  pieceThumb[type] = thumbs.render([{ type, p:[0,0,0], q }]);
}

/* ---------------- Piece helpers ---------------- */
const groupOf = o => CATALOG[o.userData.type].group;
const isStruct = o => groupOf(o) === 'struct';
const pieces = () => piecesGroup.children;
const usedCount = type => pieces().filter(o => o.userData.type === type).length;
const canUse = type => unlimited || usedCount(type) < (inv[type] ?? 0);

function worldSize(type, q){
  const s = DEF[type].size.clone().applyQuaternion(q);
  return V(...[Math.abs(s.x),Math.abs(s.y),Math.abs(s.z)].map(v => Math.round(v*100)/100));
}
function structBox(type, pos, q, shrink=0.4){
  const s = worldSize(type, q).multiplyScalar(0.5).subScalar(shrink);
  return new THREE.Box3(pos.clone().sub(s), pos.clone().add(s));
}
function worldHoles(o){
  return HOLES[o.userData.type].map(h => ({
    p: h.p.clone().applyQuaternion(o.quaternion).add(o.position),
    n: h.n.clone().applyQuaternion(o.quaternion),
  }));
}
function pegAxis(o){ return Y.clone().applyQuaternion(o.quaternion); }
function pegBase(o){ // point where the peg enters its host hole
  const len = CATALOG[o.userData.type].len;
  return o.position.clone().addScaledVector(pegAxis(o), -(len/2 - o.userData.depth));
}
function holeOccupant(p){
  return pieces().find(o => {
    const g = groupOf(o);
    if (g === 'peg') return pegBase(o).distanceTo(p) < 0.8;
    if (g === 'swirly') return o.position.distanceTo(p) < 0.8;
    return false;
  });
}

/* ---------------- Placement logic ---------------- */
let mode = 'select';
let placeType = null;
let ghostQ = new THREE.Quaternion();
let ghostDepth = null;
let ghostFlip = false;
let ghost = null;
let current = null;      // last computed placement
let moving = false;      // true while a picked-up piece is being re-placed
let lastPointer = null;

const raycaster = new THREE.Raycaster();
function pick(ev){
  const r = renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
  raycaster.setFromCamera(ndc, camera);
  scene.updateMatrixWorld();
  const hits = raycaster.intersectObjects([piecesGroup, ground], true);
  if (!hits.length) return null;
  const h = hits[0];
  const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : Y.clone();
  return { point:h.point, n, root:h.object.userData.root || null, ground:!!h.object.userData.ground,
           inHole: h.object.name === 'holeTube', ray: raycaster.ray.direction.clone() };
}

function blockedBy(box, ignore){
  return pieces().some(o => o !== ignore && (isStruct(o) || groupOf(o) === 'foam') && objBox(o).intersectsBox(box));
}
function objBox(o){
  if (isStruct(o)) return structBox(o.userData.type, o.position, o.quaternion);
  if (groupOf(o) === 'foam') return foamBox(o.position, o.quaternion);
  return new THREE.Box3().setFromObject(o);
}
function foamBox(pos, q){
  const s = V(18,5,18).applyQuaternion(q);
  const half = V(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z)).multiplyScalar(0.5).subScalar(0.4);
  return new THREE.Box3(pos.clone().sub(half), pos.clone().add(half));
}
// Does a point inside struct o lie on the axis of one of its holes (i.e. a peg passing through)?
function passesThroughHole(o, pt, axis){
  return worldHoles(o).some(h => {
    if (Math.abs(h.n.dot(axis)) < 0.95) return false;
    const d = pt.clone().sub(h.p);
    return d.sub(axis.clone().multiplyScalar(d.dot(axis))).length() < 1;
  });
}

function finalize(type, pos, q, depth){
  const g = CATALOG[type].group;
  const res = { t:type, pos, q, depth, ok:true, msg:'' };
  const fail = m => { res.ok = false; res.msg = m; return res; };
  if (!canUse(type)) return fail(t('e.none'));
  if (g === 'struct'){
    const b = structBox(type, pos, q);
    if (b.min.y < -0.3) return fail(t('e.under'));
    if (blockedBy(b)) return fail(t('e.hit'));
  } else if (g === 'foam'){
    const b = foamBox(pos, q);
    if (b.min.y < -0.3) return fail(t('e.wheelUnder'));
    if (blockedBy(b)) return fail(t('e.wheelHit'));
  } else if (g === 'peg'){
    const len = CATALOG[type].len, axis = Y.clone().applyQuaternion(q);
    const base = pos.clone().addScaledVector(axis, -(len/2 - depth));
    for (const k of [0.5, 0.95]){
      const pt = base.clone().addScaledVector(axis, (len-depth)*k);
      if (pt.y < -0.2) return fail(t('e.pegFloor'));
      const hitStruct = pieces().find(o => isStruct(o) && structBox(o.userData.type,o.position,o.quaternion,0.3).containsPoint(pt) && !passesThroughHole(o, pt, axis));
      if (hitStruct) return fail(t('e.pegInside'));
    }
  } else if (g === 'swirly'){
    const tip = pos.clone().addScaledVector(Y.clone().applyQuaternion(q), -SWIRLY_DROP);
    if (tip.y < -0.3) return fail(t('e.wheelUnder'));
  }
  return res;
}

function nearestHole(o, hit, maxD){
  let best = null, bd = maxD;
  for (const h of worldHoles(o)){
    // inside a through-hole the face normal is sideways: use the hole entrance facing the viewer
    if (hit.inHole ? h.n.dot(hit.ray) > -0.2 : h.n.dot(hit.n) < 0.6) continue;
    const d = h.p.distanceTo(hit.point);
    if (d < bd){ bd = d; best = h; }
  }
  return best;
}

function computePlacement(hit){
  const type = placeType, g = CATALOG[type].group;
  const fail = m => ({ ok:false, msg:m });
  if (g === 'peg' || g === 'swirly'){
    if (!hit.root || !isStruct(hit.root)) return fail(t('e.needHole'));
    let h = nearestHole(hit.root, hit, 7);
    if (!h) return fail(t('e.nearHole'));
    if (g === 'swirly' && h.n.y > 0.9){
      // clicking the top of a through-hole mounts the swirly in its bottom opening
      const below = worldHoles(hit.root).find(o => o.n.y < -0.9 && Math.hypot(o.p.x-h.p.x, o.p.z-h.p.z) < 0.5);
      if (below) h = below;
    }
    if (holeOccupant(h.p)) return fail(t('e.holeFull'));
    if (g === 'peg'){
      const len = CATALOG[type].len, depth = clampDepth(type, ghostDepth);
      const q = new THREE.Quaternion().setFromUnitVectors(Y, h.n);
      return finalize(type, h.p.clone().addScaledVector(h.n, len/2 - depth), q, depth);
    }
    return finalize(type, h.p.clone(), new THREE.Quaternion().setFromUnitVectors(NEG_Y, h.n));
  }
  if (g === 'foam'){
    let peg = hit.root && groupOf(hit.root) === 'peg' ? hit.root : null;
    if (!peg && hit.root && isStruct(hit.root)){
      const h = nearestHole(hit.root, hit, 7);
      const occ = h && holeOccupant(h.p);
      if (occ && groupOf(occ) === 'peg') peg = occ;
    }
    if (!peg) return fail(t('e.foamNeedsPeg'));
    const len = CATALOG[peg.userData.type].len, out = len - peg.userData.depth;
    if (out < 5) return fail(t('e.pegShortOut'));
    const a = pegAxis(peg);
    const pos = peg.position.clone().addScaledVector(a, len/2 - 2.5);
    if (pieces().some(o => groupOf(o) === 'foam' && o.position.distanceTo(pos) < 1)) return fail(t('e.pegHasWheel'));
    return finalize(type, pos, peg.quaternion.clone());
  }
  // structural pieces
  const q = ghostQ.clone();
  let peg = hit.root && groupOf(hit.root) === 'peg' ? hit.root : null;
  if (!peg && hit.root && isStruct(hit.root)){
    const h = nearestHole(hit.root, hit, 4);
    const occ = h && holeOccupant(h.p);
    if (occ && groupOf(occ) === 'peg' && pegAxis(occ).dot(h.n) > 0.95 && CATALOG[occ.userData.type].len - occ.userData.depth > 0.5) peg = occ;
  }
  if (peg) return pegSnap(type, peg, hit, q);
  return surfacePlace(type, hit, q);
}

function pegSnap(type, peg, hit, q){
  const a = pegAxis(peg), base = pegBase(peg);
  const holes = HOLES[type].map(h => ({ p:h.p.clone().applyQuaternion(q), n:h.n.clone().applyQuaternion(q) }))
                           .filter(h => h.n.dot(a) < -0.95);
  if (!holes.length) return { ok:false, msg:t('e.turn') };
  let best = null, bestScore = Infinity;
  for (const h of holes){
    const pos = base.clone().sub(h.p);
    const res = finalize(type, pos, q);
    const score = (res.ok ? 0 : 1000) + pos.distanceTo(hit.point);
    if (score < bestScore){ bestScore = score; best = res; }
  }
  if (best.ok) best.msg = t('h.snapped');
  return best;
}

function surfacePlace(type, hit, q){
  const size = worldSize(type, q);
  const n = hit.n, comps = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
  const ax = comps.indexOf(Math.max(...comps));
  const sign = Math.sign(n.getComponent(ax)) || 1;
  const c = new THREE.Vector3();
  for (let i=0;i<3;i++){
    const half = size.getComponent(i)/2;
    if (i === ax) c.setComponent(i, Math.round((hit.point.getComponent(i) + sign*half)*10)/10);
    else c.setComponent(i, Math.round((hit.point.getComponent(i) - half)/SNAP)*SNAP + half);
  }
  if (hit.ground) c.y = size.y/2;
  return finalize(type, c, q);
}

/* ---------------- Ghost & modes ---------------- */
function setGhost(type){
  if (ghost){ scene.remove(ghost); ghost = null; }
  if (!type) return;
  ghost = PROTO[type].clone();
  ghost.traverse(c => { if (c.isMesh){ c.material = GHOST_OK; c.castShadow = false; c.receiveShadow = false; c.raycast = () => {}; } });
  ghost.visible = false;
  scene.add(ghost);
}
function paintGhost(ok){ ghost.traverse(c => { if (c.isMesh) c.material = ok ? GHOST_OK : GHOST_BAD; }); }

function enterPlace(type, q, depth, flip=false){
  if (asm) closeAssembly();
  mode = 'place'; placeType = type;
  ghostQ = q ? q.clone() : new THREE.Quaternion();
  ghostDepth = depth ?? null;
  ghostFlip = !!flip;
  select(null);
  setGhost(type);
  applyFlip(ghost, ghostFlip);
  document.body.classList.remove('side-open');
  refreshUI();
  hint(t('h.bring', { p:pname(type) }));
}
function enterSelect(){
  mode = 'select'; placeType = null; moving = false; setGhost(null); current = null;
  refreshUI();
  hint(t('h.idle'));
}
function cancelPlace(){
  if (mode === 'place'){ if (moving) undo(); enterSelect(); } else select(null);
}

function updateGhost(ev){
  if (mode !== 'place' || !ghost) return;
  const hit = pick(ev);
  if (!hit){ ghost.visible = false; current = null; return; }
  const res = computePlacement(hit);
  current = res;
  if (!res.pos){ ghost.visible = false; hint(res.msg, true); return; }
  ghost.visible = true;
  ghost.position.copy(res.pos); ghost.quaternion.copy(res.q);
  paintGhost(res.ok);
  const c = CATALOG[placeType];
  const extra = c.group === 'struct' ? ' · ' + t('h.rot')
    : c.group === 'peg' ? ' · ' + t('h.depth', { d:res.depth }) + (c.collar != null ? ' · ' + t(ghostFlip ? 'h.endLong' : 'h.endShort') : '')
    : '';
  hint(res.ok ? `${t('h.place')}${extra}. ${res.msg}` : res.msg, !res.ok);
}

function placeCurrent(){
  if (!current || !current.ok) return;
  const rec = { type:current.t, p:current.pos.toArray(), q:current.q.toArray() };
  if (current.depth != null) rec.depth = current.depth;
  if (CATALOG[current.t].collar != null && ghostFlip) rec.flip = true;
  commit(() => addPiece(rec));
  moving = false;
  if (!canUse(placeType)){ enterSelect(); return; }
  ghost.visible = false; current = null;
  hint(t('h.placed'));
}

/* ---------------- Selection ---------------- */
let selected = null, selBox = null;
function select(o){
  selected = o;
  if (selBox){ scene.remove(selBox); selBox = null; }
  if (o){ selBox = new THREE.BoxHelper(o, 0xB8862B); scene.add(selBox); }
  refreshUI();
  if (o) hint(t('h.selected', { p:pname(o.userData.type) }));
}
function updateSelBox(){
  if (selected && !selected.parent) select(null);
  if (selBox) selBox.update();
}

function rotate(axisName){
  const axis = { y:V(0,1,0), x:V(1,0,0), z:V(0,0,1) }[axisName];
  const r = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI/2);
  if (mode === 'place'){ ghostQ.premultiply(r); if (lastPointer) updateGhost(lastPointer); return; }
  if (!selected) return;
  commit(() => { selected.quaternion.premultiply(r); liftAboveGround(selected); });
}
function liftAboveGround(o){
  o.updateMatrixWorld(true);
  const minY = isStruct(o) ? o.position.y - worldSize(o.userData.type, o.quaternion).y/2 : new THREE.Box3().setFromObject(o).min.y;
  if (minY < 0) o.position.y -= minY;
}
function moveSelected(dir, all=false){
  if (all){ if (pieces().length) commit(() => pieces().forEach(o => o.position.addScaledVector(dir, SNAP))); return; }
  if (!selected) return;
  commit(() => selected.position.addScaledVector(dir, SNAP));
}
function cameraAxes(){
  const f = controls.target.clone().sub(camera.position); f.y = 0;
  const fwd = Math.abs(f.x) > Math.abs(f.z) ? V(Math.sign(f.x),0,0) : V(0,0,Math.sign(f.z));
  return { fwd, right: V(-fwd.z, 0, fwd.x) };
}
function nudge(where, all){
  const { fwd, right } = cameraAxes();
  const dir = { fwd, back:fwd.clone().negate(), right, left:right.clone().negate(), up:V(0,1,0), down:V(0,-1,0) }[where];
  moveSelected(dir, all);
}
function changeDepth(delta){
  if (mode === 'place' && CATALOG[placeType].group === 'peg'){
    ghostDepth = clampDepth(placeType, (ghostDepth ?? defaultDepth(placeType)) + delta);
    if (lastPointer) updateGhost(lastPointer);
    refreshUI();
    return;
  }
  if (!selected || groupOf(selected) !== 'peg') return;
  const type = selected.userData.type, nd = clampDepth(type, selected.userData.depth + delta);
  const d = nd - selected.userData.depth;
  if (!d) return;
  commit(() => { selected.position.addScaledVector(pegAxis(selected), -d); selected.userData.depth = nd; });
  hint(t('h.pegDepth', { d:nd }));
}
// Short-long peg: swap which end goes into the hole, keeping the hole (base) point fixed
function flipPeg(){
  if (mode === 'place' && CATALOG[placeType].collar != null){
    ghostFlip = !ghostFlip;
    ghostDepth = defaultDepth(placeType, ghostFlip);
    applyFlip(ghost, ghostFlip);
    if (lastPointer) updateGhost(lastPointer);
    refreshUI();
    return;
  }
  if (!selected || CATALOG[selected.userData.type].collar == null) return;
  const o = selected, type = o.userData.type, base = pegBase(o), flip = !o.userData.flip;
  const depth = defaultDepth(type, flip);
  commit(() => {
    o.userData.depth = depth;
    o.position.copy(base).addScaledVector(pegAxis(o), CATALOG[type].len/2 - depth);
    applyFlip(o, flip);
  });
  hint(t(flip ? 'h.flipLong' : 'h.flipShort', { d:num(String(depth).replace('.', ',')) }));
}
function deleteSelected(){
  if (!selected) return;
  const o = selected;
  commit(() => piecesGroup.remove(o));
  select(null);
}
function lowestPoint(){
  let m = Infinity;
  for (const o of pieces()){
    const g = groupOf(o);
    let y;
    if (g === 'struct') y = o.position.y - worldSize(o.userData.type, o.quaternion).y/2;
    else if (g === 'foam') y = foamBox(o.position, o.quaternion).min.y - 0.4;
    else if (g === 'swirly') y = o.position.y - Y.clone().applyQuaternion(o.quaternion).y * SWIRLY_DROP;
    else { o.updateMatrixWorld(true); y = new THREE.Box3().setFromObject(o).min.y; }
    m = Math.min(m, y);
  }
  return m;
}
function dropToFloor(){
  if (!pieces().length) return;
  const d = Math.round(lowestPoint()*100)/100;
  if (Math.abs(d) < 0.01) return hint(t('h.onFloor'));
  commit(() => pieces().forEach(o => o.position.y -= d));
  hint(t(d > 0 ? 'h.dropped' : 'h.raised', { d:num(String(Math.abs(d)).replace('.', ',')) }));
}
function pickUpSelected(){
  if (!selected) return;
  const o = selected, type = o.userData.type, q = o.quaternion.clone(), d = o.userData.depth, f = o.userData.flip;
  commit(() => piecesGroup.remove(o));
  enterPlace(type, q, d, f);
  moving = true;
}
function duplicateSelected(){
  if (!selected) return;
  const type = selected.userData.type;
  if (!canUse(type)) return hint(t('e.none'), true);
  enterPlace(type, selected.quaternion, selected.userData.depth, selected.userData.flip);
}

/* ---------------- Model / history ---------------- */
const r2 = v => Math.round(v*100)/100, r5 = v => Math.round(v*1e5)/1e5;
function addPiece(rec){
  const o = objectFromRec(rec);
  piecesGroup.add(o);
  return o;
}
function records(){
  return pieces().map(o => {
    const r = { type:o.userData.type, p:o.position.toArray().map(r2), q:o.quaternion.toArray().map(r5) };
    if (o.userData.depth != null) r.depth = o.userData.depth;
    if (o.userData.flip) r.flip = true;
    return r;
  });
}
function setRecords(recs){
  select(null);
  while (piecesGroup.children.length) piecesGroup.remove(piecesGroup.children[0]);
  for (const r of recs) if (CATALOG[r.type]) addPiece(r);
}
const sig = () => JSON.stringify(records());
const undoStack = [], redoStack = [];
let cleanSig = null; // scene as last loaded or saved: no need to confirm before replacing it
function commit(fn){
  if (asm) closeAssembly();
  undoStack.push(sig());
  if (undoStack.length > 200) undoStack.shift();
  redoStack.length = 0;
  fn();
  afterChange();
}
function undo(){
  if (!undoStack.length) return;
  redoStack.push(sig());
  setRecords(JSON.parse(undoStack.pop()));
  afterChange();
}
function redo(){
  if (!redoStack.length) return;
  undoStack.push(sig());
  setRecords(JSON.parse(redoStack.pop()));
  afterChange();
}
function afterChange(){
  store.set('modu.current.v1', records());
  updateSelBox();
  refreshUI();
}
const safeToReplace = () => !pieces().length || sig() === cleanSig || confirm(t('c.replace'));
function loadDesign(recs, label){
  commit(() => setRecords(recs));
  cleanSig = sig();
  enterSelect();
  frameView('persp');
  if (label) hint(t('h.loaded', { n:label }));
}

/* ---------------- UI ---------------- */
const hintEl = $('hint');
function hint(text, warn=false){ hintEl.textContent = text; hintEl.classList.toggle('warn', warn); }

const PAL_GROUPS = [['g.struct',['square','round','angle','base','beam']], ['g.peg',['pegLong','pegShort','pegSL']], ['g.wheel',['swirly','foam']]];
const palBtn = {};
function buildPalette(){
  const pal = $('palette');
  pal.innerHTML = '';
  for (const [title, types] of PAL_GROUPS){
    const h = document.createElement('div'); h.className = 'gh'; h.textContent = t(title); pal.appendChild(h);
    const g = document.createElement('div'); g.className = 'pgrid'; pal.appendChild(g);
    for (const type of types){
      const b = document.createElement('button');
      b.innerHTML = `<img alt="" src="${pieceThumb[type]}"><span class="nm">${pname(type)}</span><small>${num(CATALOG[type].dims)}</small><span class="ct"></span>`;
      b.onclick = () => {
        if (mode === 'place' && placeType === type) return enterSelect();
        canUse(type) ? enterPlace(type) : hint(t('e.noneOf', { p:pname(type) }), true);
      };
      palBtn[type] = b;
      g.appendChild(b);
    }
  }
}

let nudgeAll = false;
function refreshUI(){
  for (const type of ORDER){
    const b = palBtn[type];
    if (!b) continue;
    const used = usedCount(type), total = inv[type] ?? 0, left = total - used;
    b.className = 'piece' + (left <= 0 && !unlimited ? ' empty' : '') + (mode === 'place' && placeType === type ? ' on' : '');
    b.querySelector('.ct').textContent = unlimited ? used : `${Math.max(left,0)}/${total}`;
    b.title = unlimited ? t('side.used', { n:used }) : t('side.left', { n:left, t:total });
  }
  $('bUndo').disabled = !undoStack.length;
  $('bRedo').disabled = !redoStack.length;
  $('bAsm').classList.toggle('on', !!asm);
  // context bar
  const placing = mode === 'place', sel = !!selected && !placing;
  const type = placing ? placeType : selected?.userData.type, c = type ? CATALOG[type] : null;
  $('cx').hidden = !!asm || !(placing || sel);
  $('cxRot').hidden = !(c && (c.group === 'struct' || sel));
  $('cxPeg').hidden = !(c && c.group === 'peg');
  $('bFlip').hidden = !(c && c.collar != null);
  $('cxNudge').hidden = !sel;
  $('cxEdit').hidden = !sel;
  $('cxCancel').hidden = !placing;
  $('bAll').classList.toggle('on', nudgeAll);
  if (c && c.group === 'peg'){
    const d = placing ? clampDepth(type, ghostDepth ?? defaultDepth(type, ghostFlip)) : selected.userData.depth;
    $('cxDepth').textContent = t('cx.depth', { d:num(String(d).replace('.', ',')) });
  }
  // status
  const n = pieces().length;
  let dims = '—';
  if (n){
    const b = new THREE.Box3();
    for (const o of pieces()) b.union(objBox(o).expandByScalar(0.4));
    const s = b.getSize(V(0,0,0));
    dims = `${Math.round(s.x)} × ${Math.round(s.z)} × ${Math.round(s.y)} cm (${t('st.dimsHint')})`;
  }
  const over = ORDER.some(type => usedCount(type) > (inv[type] ?? 0));
  $('stat').innerHTML = `<b>${n}</b> ${t('st.pieces')} · ${t('st.dims')}: <b>${dims}</b>` + (over && !unlimited ? ` · <span class="over">${t('st.over')}</span>` : '');
}

/* ---------------- Examples ---------------- */
const SHORT = { base:'Base', square:'Square', round:'Round', angle:'Angle', beam:'Beam', swirly:'Swirly', foam:'Foam' };
function describe(tp){
  const n = {};
  for (const r of tp.recs) n[r.type] = (n[r.type] || 0) + 1;
  return Object.keys(SHORT).filter(k => n[k]).map(k => (n[k] > 1 ? n[k] + ' ' : '') + SHORT[k]).join(' · ');
}
let lastTemplate = null; // { tp, sig } of the example that was loaded last
function loadTemplate(tp, assemble){
  if (!safeToReplace()) return;
  if (asm) closeAssembly();
  loadDesign(tp.recs, L(tp.name));
  lastTemplate = { tp, sig:sig() };
  document.body.classList.remove('side-open');
  buildExamples();
  if (assemble) openAssembly();
}
const exThumb = {};
function buildExamples(){
  const box = $('templates'), q = $('exSearch').value.trim().toLowerCase();
  box.innerHTML = '';
  const active = lastTemplate && lastTemplate.sig === sig() ? lastTemplate.tp : null;
  let shown = 0;
  for (const [gid, title] of GROUPS){
    const list = TEMPLATES.filter(tp => tp.group === gid && (!q || L(tp.name).toLowerCase().includes(q)));
    if (!list.length) continue;
    const h = document.createElement('div'); h.className = 'gh'; h.textContent = L(title); box.appendChild(h);
    for (const tp of list){
      shown++;
      const row = document.createElement('div');
      row.className = 'ex' + (tp === active ? ' on' : '');
      row.tabIndex = 0; row.setAttribute('role', 'button');
      row.innerHTML = `<img class="th" alt="" data-id="${tp.id}"${exThumb[tp.id] ? ` src="${exThumb[tp.id]}"` : ''}>` +
        `<span class="tx"><span class="nm">${L(tp.name)}</span><small>${describe(tp)}</small><small>${t('ex.steps', { n:tp.steps.length })}</small></span>` +
        `<button class="asm" title="${t('ex.asmT')}" aria-label="${t('ex.asmT')}">${ic('layers')}</button>`;
      row.onclick = e => loadTemplate(tp, !!e.target.closest('.asm'));
      row.onkeydown = e => { if (e.key === 'Enter' && e.target === row) loadTemplate(tp, false); };
      box.appendChild(row);
    }
  }
  if (!shown) box.innerHTML = `<p class="note">${t('side.none')}</p>`;
}
$('exSearch').oninput = buildExamples;
// Render the example thumbnails a few at a time so the page stays responsive
(function renderThumbs(i = 0){
  if (i >= TEMPLATES.length) return thumbs.done();
  const tp = TEMPLATES[i];
  exThumb[tp.id] = thumbs.render(tp.recs);
  const img = document.querySelector(`#templates img[data-id="${tp.id}"]`);
  if (img) img.src = exThumb[tp.id];
  setTimeout(() => renderThumbs(i + 1), 0);
})();

function showTab(examples){
  $('tabPieces').classList.toggle('on', !examples); $('tabExamples').classList.toggle('on', examples);
  $('panePieces').hidden = examples; $('paneExamples').hidden = !examples;
  store.set('modu.tab', examples ? 1 : 0);
}
$('tabPieces').onclick = () => showTab(false);
$('tabExamples').onclick = () => showTab(true);
$('bSide').onclick = () => document.body.classList.toggle('side-open');
$('scrim').onclick = () => document.body.classList.remove('side-open');

/* ---------------- Assembly view (step by step, optionally exploded) ---------------- */
let asm = null;
const STEP_TIME = 2.6; // seconds per animated step

function autoSteps(){
  // consecutive pieces of the same type form one step, in the order they were placed
  const steps = [];
  pieces().forEach((o, i) => {
    const type = o.userData.type, last = steps[steps.length-1];
    if (last && last.type === type) last.idx.push(i); else steps.push({ type, idx:[i] });
  });
  return steps;
}
const stepText = s => s.text ? L(s.text) : `${t('a.v.' + CATALOG[s.type].group)}: ${s.idx.length} × ${pname(s.type)}.`;

function hostStruct(objs, pt){
  return objs.find(o => isStruct(o) && worldHoles(o).some(h => h.p.distanceTo(pt) < 0.8)) || null;
}
// Exploded offset and entry direction for every piece
function asmLayout(objs){
  const C = new THREE.Box3();
  for (const o of objs) if (isStruct(o)) C.union(objBox(o));
  const center = C.isEmpty() ? V(0,0,0) : C.getCenter(V(0,0,0));
  const off = new Map(), dir = new Map();
  const offOf = o => (o && off.get(o) ? off.get(o).clone() : V(0,0,0));
  for (const o of objs.filter(isStruct)){
    // spread outwards from the centre and upwards in proportion to height (layers separate)
    const d = o.position.clone().sub(center); d.y = o.position.y - C.min.y;
    off.set(o, d.clone().multiplyScalar(0.8));
    dir.set(o, d.lengthSq() > 1 ? d.normalize() : V(0,1,0));
  }
  for (const o of objs.filter(o => groupOf(o) === 'peg')){
    const a = pegAxis(o), host = hostStruct(objs, pegBase(o));
    off.set(o, offOf(host).addScaledVector(a, o.userData.depth + 6));
    dir.set(o, a);
  }
  for (const o of objs.filter(o => groupOf(o) === 'swirly')){
    const n = Y.clone().applyQuaternion(o.quaternion).negate(), host = hostStruct(objs, o.position);
    off.set(o, offOf(host).addScaledVector(n, 10));
    dir.set(o, n);
  }
  // a block that is pushed onto pegs slides in along those pegs
  for (const o of objs.filter(isStruct)){
    const box = structBox(o.userData.type, o.position, o.quaternion, 0.3);
    const peg = objs.find(p => groupOf(p) === 'peg' && hostStruct(objs, pegBase(p)) !== o &&
      box.containsPoint(pegBase(p).addScaledVector(pegAxis(p), (CATALOG[p.userData.type].len - p.userData.depth)/2)));
    if (peg) dir.set(o, pegAxis(peg));
  }
  for (const o of objs.filter(o => groupOf(o) === 'foam')){
    const a = pegAxis(o);
    const peg = objs.find(p => groupOf(p) === 'peg' &&
      p.position.clone().addScaledVector(pegAxis(p), CATALOG[p.userData.type].len/2).distanceTo(o.position.clone().addScaledVector(a, 2.5)) < 1);
    off.set(o, offOf(peg).addScaledVector(a, 10));
    dir.set(o, peg ? a : V(0,1,0));
  }
  return { off, dir };
}

function openAssembly(){
  if (!pieces().length) return hint(t('h.noAsm'), true);
  if (mode === 'place') enterSelect();
  select(null);
  const objs = pieces().slice();
  const tp = lastTemplate && lastTemplate.sig === sig() ? lastTemplate.tp : null;
  for (const o of objs) o.userData.home = o.position.clone();
  asm = { objs, tp, steps: tp ? tp.steps : autoSteps(), i:0, explode:+$('asmExplode').value/100*1.5, t0:performance.now(), playing:false, ...asmLayout(objs) };
  $('asmPanel').hidden = false;
  hint('');
  refreshUI();
  renderAsm();
}
function closeAssembly(){
  if (!asm) return;
  for (const o of asm.objs){ o.position.copy(o.userData.home); o.visible = true; delete o.userData.home; }
  asm = null;
  $('asmPanel').hidden = true;
  refreshUI();
  hint(t('h.idle'));
}
function asmGo(i){
  if (!asm) return;
  asm.i = Math.max(0, Math.min(asm.steps.length, i));
  asm.t0 = performance.now();
  renderAsm();
}
function renderAsm(){
  const n = asm.steps.length, done = asm.i >= n;
  $('asmTitle').textContent = t('a.title') + (asm.tp ? ` · ${L(asm.tp.name)}` : '');
  $('asmStep').textContent = done ? t('a.done', { n }) : t('a.step', { i:asm.i+1, n });
  $('asmFill').style.width = `${Math.min(asm.i + 1, n) / n * 100}%`;
  const s = asm.steps[asm.i];
  let text = t('a.whole');
  if (!done){
    text = stepText(s);
    if (s.text){
      const count = {};
      for (const k of s.idx){ const type = asm.objs[k].userData.type; count[type] = (count[type] || 0) + 1; }
      text += ` — ${Object.entries(count).map(([type,c]) => `${c} × ${pname(type)}`).join(', ')}`;
    }
  }
  $('asmText').textContent = text;
  $('asmPrev').disabled = asm.i === 0;
  $('asmNext').disabled = done;
  $('asmPlayTxt').textContent = t(asm.playing ? 'a.stop' : 'a.play');
  $('asmPlay').querySelector('svg').outerHTML = ic(asm.playing ? 'pause' : 'play');
}
function asmFrame(now){
  if (!asm) return;
  const time = (now - asm.t0)/1000;
  if (asm.playing && time > STEP_TIME){
    if (asm.i < asm.steps.length) asmGo(asm.i + 1); else { asm.playing = false; renderAsm(); }
    return;
  }
  const shown = new Set(), cur = new Set();
  asm.steps.forEach((s, k) => { if (k <= asm.i) s.idx.forEach(j => (k === asm.i ? cur : shown).add(asm.objs[j])); });
  const k = Math.min(time/1.2, 1), ease = 1 - Math.pow(1-k, 3);
  for (const o of asm.objs){
    o.visible = shown.has(o) || cur.has(o);
    if (!o.visible) continue;
    o.position.copy(o.userData.home).addScaledVector(asm.off.get(o), asm.explode);
    if (cur.has(o)) o.position.addScaledVector(asm.dir.get(o), 35*(1-ease));
  }
}
$('bAsm').onclick = () => asm ? closeAssembly() : openAssembly();
$('asmPrev').onclick = () => asmGo(asm.i - 1);
$('asmNext').onclick = () => asmGo(asm.i + 1);
$('asmPlay').onclick = () => {
  asm.playing = !asm.playing;
  if (asm.playing && asm.i >= asm.steps.length) asm.i = 0;
  asm.t0 = performance.now(); renderAsm();
};
$('asmClose').onclick = closeAssembly;
$('asmExplode').oninput = e => { if (asm) asm.explode = e.target.value/100*1.5; };

/* ---------------- Views ---------------- */
function frameView(kind){
  const b = new THREE.Box3();
  for (const o of pieces()) b.union(objBox(o));
  const c = b.isEmpty() ? V(0,10,0) : b.getCenter(V(0,0,0));
  const r = b.isEmpty() ? 80 : Math.max(60, b.getSize(V(0,0,0)).length());
  controls.target.copy(c);
  const d = r * 1.6;
  if (kind === 'top') camera.position.set(c.x, c.y + d, c.z + 0.01);
  else if (kind === 'front') camera.position.set(c.x, c.y + 5, c.z + d);
  else camera.position.set(c.x + d*0.6, c.y + d*0.55, c.z + d*0.75);
  controls.update();
}

/* ---------------- Dialogs ---------------- */
document.querySelectorAll('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

function bomRows(){
  return ORDER.map(type => ({ type, used:usedCount(type), have:inv[type] ?? 0 })).filter(r => r.used || r.have);
}
$('bBom').onclick = () => {
  $('bomBody').innerHTML = `<table><tr><th>${t('bom.piece')}</th><th class="n">${t('bom.used')}</th><th class="n">${t('bom.have')}</th><th class="n">${t('bom.state')}</th></tr>` +
    bomRows().map(r => `<tr><td>${pname(r.type)} <small>${num(CATALOG[r.type].dims)}</small></td><td class="n">${r.used}</td><td class="n">${r.have}</td>` +
      (r.used > r.have ? `<td class="n bad">${t('bom.missing', { n:r.used-r.have })}</td>` : `<td class="n good">${t('bom.spare', { n:r.have-r.used })}</td>`) + `</tr>`).join('') +
    `</table><p class="note">${esc($('stat').textContent)}</p>`;
  $('dlgBom').showModal();
};
$('bomCopy').onclick = async () => {
  const txt = bomRows().filter(r => r.used).map(r => `${r.used} × ${pname(r.type)}`).join('\n');
  try { await navigator.clipboard.writeText(txt); $('bomCopy').textContent = t('bom.copied'); }
  catch { prompt(t('c.copy'), txt); }
  setTimeout(() => $('bomCopy').textContent = t('bom.copy'), 1500);
};

function renderInv(values){
  $('invBody').innerHTML = `<table><tr><th>${t('bom.piece')}</th><th class="n">${t('inv.count')}</th><th class="n">${t('bom.used')}</th></tr>` +
    ORDER.map(type => `<tr><td>${pname(type)} <small>${num(CATALOG[type].dims)}</small></td><td class="n"><input type="number" min="0" max="99" data-t="${type}" value="${values[type] ?? 0}"></td><td class="n">${usedCount(type)}</td></tr>`).join('') + `</table>`;
}
$('bInv').onclick = () => { renderInv(inv); $('invUnlimited').checked = unlimited; $('dlgInv').showModal(); };
$('invDefault').onclick = () => renderInv(DEFAULT_INV);
$('invSave').onclick = () => {
  document.querySelectorAll('#invBody input[data-t]').forEach(i => inv[i.dataset.t] = Math.max(0, parseInt(i.value) || 0));
  unlimited = $('invUnlimited').checked;
  store.set('modu.inv.v2', inv); store.set('modu.unlimited.v1', unlimited);
  $('dlgInv').close(); refreshUI();
};

function designs(){ return store.get('modu.designs.v1', {}); }
function renderSaves(){
  const d = designs(), names = Object.keys(d).sort((a,b) => (d[b].date||'').localeCompare(d[a].date||''));
  $('savesList').innerHTML = names.length ? `<table>` + names.map(n =>
    `<tr><td>${esc(n)}<br><small>${t('f.pieces', { n:d[n].pieces.length })} · ${esc((d[n].date||'').slice(0,16).replace('T',' '))}</small></td>` +
    `<td class="n"><button class="tb" data-open="${encodeURIComponent(n)}">${t('f.open')}</button> <button class="tb danger" data-del="${encodeURIComponent(n)}">${t('f.del')}</button></td></tr>`).join('') + `</table>`
    : `<p class="note">${t('f.empty')}</p>`;
  $('savesList').querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
    const n = decodeURIComponent(b.dataset.open);
    if (!safeToReplace()) return;
    loadDesign(designs()[n].pieces, n); $('dlgSaves').close();
  });
  $('savesList').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const n = decodeURIComponent(b.dataset.del);
    if (!confirm(t('c.del', { n }))) return;
    const d = designs(); delete d[n]; store.set('modu.designs.v1', d); renderSaves();
  });
}
$('bSaves').onclick = () => { renderSaves(); $('dlgSaves').showModal(); };
$('saveBtn').onclick = () => {
  const n = $('saveName').value.trim();
  if (!n) return $('saveName').focus();
  const d = designs();
  if (d[n] && !confirm(t('c.over', { n }))) return;
  d[n] = { pieces:records(), date:new Date().toISOString() };
  store.set('modu.designs.v1', d); $('saveName').value = ''; cleanSig = sig(); renderSaves();
};
$('bExport').onclick = () => {
  const data = { app:'modu-eraikitzailea', version:1, inventory:inv, pieces:records() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type:'application/json' }));
  a.download = 'modu-diseinua.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('bImport').onclick = () => $('fileIn').click();
$('fileIn').onchange = async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const recs = Array.isArray(data) ? data : data.pieces;
    if (!Array.isArray(recs)) throw new Error('format');
    loadDesign(recs, f.name); $('dlgSaves').close();
  } catch { $('dlgSaves').close(); hint(t('h.badFile'), true); }
};
$('bClear').onclick = () => {
  if (pieces().length && confirm(t('c.clear'))) { commit(() => setRecords([])); enterSelect(); $('dlgSaves').close(); }
};
$('bHelp').onclick = () => $('dlgHelp').showModal();

/* ---------------- Toolbar and context bar ---------------- */
$('bRotY').onclick = () => rotate('y');
$('bRotX').onclick = () => rotate('x');
$('bRotZ').onclick = () => rotate('z');
$('bMove').onclick = pickUpSelected;
$('bDup').onclick = duplicateSelected;
$('bDel').onclick = deleteSelected;
$('bLess').onclick = () => changeDepth(-1);
$('bMore').onclick = () => changeDepth(1);
$('bFlip').onclick = flipPeg;
$('bCancel').onclick = cancelPlace;
$('bAll').onclick = () => { nudgeAll = !nudgeAll; refreshUI(); };
document.querySelectorAll('[data-nudge]').forEach(b => b.onclick = () => nudge(b.dataset.nudge, nudgeAll));
$('bDrop').onclick = dropToFloor;
$('bUndo').onclick = undo;
$('bRedo').onclick = redo;
$('bViewP').onclick = () => frameView('persp');
$('bViewT').onclick = () => frameView('top');
$('bViewF').onclick = () => frameView('front');

/* ---------------- Language ---------------- */
const langSel = $('lang');
langSel.innerHTML = LANGS.map(([code, name]) => `<option value="${code}">${name}</option>`).join('');
function applyLang(){
  langSel.value = getLang();
  document.title = t('app.title');
  applyStatic();
  buildPalette();
  buildExamples();
  refreshUI();
  if (asm) renderAsm(); else hint(mode === 'place' ? t('h.bring', { p:pname(placeType) }) : t('h.idle'));
}
langSel.onchange = () => { setLang(langSel.value); applyLang(); };

/* ---------------- Input ---------------- */
const cv = renderer.domElement;
let downAt = null;
cv.addEventListener('pointerdown', e => { downAt = { x:e.clientX, y:e.clientY, b:e.button }; });
cv.addEventListener('pointermove', e => { lastPointer = { clientX:e.clientX, clientY:e.clientY }; if (!asm) updateGhost(lastPointer); });
cv.addEventListener('pointerleave', () => { if (ghost) ghost.visible = false; });
cv.addEventListener('pointerup', e => {
  if (!downAt || downAt.b !== 0 || asm) return;
  const moved = Math.hypot(e.clientX-downAt.x, e.clientY-downAt.y);
  downAt = null;
  if (moved > 5) return;
  lastPointer = { clientX:e.clientX, clientY:e.clientY };
  if (mode === 'place'){ updateGhost(lastPointer); placeCurrent(); return; }
  const hit = pick(e);
  select(hit && hit.root ? hit.root : null);
  if (!selected) hint(t('h.idle'));
});

window.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
  const k = e.key.toLowerCase();
  if (asm){
    if (k === 'arrowright') asmGo(asm.i + 1);
    else if (k === 'arrowleft') asmGo(asm.i - 1);
    else if (k === ' ') $('asmPlay').click();
    else if (k === 'escape') closeAssembly();
    else return;
    e.preventDefault(); return;
  }
  if ((e.ctrlKey || e.metaKey) && k === 'z'){ e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === 'y'){ e.preventDefault(); redo(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (k){
    case 'escape': cancelPlace(); break;
    case 'r': rotate('y'); break;
    case 't': rotate('x'); break;
    case 'y': rotate('z'); break;
    case 'q': changeDepth(-1); break;
    case 'e': changeDepth(1); break;
    case 'm': pickUpSelected(); break;
    case 'd': duplicateSelected(); break;
    case 'g': dropToFloor(); break;
    case 'f': flipPeg(); break;
    case 'delete': case 'backspace': deleteSelected(); break;
    case 'arrowup': nudge('fwd', e.shiftKey); break;
    case 'arrowdown': nudge('back', e.shiftKey); break;
    case 'arrowright': nudge('right', e.shiftKey); break;
    case 'arrowleft': nudge('left', e.shiftKey); break;
    case 'pageup': nudge('up', e.shiftKey); break;
    case 'pagedown': nudge('down', e.shiftKey); break;
    default: return;
  }
  e.preventDefault();
});

/* ---------------- Start ---------------- */
const saved = store.get('modu.current.v1', null);
if (Array.isArray(saved) && saved.length) setRecords(saved);
else { setRecords(TEMPLATES[0].recs); lastTemplate = { tp:TEMPLATES[0], sig:sig() }; cleanSig = sig(); }
mode = 'select';
showTab(!!store.get('modu.tab', 0));
applyLang();
frameView('persp');

if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
  navigator.serviceWorker.register('./sw.js').catch(() => {});

/* ---------------- Consistency check (used to validate the examples) ---------------- */
function checkDesign(){
  const errs = [], ps = pieces();
  ps.forEach((o, i) => {
    const g = groupOf(o), name = `${i}:${o.userData.type}`;
    if (g === 'struct' || g === 'foam'){
      const b = objBox(o);
      if (b.min.y < -0.3) errs.push(`${name} below floor`);
      ps.forEach((p, j) => { if (j > i && (isStruct(p) || groupOf(p) === 'foam') && objBox(p).intersectsBox(b)) errs.push(`${name} collides with ${j}:${p.userData.type}`); });
    }
    if (g === 'peg'){
      const base = pegBase(o), a = pegAxis(o), len = CATALOG[o.userData.type].len;
      if (!hostStruct(ps, base)) errs.push(`${name} not in a hole`);
      if (ps.some((p, j) => j > i && groupOf(p) === 'peg' && pegBase(p).distanceTo(base) < 0.8)) errs.push(`${name} shares its hole`);
      for (const k of [0.5, 0.95]){
        const pt = base.clone().addScaledVector(a, (len - o.userData.depth)*k);
        if (pt.y < -0.2) errs.push(`${name} below floor`);
        const s = ps.find(p => isStruct(p) && structBox(p.userData.type,p.position,p.quaternion,0.3).containsPoint(pt) && !passesThroughHole(p, pt, a));
        if (s) errs.push(`${name} outer part inside ${s.userData.type}`);
      }
    }
    if (g === 'swirly' && !hostStruct(ps, o.position)) errs.push(`${name} not in a hole`);
  });
  const over = ORDER.filter(type => usedCount(type) > (DEFAULT_INV[type] ?? 0)).map(type => `${type}: ${usedCount(type)}/${DEFAULT_INV[type]}`);
  return { errs, over };
}
// Checks every example; returns only the ones with problems ('big' examples may exceed the Square count)
function validateAll(){
  const keep = records(), out = {};
  for (const tp of TEMPLATES){
    setRecords(tp.recs);
    const r = checkDesign();
    if (tp.group === 'big') r.over = r.over.filter(s => !s.startsWith('square'));
    if (r.errs.length || r.over.length) out[tp.id] = r;
  }
  setRecords(keep);
  refreshUI();
  return out;
}
window.__modu = { records, setRecords, pieces, scene, camera, TEMPLATES, checkDesign, validateAll, loadTemplate };
