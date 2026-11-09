/* On Display (concept 4) – live 3D walkthrough. Needs THREE (r128) (+ OrbitControls optional).
   World mm: X across the box width, Y along its length (0 = inside face of the FRONT end wall, + towards the rear), Z up (0 = inside floor).
   Provisional dimensions, sized around a UK 9 low-top trainer (295 x 108 x 110 mm). */
(function(){
const T = 3;                                   // board
const IW = 236, IL = 330, IH = 145;            // inside of the base
const X0 = IW/2;                               // 118
const LEDGE_W = 18, LEDGE_TOP = IH - 6, LEDGE_T = 3;          // side rim ledges (double wall), top at 134
const INNER_X = X0 - T;                        // inner wall layer face 115
const PW = 232, PL = 326, PT = 6, PY0 = 2;     // platform: double-layer, 6 thick, y 2..328 (local)
const LIP_Y = 6, LIP_H = 12;
const TAB_W = 44, TAB_L = 26;
const SX = 101.5, SY0 = 30, SY1 = 318;         // supports: hinge line x = +/-101.5 under the platform, y' 30..318
const FL_W = 14;                               // foot flange width
const DISPLAY = 12;                            // display angle (deg)
const SHOE = {L: 295, W: 102, H: 80};             // W = upper; cupsole adds 4 mm -> 106 mm wide
const LID = {ix: 123.5, y0: -6.5, y1: 336.5, H: 50, top: 161};
const BLACK = 0x161616, KRAFT = 0xc49a6c, KRAFT_D = 0xa97f52;
const d2r = THREE.MathUtils.degToRad;

function tex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
function mat(c, r=0.85, map){ return new THREE.MeshStandardMaterial({color: map ? 0xffffff : new THREE.Color(c).convertSRGBToLinear(), roughness: r, map: map||null}); }
function bx(w, d, h, m){ const g = new THREE.BoxGeometry(w, d, h); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; }
function at(o, x, y, z){ o.position.set(x, y, z); return o; }
// box with per-face materials [+x,-x,+y,-y,+z,-z]
function bx6(w, d, h, ms){ const o = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), ms); o.castShadow = o.receiveShadow = true; return o; }

