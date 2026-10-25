/* BlockScene: renders base-10 blocks (hundreds flats, tens rods, ones cubes) in an SVG
 * and animates between scenes (share: blocks move to plates; exchange: a rod breaks into 10 cubes).
 * Layout in abstract units: cube = 10, gap = 1, so 10 cubes in a row = one rod = 109 wide,
 * 10 rods stacked = one flat = 109 tall. That makes every exchange a "break apart in place".
 */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const U = 10, G = 1, ROW = U + G, SLOT = 10 * U + 9 * G, SG = 16, PAD = 8, PG = 14;

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function chunk(arr, size) { const out = []; for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size)); return out; }

  /* ---- layout ---- */
  /* plan = fixed slot plan for the whole problem (so the pool does not jump between steps):
   * {flats, rodSlots, oneSlots, h} = max number of slots of each kind over all scenes. */
  function poolPlan(scenes) {
    const plan = { flats: 0, rodSlots: 0, oneSlots: 0, h: 30 };
    scenes.forEach((s) => {
      const pool = s.blocks.filter((b) => b.loc === 'pool');
      const nh = pool.filter((b) => b.kind === 'h').length;
      const nt = pool.filter((b) => b.kind === 't').length;
      const no = pool.filter((b) => b.kind === 'o').length;
      plan.flats = Math.max(plan.flats, nh);
      plan.rodSlots = Math.max(plan.rodSlots, Math.ceil(nt / 10));
      plan.oneSlots = Math.max(plan.oneSlots, Math.ceil(no / 100));
      const h = Math.max(nh ? SLOT : 0, Math.min(nt, 10) * ROW - G, Math.min(Math.ceil(no / 10), 10) * ROW - G);
      plan.h = Math.max(plan.h, h);
    });
    return plan;
  }

  function layoutPool(blocks, plan) {
    const pos = {};
    const flats = blocks.filter((b) => b.kind === 'h');
    const rods = blocks.filter((b) => b.kind === 't');
    const ones = blocks.filter((b) => b.kind === 'o');
    const slotX = (k) => k * (SLOT + SG);
    flats.forEach((b, k) => { pos[b.id] = { x: slotX(k), y: 0 }; });
    chunk(rods, 10).forEach((ch, s) => { const x = slotX(plan.flats + s); ch.forEach((b, k) => { pos[b.id] = { x, y: k * ROW }; }); });
    chunk(ones, 100).forEach((ch, s) => { const x = slotX(plan.flats + plan.rodSlots + s); ch.forEach((b, k) => { pos[b.id] = { x: x + (k % 10) * ROW, y: Math.floor(k / 10) * ROW }; }); });
    const nSlots = Math.max(1, plan.flats + plan.rodSlots + plan.oneSlots);
    const w = nSlots * (SLOT + SG) - SG;
    return { pos, w, h: plan.h, counts: { h: flats.length, t: rods.length, o: ones.length } };
  }

  function layoutPlate(blocks) {
    const pos = {};
    const flats = blocks.filter((b) => b.kind === 'h');
    const rods = blocks.filter((b) => b.kind === 't');
    const ones = blocks.filter((b) => b.kind === 'o');
    let y = PAD;
    flats.forEach((b, k) => { pos[b.id] = { x: PAD + k * (SLOT + 6), y }; });
    if (flats.length) y += SLOT + 8;
    rods.forEach((b, k) => { pos[b.id] = { x: PAD, y: y + k * ROW }; });
    if (rods.length) y += rods.length * ROW + 6;
    ones.forEach((b, k) => { pos[b.id] = { x: PAD + (k % 10) * ROW, y: y + Math.floor(k / 10) * ROW }; });
    if (ones.length) y += Math.ceil(ones.length / 10) * ROW;
    const w = Math.max(flats.length * (SLOT + 6) - 6, SLOT) + 2 * PAD;
    const h = Math.max(y + PAD, 50);
    return { pos, w, h, counts: { h: flats.length, t: rods.length, o: ones.length } };
  }

  function layoutScene(scene, d, plan) {
    const poolBlocks = scene.blocks.filter((b) => b.loc === 'pool');
    const pool = layoutPool(poolBlocks, plan);
    const plates = [];
    let plateW = SLOT + 2 * PAD, plateH = 50;
    for (let g = 0; g < d; g++) {
      const lp = layoutPlate(scene.blocks.filter((b) => b.loc === g));
      plates.push(lp); plateW = Math.max(plateW, lp.w); plateH = Math.max(plateH, lp.h);
    }
    const groupsW = d * plateW + (d - 1) * PG;
    const w = Math.max(pool.w, groupsW);
    const TOP = 26, ARROW = 46, BOTTOM = 30;
    const poolX = (w - pool.w) / 2, poolY = TOP;
    const groupsX = (w - groupsW) / 2, groupsY = TOP + pool.h + ARROW;
    const pos = {};
    for (const id in pool.pos) pos[id] = { x: poolX + pool.pos[id].x, y: poolY + pool.pos[id].y };
    const plateRects = [];
    plates.forEach((lp, g) => {
      const px = groupsX + g * (plateW + PG), py = groupsY;
      for (const id in lp.pos) pos[id] = { x: px + lp.pos[id].x, y: py + lp.pos[id].y };
      plateRects.push({ x: px, y: py, w: plateW, h: plateH, counts: lp.counts });
    });
    return { pos, w, h: groupsY + plateH + BOTTOM, pool: { x: poolX, y: poolY, w: pool.w, h: pool.h, counts: pool.counts }, plateRects };
  }

  /* ---- block drawing ---- */
  function makeBlock(kind) {
    const g = el('g', { class: 'blk k-' + kind });
    if (kind === 'o') {
      el('rect', { width: U, height: U, rx: 1.5 }, g);
    } else if (kind === 't') {
      el('rect', { width: SLOT, height: U, rx: 1.5 }, g);
      let dpath = '';
      for (let k = 1; k < 10; k++) { const x = k * ROW - G / 2; dpath += 'M' + x + ' 0 V' + U + ' '; }
      el('path', { d: dpath, class: 'seam' }, g);
    } else {
      el('rect', { width: SLOT, height: SLOT, rx: 2 }, g);
      let dpath = '';
      for (let k = 1; k < 10; k++) { const v = k * ROW - G / 2; dpath += 'M' + v + ' 0 V' + SLOT + ' M0 ' + v + ' H' + SLOT + ' '; }
      el('path', { d: dpath, class: 'seam' }, g);
    }
    return g;
  }
  function setXY(e, x, y) { e.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }

  class BlockScene {
    constructor(svg, opts) {
      this.svg = svg; this.opts = opts || {};
      this.els = new Map();
      this.bg = el('g', { class: 'bg' }, svg);
      this.layer = el('g', { class: 'blocks' }, svg);
      this.fg = el('g', { class: 'fg' }, svg);
      this.prevLayout = null; this.index = -1;
    }
    setProblem(tr, scenes) {
      this.tr = tr; this.scenes = scenes;
      const plan = poolPlan(scenes);
      this.layouts = scenes.map((s) => layoutScene(s, tr.d, plan));
      const W = Math.max(...this.layouts.map((l) => l.w)), H = Math.max(...this.layouts.map((l) => l.h));
      this.layouts.forEach((l) => {
        const dx = (W - l.w) / 2;
        if (dx) { for (const id in l.pos) l.pos[id].x += dx; l.pool.x += dx; l.plateRects.forEach((p) => { p.x += dx; }); }
      });
      this.W = W; this.H = H;
      this.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      this.svg.style.aspectRatio = W + ' / ' + H;
      this.els.forEach((e) => e.remove()); this.els.clear();
      this.prevLayout = null; this.index = -1;
    }
    labels(lay, scene) {
      const L = this.opts.labels || {};
      const step = scene.step || { type: 'start' };
      const back = step.type === 'check' || step.type === 'regroup';
      this.bg.innerHTML = ''; this.fg.innerHTML = '';
      const p = lay.pool;
      el('rect', { x: p.x - 10, y: p.y - 8, width: p.w + 20, height: p.h + 16, rx: 10, class: 'pool-rect' + (back ? ' back' : '') }, this.bg);
      const ptxt = el('text', { x: p.x - 10, y: p.y - 12, class: 'lbl' }, this.bg);
      const poolLabel = typeof L.pool === 'function' ? L.pool(step) : (L.pool || 'Pool');
      ptxt.textContent = poolLabel + ': ' + (L.comp ? L.comp(p.counts) : '');
      lay.plateRects.forEach((r, g) => {
        el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, class: 'plate-rect' }, this.bg);
        const t1 = el('text', { x: r.x + r.w / 2, y: r.y - 6, class: 'lbl plate-lbl', 'text-anchor': 'middle' }, this.bg);
        t1.textContent = (L.group || 'Group') + ' ' + (g + 1);
        const v = r.counts.h * 100 + r.counts.t * 10 + r.counts.o;
        const t2 = el('text', { x: r.x + r.w / 2, y: r.y + r.h + 18, class: 'lbl plate-val', 'text-anchor': 'middle' }, this.fg);
        t2.textContent = v;
      });
      // arrow pool -> groups (sharing) or groups -> pool (inverse check)
      const ax = this.W / 2, ay1 = p.y + p.h + 12, ay2 = lay.plateRects[0].y - 14;
      const head = back
        ? 'M' + (ax - 6) + ' ' + (ay1 + 7) + ' L' + ax + ' ' + ay1 + ' L' + (ax + 6) + ' ' + (ay1 + 7)
        : 'M' + (ax - 6) + ' ' + (ay2 - 7) + ' L' + ax + ' ' + ay2 + ' L' + (ax + 6) + ' ' + (ay2 - 7);
      el('path', { d: 'M' + ax + ' ' + ay1 + ' V' + ay2 + ' ' + head, class: 'arrow' + (back ? ' back' : '') }, this.bg);
      const atxt = el('text', { x: ax + 10, y: (ay1 + ay2) / 2 + 4, class: 'lbl' }, this.bg);
      atxt.textContent = (back ? '× ' : '÷ ') + this.tr.d;
    }
    show(index, animate) {
      if (!this.scenes) return;
      index = Math.max(0, Math.min(index, this.scenes.length - 1));
      const scene = this.scenes[index], lay = this.layouts[index];
      const prev = this.prevLayout;
      this.labels(lay, scene);
      const seen = new Set();
      let order = 0;
      scene.blocks.forEach((b) => {
        seen.add(b.id);
        let e = this.els.get(b.id);
        const p = lay.pos[b.id];
        const fresh = !e;
        if (fresh) {
          e = makeBlock(b.kind); this.layer.appendChild(e); this.els.set(b.id, e);
          let sx = p.x, sy = p.y;
          if (animate && b.from && prev && prev.pos[b.from]) {
            const fp = prev.pos[b.from];
            if (b.kind === 'o') { sx = fp.x + b.fromIndex * ROW; sy = fp.y; }
            else { sx = fp.x; sy = fp.y + b.fromIndex * ROW; }
          }
          e.style.transition = 'none'; setXY(e, sx, sy); void e.getBoundingClientRect(); e.style.transition = '';
        } else if (!animate) {
          e.style.transition = 'none';
        }
        e.classList.toggle('moved', b.flag === 'moved');
        e.classList.toggle('left', b.flag === 'left');
        e.classList.toggle('new', b.flag === 'new');
        const delay = animate && (b.flag === 'moved' || b.flag === 'new') ? (order++ * 35) : 0;
        e.style.transitionDelay = delay + 'ms';
        if (animate) requestAnimationFrame(() => setXY(e, p.x, p.y));
        else { setXY(e, p.x, p.y); void e.getBoundingClientRect(); e.style.transition = ''; }
      });
      this.els.forEach((e, id) => {
        if (!seen.has(id)) {
          this.els.delete(id);
          if (animate) { e.classList.add('gone'); setTimeout(() => e.remove(), 450); } else e.remove();
        }
      });
      this.prevLayout = lay; this.index = index;
    }
  }

  global.BlockScene = BlockScene;
})(window);