function build(scene, logo){
  const black = mat(BLACK, 0.7), kraft = mat(KRAFT, 0.9), kraftD = mat(KRAFT_D, 0.9);
  const printed = (w, h, draw) => mat(0, 0.7, tex(w, h, draw));
  const printedRot = (w, h, draw, rot = Math.PI/2) => { const t = tex(w, h, draw); t.center.set(0.5, 0.5); t.rotation = rot; return mat(0, 0.7, t); };
  const logoAt = (g, cx, cy, wpx) => { if (!logo) return; const hpx = wpx*logo.height/logo.width; g.drawImage(logo, cx - wpx/2, cy - hpx/2, wpx, hpx); };
  const R = {};
  // ---------------- base ----------------
  const base = new THREE.Group(); scene.add(base); R.base = base;
  const fl = bx(IW + 2*T, IL + 2*T, T, black); at(fl, 0, IL/2, -T/2); base.add(fl);
  base.add(at(bx(IW, IL, 0.4, kraft), 0, IL/2, 0.2));
  const frontPrint = printed(1024, 600, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w/2, h*0.42, 300);
    g.fillStyle = '#ffffff'; g.font = '600 46px "Inter", Arial'; g.textAlign = 'center'; g.fillText('ON DISPLAY', w/2, h*0.80); });
  const sidePrint = printedRot(1400, 600, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w*0.86, h*0.5, 190);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '500 40px "Inter", Arial'; g.textAlign = 'left'; g.fillText('Keep the box. Show the shoes.', 70, h*0.86); });
  const sidePrintL = printedRot(1400, 600, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w*0.86, h*0.5, 190);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '500 40px "Inter", Arial'; g.textAlign = 'left'; g.fillText('Keep the box. Show the shoes.', 70, h*0.86); }, -Math.PI/2);
  const wallH = IH + T;
  // front end wall (outer face -y)
  base.add(at(bx6(IW + 2*T, T, wallH, [kraft, kraft, kraft, frontPrint, kraft, kraft]), 0, -T/2, wallH/2 - T));
  const rearPrint = printed(1024, 600, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w/2, h*0.45, 220); });
  rearPrint.map.center.set(0.5, 0.5); rearPrint.map.rotation = Math.PI;
  base.add(at(bx6(IW + 2*T, T, wallH, [kraft, kraft, rearPrint, kraft, kraft, kraft]), 0, IL + T/2, wallH/2 - T));
  const wallR = at(bx6(T, IL, wallH, [sidePrint, kraft, kraft, kraft, kraft, kraft]), X0 + T/2, IL/2, wallH/2 - T); base.add(wallR); R.cut = [wallR];
  base.add(at(bx6(T, IL, wallH, [kraft, sidePrintL, kraft, kraft, kraft, kraft]), -X0 - T/2, IL/2, wallH/2 - T));
  // inner wall layers + rim ledges (folded double wall) along both long sides
  for (const s of [1, -1]){
    const inner = at(bx(T, IL, LEDGE_TOP - LEDGE_T, kraftD), s*(INNER_X + T/2), IL/2, (LEDGE_TOP - LEDGE_T)/2); base.add(inner); if (s > 0) R.cut.push(inner);
    base.add(at(bx(LEDGE_W, IL, LEDGE_T, kraftD), s*(X0 - LEDGE_W/2), IL/2, LEDGE_TOP - LEDGE_T/2));
  }
  R.slots = [];
  // ---------------- platform (hinged at the top front edge) ----------------
  const plat = new THREE.Group(); plat.position.set(0, 0, IH); base.add(plat); R.plat = plat;
  const platTop = printed(1024, 1440, (g, w, h) => { g.fillStyle = '#c49a6c'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,55,30,.35)'; g.lineWidth = 3; g.setLineDash([14, 10]); g.strokeRect(40, 40, w - 80, h - 80); g.setLineDash([]);
    g.fillStyle = 'rgba(40,28,16,.55)'; g.font = '600 40px "Inter", Arial'; g.textAlign = 'center';
    g.fillText('KEEP THE BOX. SHOW THE SHOES.', w/2, h - 90); });
  const pBody = bx6(PW, PL, PT, [kraftD, kraftD, kraftD, kraftD, platTop, kraft]); at(pBody, 0, PY0 + PL/2, -PT/2); plat.add(pBody);
  for (const s of [1, -1]) plat.add(at(bx(10, PL - 4, 0.6, kraftD), s*(PW/2 - 5), PY0 + PL/2, -PT - 0.3));   // folded hems
  plat.add(at(bx(PW - 4, 3, LIP_H, kraft), 0, LIP_Y + 1.5, LIP_H/2));                                       // front lip
  plat.add(at(bx(PW, 4, 2.4, kraftD), 0, -1, -2));                                                         // scored hinge strip
  // rear pull tab (folded flat over the platform when packed, lifted to stand up)
  const tabPiv = new THREE.Group(); tabPiv.position.set(0, PY0 + PL, 0); plat.add(tabPiv); R.tab = tabPiv;
  const tabTex = printed(256, 160, (g, w, h) => { g.fillStyle = '#c49a6c'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1c10';
    g.beginPath(); g.moveTo(w/2, 26); g.lineTo(w/2 - 16, 52); g.lineTo(w/2 + 16, 52); g.fill(); g.font = '700 46px "Inter", Arial'; g.textAlign = 'center'; g.fillText('LIFT', w/2, 108); });
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(TAB_W, TAB_L), new THREE.MeshStandardMaterial({map: tabTex.map || tabTex, roughness: 0.9, side: THREE.DoubleSide}));
  tab.material = new THREE.MeshStandardMaterial({map: platTopTex(tabTex), roughness: 0.9, side: THREE.DoubleSide});
  function platTopTex(m){ return m.map; }
  tab.position.set(0, 0, TAB_L/2); tab.rotation.x = Math.PI/2; tab.castShadow = true; tabPiv.add(tab);
  const tabB = tab.clone(); tabB.material = new THREE.MeshStandardMaterial({map: tab.material.map, roughness: 0.9}); tabB.position.y = -1.4; tabB.rotation.set(Math.PI/2, Math.PI, 0); tabPiv.add(tabB); tab.material.side = THREE.FrontSide; tab.position.y = 0.05;
  tabPiv.add(at(bx(TAB_W, 1.2, TAB_L, kraft), 0, -0.7, TAB_L/2));
  // ---------------- supports: hinged to the platform underside, fold flat inwards ----------------
  const sinD = Math.sin(d2r(DISPLAY)), cosD = Math.cos(d2r(DISPLAY));
  const ledgeZ = y => (LEDGE_TOP - IH - y*sinD)/cosD;           // platform-local z' of the ledge top at display angle
  R.sup = []; R.flange = []; R.tabs = [];
  for (const s of [1, -1]){
    const piv = new THREE.Group(); piv.position.set(s*SX, 0, -PT); plat.add(piv);
    // panel built in its deployed pose: plane x=0, from the hinge (z=0) down to 3 mm above the ledge (the foot flange sits under it)
    const zb0 = ledgeZ(SY0 + 4) + PT + T, zb1 = ledgeZ(SY1) + PT + T;
    const shp = new THREE.Shape([new THREE.Vector2(SY0, 0), new THREE.Vector2(SY1, 0), new THREE.Vector2(SY1, zb1), new THREE.Vector2(SY0 + 4, zb0)]);
    const pg = new THREE.ExtrudeGeometry(shp, {depth: T, bevelEnabled: false});
    const pos = pg.attributes.position;
    for (let i = 0; i < pos.count; i++){ const u = pos.getX(i), v = pos.getY(i), w = pos.getZ(i); pos.setXYZ(i, w - T/2, u, v); }
    pg.computeVertexNormals();
    const supMat = mat(0x7d5533, 0.85); const panel = new THREE.Mesh(pg, [supMat, kraftD]); panel.castShadow = panel.receiveShadow = true; piv.add(panel); panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(pg, 20), new THREE.LineBasicMaterial({color: 0x4a311b})));
    // foot flange: hinged on the panel's outer bottom corner, folds out flat onto the rim ledge
    const e0 = new THREE.Vector3(s*T/2, SY0 + 4, zb0), e1 = new THREE.Vector3(s*T/2, SY1, zb1);
    const fpiv = new THREE.Group(); fpiv.position.copy(e0); piv.add(fpiv);
    const dir = e1.clone().sub(e0); const len = dir.length(); dir.normalize();
    fpiv.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const fin = new THREE.Group(); fpiv.add(fin);
    const flange = bx(FL_W, len, T, mat(0x7d5533, 0.85)); flange.position.set(s*FL_W/2, len/2, -T/2); fin.add(flange); flange.add(new THREE.LineSegments(new THREE.EdgesGeometry(flange.geometry), new THREE.LineBasicMaterial({color: 0x4a311b})));
    const lockTab = bx(8, 16, 10, mat(0x7d5533, 0.85)); lockTab.position.set(s*(FL_W - 6), len - 36, -T - 5); fin.add(lockTab);
    R.lockTabs = (R.lockTabs || []).concat([lockTab]);
    R.sup.push({piv, s}); R.flange.push({fin, s});
  }
  // ---------------- lid ----------------
  const lid = new THREE.Group(); scene.add(lid); R.lid = lid;
  const lidTop = printed(1024, 1440, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
    logoAt(g, w/2, h*0.42, 420);
    g.fillStyle = '#ffffff'; g.font = '600 66px "Inter", Arial'; g.textAlign = 'center'; g.fillText('ON DISPLAY', w/2, h*0.64);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '500 38px "Inter", Arial'; g.fillText('Keep the box. Show the shoes.', w/2, h*0.69); });
  const lw = 2*LID.ix + 2*T, ll = LID.y1 - LID.y0 + 2*T;
  lid.add(at(bx6(lw, ll, T, [kraft, kraft, kraft, kraft, lidTop, kraft]), 0, (LID.y0 + LID.y1)/2, LID.H - T/2));
  const lidSide = printedRot(1400, 200, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w*0.86, h*0.5, 120); });
  const lidSideL = printedRot(1400, 200, (g, w, h) => { g.fillStyle = '#161616'; g.fillRect(0, 0, w, h); logoAt(g, w*0.86, h*0.5, 120); }, -Math.PI/2);
  lid.add(at(bx6(lw, T, LID.H - T, [kraft, kraft, kraft, black, kraft, kraft]), 0, LID.y0 - T/2, (LID.H - T)/2));
  lid.add(at(bx6(lw, T, LID.H - T, [kraft, kraft, black, kraft, kraft, kraft]), 0, LID.y1 + T/2, (LID.H - T)/2));
  lid.add(at(bx6(T, ll, LID.H - T, [lidSide, kraft, kraft, kraft, kraft, kraft]), LID.ix + T/2, (LID.y0 + LID.y1)/2, (LID.H - T)/2));
  lid.add(at(bx6(T, ll, LID.H - T, [kraft, lidSideL, kraft, kraft, kraft, kraft]), -LID.ix - T/2, (LID.y0 + LID.y1)/2, (LID.H - T)/2));
  // ---------------- trainers ----------------
  R.shoes = [shoe(scene, 1), shoe(scene, -1)];
  return R;
}

/* simple low-top suede trainer (Campus-like silhouette, no brand marks): lofted upper on a cream cupsole with gum outsole.
   local: toe at y=0, heel at y=L, sole bottom z=0, centred on x=0 */
function shoe(scene, side){
  const g = new THREE.Group(); scene.add(g);
  const L = SHOE.L, W = SHOE.W, OUT = 5, MID = 15, SOLE = OUT + MID;
  const sm = u => u*u*(3 - 2*u);
  const lerpK = (K, t) => { for (let i = 1; i < K.length; i++) if (t <= K[i][0]){ const [t0, v0] = K[i-1], [t1, v1] = K[i]; return v0 + (v1 - v0)*sm((t - t0)/(t1 - t0)); } return K[K.length-1][1]; };
  // plan outline (half width): rounded toe, waist under the arch, squarer heel
  const outline = t => { const toe = Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, 0.22 - t)/0.22, 2))), heel = Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, t - 0.86)/0.14, 2.6)));
    const waist = 1 - 0.13*Math.exp(-Math.pow((t - 0.6)/0.12, 2)); const taper = t < 0.4 ? 1 : 1 - 0.09*(t - 0.4)/0.6; return W/2*toe*heel*waist*taper; };
  const plan = (k, n=72) => { const pts = [new THREE.Vector2(0, 0)]; for (let i = 1; i < n; i++){ const t = i/n; pts.push(new THREE.Vector2(outline(t)*k, t*L)); }
    pts.push(new THREE.Vector2(0, L)); for (let i = n - 1; i >= 1; i--){ const t = i/n; pts.push(new THREE.Vector2(-outline(t)*k, t*L)); } return new THREE.Shape(pts); };
  const ext = (shape, d, m, z) => { const o = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: d, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 1.2, bevelSegments: 2, curveSegments: 4}), m); o.position.z = z; o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  const C = c => new THREE.Color(c).convertSRGBToLinear();
  ext(plan(1.0), OUT - 1.6, new THREE.MeshStandardMaterial({color: C(0xa8743f), roughness: 0.8}), 0.8);
  ext(plan(1.0), MID - 1.6, new THREE.MeshStandardMaterial({color: C(0xeee8da), roughness: 0.7}), OUT + 0.8);
  // upper: side-profile heights above the midsole, superellipse sections
  const TOP = [[0, 6], [0.05, 22], [0.12, 34], [0.25, 42], [0.4, 52], [0.56, 62], [0.63, 60], [0.71, 52], [0.8, 51], [0.9, 58], [0.97, 64], [1, 62]];
  const M = 80, K = 26, pos = [], idx = [];
  for (let i = 0; i <= M; i++){ const t = 0.004 + 0.992*i/M, w = outline(t)*0.95, h = lerpK(TOP, t);
    for (let j = 0; j <= K; j++){ const a = Math.PI*j/K, c = Math.cos(a), sn = Math.sin(a);
      pos.push(Math.sign(c)*Math.pow(Math.abs(c), 0.6)*w, t*L, SOLE - 1 + Math.pow(Math.max(0, sn), 0.55)*h); } }
  for (let i = 0; i < M; i++) for (let j = 0; j < K; j++){ const a0 = i*(K + 1) + j, b0 = a0 + K + 1; idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1); }
  const ug = new THREE.BufferGeometry(); ug.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ug.setIndex(idx); ug.computeVertexNormals();
  const suede = new THREE.MeshStandardMaterial({color: C(0x8e908f), roughness: 0.97, side: THREE.DoubleSide});
  const upper = new THREE.Mesh(ug, suede); upper.castShadow = upper.receiveShadow = true; g.add(upper);
  const white = new THREE.MeshStandardMaterial({color: 0xf6f5f2, roughness: 0.6});
  // collar opening with a white lining rim, and the tongue rising out of it
  const yC = L*0.79, hC = lerpK(TOP, 0.79);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({color: 0x2c2b29, roughness: 1}));
  hole.scale.set(W*0.32, L*0.12, 1); hole.position.set(0, yC, SOLE + hC - 0.5); g.add(hole);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.11, 8, 48), white); rim.scale.set(W*0.36, L*0.145, 9); rim.position.set(0, yC, SOLE + hC - 0.2); g.add(rim);

  // white laces across the throat
  for (let k = 0; k < 6; k++){ const t = 0.36 + k*0.045; const l = new THREE.Mesh(new THREE.BoxGeometry(W*0.38, 4, 2.6), white);
    l.position.set(0, t*L, SOLE + lerpK(TOP, t) + 0.6); l.rotation.x = -0.35; l.castShadow = true; g.add(l); }
  // heel tab
  const ht = new THREE.Mesh(new THREE.BoxGeometry(30, 5, 30), white); ht.position.set(0, L - 3, SOLE + 46); g.add(ht);
  g.userData.side = side; return g;
}

/* ---------------- poses ---------------- */
const lerp = (a, b, u) => a + (b - a)*u, ez = u => u < 0.5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
function lidPose(p){ // 0 on, 1 aside (left of the box), 2 under the box
  const on = new THREE.Vector3(0, 0, LID.top - LID.H + T), aside = new THREE.Vector3(-320, -250, -T), under = new THREE.Vector3(0, 0, -T);
  if (p <= 1){ const u = p; const up = 200*Math.sin(Math.PI*u);
    return new THREE.Vector3(lerp(on.x, aside.x, ez(u)), lerp(on.y, aside.y, ez(u)), lerp(on.z, aside.z, ez(u)) + up); }
  const u = p - 1; const up = 30*Math.sin(Math.PI*u);
  return new THREE.Vector3(lerp(aside.x, under.x, ez(u)), lerp(aside.y, under.y, ez(u)), lerp(aside.z, under.z, ez(u)) + up);
}
function shoeTargets(R, k, lift){ // world matrices for shoe k at the three poses
  const s = k === 0 ? 1 : -1, x = s*57;
  const packed = new THREE.Matrix4().compose(new THREE.Vector3(x, k === 0 ? 17 : IL - 17, 0.4), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), k === 0 ? 0 : Math.PI), new THREE.Vector3(1, 1, 1));
  const table = new THREE.Matrix4().compose(new THREE.Vector3(215 + k*125, -40 + k*40, -T), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), d2r(-8)), new THREE.Vector3(1, 1, 1));
  // display: on the platform top, toes at the front lip, both side by side
  const disp = new THREE.Matrix4();
  const pm = new THREE.Matrix4().makeTranslation(0, 0, lift).multiply(new THREE.Matrix4().makeTranslation(0, 0, IH)).multiply(new THREE.Matrix4().makeRotationX(d2r(DISPLAY)));
  disp.copy(pm).multiply(new THREE.Matrix4().makeTranslation(s*58, 14, 0.2));
  return [packed, table, disp];
}
function blendM(a, b, u, arc){ const pa = new THREE.Vector3(), qa = new THREE.Quaternion(), sa = new THREE.Vector3(), pb = new THREE.Vector3(), qb = new THREE.Quaternion(), sb = new THREE.Vector3();
  a.decompose(pa, qa, sa); b.decompose(pb, qb, sb); const e = ez(u);
  const p = pa.clone().lerp(pb, e); p.z += arc*Math.sin(Math.PI*u); return new THREE.Matrix4().compose(p, qa.clone().slerp(qb, e), new THREE.Vector3(1, 1, 1)); }

function apply(R, S){
  R.base.position.z = S.lift; for (const m of R.cut) m.visible = !S.cut;
  R.plat.rotation.x = d2r(S.plat);
  R.tab.rotation.x = d2r(lerp(90, 0, S.tab));                  // 90 = folded flat over the platform, 0 = standing up
  for (const {piv, s} of R.sup) piv.rotation.y = d2r(s*90*(1 - S.sup));
  for (const {fin, s} of R.flange) fin.rotation.y = d2r(-s*lerp(90, 0, S.flange));
  const lp = lidPose(S.lid); R.lid.position.copy(lp); R.lid.visible = !S.noLid;
  for (let k = 0; k < 2; k++){ const [pk, tb, ds] = shoeTargets(R, k, S.lift); const sh = R.shoes[k];
    let m; if (S.shoes <= 1) m = blendM(pk, tb, S.shoes, 260); else m = blendM(tb, ds, S.shoes - 1, 240);
    sh.matrixAutoUpdate = false; sh.matrix.copy(m); sh.matrixWorldNeedsUpdate = true; sh.visible = S.showShoes; }
}

/* steps: keyframes [t, partial state]; params hold between keys */
const S0 = {lid: 0, plat: 0, tab: 0, sup: 0, flange: 0, lift: 0, shoes: 0};
const STEPS = [
  [[0, {}]],
  [[0, {}], [0.22, {lid: 1}], [0.40, {plat: 108}], [0.78, {shoes: 1}], [1, {plat: 0}]],
  [[0, {}], [0.35, {tab: 1}], [1, {plat: 30}]],
  [[0, {}], [0.45, {sup: 1}], [0.62, {flange: 1}], [1, {plat: DISPLAY}]],
  [[0, {}], [0.18, {lift: 52}], [0.5, {lid: 2}], [0.62, {lift: LID.H}], [1, {shoes: 2}]]];
function endState(i){ let s = {...S0}; for (let k = 0; k <= i; k++) for (const [, p] of STEPS[k]) Object.assign(s, p); return s; }
function sample(i, u){ const base = i ? endState(i - 1) : {...S0}; const keys = STEPS[i]; const out = {...base};
  for (const name of Object.keys(S0)){ let t0 = 0, v0 = base[name];
    for (const [t, p] of keys){ if (!(name in p)) continue; const v1 = p[name];
      if (u >= t){ t0 = t; v0 = v1; continue; } out[name] = lerp(v0, v1, ez((u - t0)/(t - t0))); v0 = null; break; }
    if (v0 !== null) out[name] = v0; }
  return out; }

window.mountOnDisplay = function(el, steps, opts){
  opts = opts || {};
  el.innerHTML = `<div class="player"><div class="stage od-stage"><canvas aria-label="Interactive 3D model of the On Display shoebox: drag to rotate"></canvas><span class="count"></span><span class="load">Loading…</span></div>
    <div class="talk"><div class="steps">${steps.map((s,i)=>`<button class="step" data-i="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><h3>${s.t}</h3><p>${s.b}</p></span></button>`).join('')}</div>
    <label class="rot"><span>Rotate view</span><input type="range" min="-70" max="70" value="0" step="1" aria-label="Rotate view"></label>
    <label class="rot"><input type="checkbox" class="shoesbox" checked style="flex:0;min-height:auto;width:18px;height:18px"><span>Show trainers</span></label>
    <div class="ctrl"><button data-a="prev">← Back</button><button class="primary" data-a="next">Next step →</button><button data-a="replay">Replay</button></div></div></div>`;
  const cv = el.querySelector('canvas'), count = el.querySelector('.count'), load = el.querySelector('.load');
  const renderer = new THREE.WebGLRenderer({canvas: cv, antialias: true, preserveDrawingBuffer: !!opts.capture});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(opts.bg || 0xeae5df, 1);
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(28, 1, 10, 12000); cam.up.set(0, 0, 1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f70, 0.8));
  const key = new THREE.DirectionalLight(0xfff6ea, 0.95); key.position.set(-600, -900, 1400); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {left: -800, right: 800, top: 800, bottom: -800, near: 100, far: 4500}); key.shadow.bias = -0.0005; key.shadow.radius = 5; key.target.position.set(0, 160, 0); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(800, -300, 500); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.ShadowMaterial({opacity: 0.18})); ground.position.z = -T - 0.2; ground.receiveShadow = true; scene.add(ground);
  const ctrl = (THREE.OrbitControls && opts.orbit !== false) ? new THREE.OrbitControls(cam, cv) : null;
  const target = new THREE.Vector3(70, 150, 95), base = {r: 1750, el: 24, az: -60};
  let camOverride = null, azOffset = 0, camV = null, camAnim = null;
  // camera follows what each step is about: keys [t, view] sampled with the step's progress
  const CV = {closed: {r: 1300, el: 22, az: -55, x: 0, y: 165, z: 90}, wide: {r: 1750, el: 24, az: -62, x: 70, y: 150, z: 120},
    table: {r: 1650, el: 22, az: -72, x: 150, y: 110, z: 110}, tab: {r: 1150, el: 24, az: 130, x: 0, y: 250, z: 200},
    under: {r: 900, el: 6, az: 108, x: 0, y: 290, z: 175}, locked: {r: 1000, el: 13, az: 122, x: 0, y: 250, z: 170},
    lift: {r: 1550, el: 18, az: -42, x: 0, y: 160, z: 150}, show: {r: 1250, el: 15, az: -56, x: 10, y: 165, z: 180}};
  const CAMS = [[[0, CV.closed]], [[0, CV.closed], [0.25, CV.wide], [0.7, CV.table], [1, CV.table]], [[0, CV.table], [0.5, CV.tab], [1, CV.tab]],
    [[0, CV.tab], [0.45, CV.under], [1, CV.locked]], [[0, CV.locked], [0.45, CV.lift], [1, CV.show]]];
  const mixV = (a, b, e) => { const o = {}; for (const k of ['r', 'el', 'x', 'y', 'z']) o[k] = lerp(a[k], b[k], e); o.az = a.az + ((b.az - a.az + 540) % 360 - 180)*e; return o; };
  function camAt(i, u){ const K = CAMS[i]; if (u <= K[0][0]) return K[0][1];
    for (let k = 1; k < K.length; k++) if (u <= K[k][0]){ const [t0, a] = K[k-1], [t1, b] = K[k]; return mixV(a, b, ez((u - t0)/(t1 - t0))); } return K[K.length-1][1]; }
  function placeCam(azOff){ if (azOff !== undefined) azOffset = azOff; const v = camOverride || camV || base;
    const tg = v.target ? new THREE.Vector3(v.target.x, v.target.y, v.target.z) : (v.x !== undefined ? new THREE.Vector3(v.x, v.y, v.z) : target); const az = d2r(v.az + azOffset), elv = d2r(v.el);
    cam.position.set(tg.x + v.r*Math.cos(elv)*Math.cos(az), tg.y + v.r*Math.cos(elv)*Math.sin(az), tg.z + v.r*Math.sin(elv)); cam.lookAt(tg);
    if (ctrl){ ctrl.target.copy(tg); ctrl.update(); } }
  if (ctrl){ ctrl.enableDamping = true; ctrl.enablePan = false; ctrl.minDistance = 500; ctrl.maxDistance = 3200; }
  placeCam(0);
  el.querySelector('.rot input[type=range]').addEventListener('input', e => placeCam(+e.target.value));
  let showShoes = true; el.querySelector('.shoesbox').addEventListener('change', e => { showShoes = e.target.checked; });
  function resize(){ const w = cv.clientWidth, h = cv.clientHeight; if (!w) return; renderer.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); }
  let R = null, cur = 0, anim = null, state = {...S0};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = new Image();
  Promise.all([new Promise(r => { logo.onload = () => r(logo); logo.onerror = () => r(null); logo.src = opts.logo || 'f/adidas_logo.png'; }), document.fonts ? document.fonts.ready : null])
    .then(([lg]) => { R = build(scene, lg);
      apply(R, {...endState(3), showShoes: false}); scene.updateMatrixWorld(true);
      for (const lt of R.lockTabs){ const p = new THREE.Vector3(); lt.getWorldPosition(p);
        const slot = new THREE.Mesh(new THREE.PlaneGeometry(9, 17), new THREE.MeshBasicMaterial({color: 0x1a120a})); slot.position.set(p.x, p.y, LEDGE_TOP + 0.08); R.base.add(slot); }
      load.textContent = ''; go(0, true); });
  const DUR = [1, 4200, 1800, 2600, 3200];
  function setUI(){ el.querySelectorAll('.step').forEach((b, j) => b.setAttribute('aria-current', j === cur)); count.textContent = `Step ${cur + 1} of ${steps.length}`;
    el.querySelector('[data-a="next"]').textContent = cur === steps.length - 1 ? 'Back to start' : 'Next step →'; }
  const lastCam = i => CAMS[i][CAMS[i].length - 1][1];
  function camTo(view, ms){ camAnim = {from: camV || base, to: view, t0: performance.now(), ms}; }
  function go(i, instant){ cur = Math.max(0, Math.min(steps.length - 1, i)); setUI();
    if (instant || reduce){ state = endState(cur); anim = null; camV = lastCam(cur); camAnim = null; placeCam(); return; }
    anim = {kind: 'step', i: cur, t0: performance.now(), ms: DUR[cur]}; camAnim = {follow: cur, from: camV || base}; }
  function back(){ const t = Math.max(0, cur - 1); anim = {kind: 'blend', from: {...state}, to: endState(t), t0: performance.now(), ms: 1100}; cur = t; setUI(); camTo(lastCam(t), 1100); }
  el.querySelectorAll('.step').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i === cur + 1 || i === cur) go(i); else { cur = i; setUI(); anim = {kind: 'blend', from: {...state}, to: endState(i), t0: performance.now(), ms: 1300}; camTo(lastCam(i), 1300); } });
  el.querySelector('[data-a="prev"]').onclick = back;
  el.querySelector('[data-a="next"]').onclick = () => cur === steps.length - 1 ? (cur = 0, setUI(), anim = {kind: 'blend', from: {...state}, to: endState(0), t0: performance.now(), ms: 1400}, camTo(lastCam(0), 1400)) : go(cur + 1);
  el.querySelector('[data-a="replay"]').onclick = () => { if (cur === 0) return; state = endState(cur - 1); go(cur); };
  function tick(t){ if (!el.isConnected){ renderer.dispose(); return; }
    resize();
    if (anim){ const u = Math.min(1, (t - anim.t0)/anim.ms);
      if (anim.kind === 'step') state = sample(anim.i, u);
      else { const e = ez(u); state = {}; for (const k in anim.to) state[k] = lerp(anim.from[k], anim.to[k], e); }
      if (camAnim && camAnim.follow === anim.i && anim.kind === 'step'){ const v = camAt(anim.i, u); camV = u < 0.15 ? mixV(camAnim.from, v, ez(u/0.15)) : v; placeCam(); }
      if (u >= 1){ anim = null; if (camAnim && camAnim.follow !== undefined) camAnim = null; } }
    if (camAnim && camAnim.follow === undefined){ const u = Math.min(1, (t - camAnim.t0)/camAnim.ms); camV = mixV(camAnim.from, camAnim.to, ez(u)); placeCam(); if (u >= 1) camAnim = null; }
    if (R) apply(R, {...state, showShoes});
    if (ctrl) ctrl.update(); renderer.render(scene, cam); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  el.__od = {setState: (s, show) => { anim = null; state = {...S0, ...s}; if (show !== undefined) showShoes = show; }, endState, placeCam,
             setView: v => { camOverride = v; placeCam(0); },
             project: pts => { scene.updateMatrixWorld(true); cam.updateMatrixWorld(); return pts.map(p => { const v = new THREE.Vector3(...p).project(cam); return [(v.x + 1)/2*cv.width, (1 - v.y)/2*cv.height]; }); }, renderer, scene, cam, R: () => R};
  return {next: () => el.querySelector('[data-a="next"]').click(), prev: back, go};
};
window.__odDims = {T, IW, IL, IH, LEDGE_W, LEDGE_TOP, PW, PL, PT, SX, SY0, SY1, DISPLAY, SHOE, LID};
})();
