/* Division engine: pure logic, no DOM.
 * trace(N, d)       -> column-by-column record of the bus-stop division
 * buildSteps(tr)    -> teaching steps (start / share / exchange / result)
 * buildScenes(tr, steps) -> base-10 block states for every step (for animation)
 * cellList(tr, layout)   -> ordered written cells (what the child writes, in order)
 * gen(level, divisors)   -> random problem for a level
 */
(function (global) {
  'use strict';

  const KINDS = ['h', 't', 'o'];

  function trace(N, d) {
    const digits = String(N).split('').map(Number);
    const n = digits.length;
    const kinds = KINDS.slice(3 - n);
    let carry = 0;
    const cols = [];
    for (let i = 0; i < n; i++) {
      const avail = carry * 10 + digits[i];
      const q = Math.floor(avail / d);
      const used = q * d;
      const left = avail - used;
      cols.push({
        i, kind: kinds[i], nextKind: kinds[i + 1] || null, digit: digits[i], nextDigit: digits[i + 1],
        carryIn: carry, avail, q, used, left, isLast: i === n - 1,
        leadingZero: i === 0 && q === 0 && n > 1
      });
      carry = left;
    }
    const quotient = Math.floor(N / d);
    const qDigits = String(quotient).split('').map(Number);
    return { N, d, digits, n, kinds, cols, quotient, qDigits, remainder: N % d };
  }

  function buildSteps(tr) {
    const steps = [{ type: 'start' }];
    tr.cols.forEach((c) => {
      steps.push({ type: 'share', col: c.i });
      if (c.left > 0 && !c.isLast) steps.push({ type: 'exchange', col: c.i });
    });
    steps.push({ type: 'result' });
    steps.push({ type: 'check' }); // inverse: put the groups back together (d × quotient + r)
    const counts = { h: 0, t: 0, o: 0 };
    tr.cols.forEach((c) => { counts[c.kind] += c.q * tr.d; });
    counts.o += tr.remainder;
    const tens = counts.t + Math.floor(counts.o / 10);
    if (counts.o >= 10 || tens >= 10) steps.push({ type: 'regroup' }); // 10 ones -> 1 ten, 10 tens -> 1 hundred
    return steps;
  }

  function buildScenes(tr, steps) {
    let nextId = 1;
    const mk = (kind, loc, from, fromIndex) => ({ id: kind + (nextId++), kind, loc, from: from || null, fromIndex: fromIndex || 0, flag: null });
    const clone = (bs) => bs.map((b) => Object.assign({}, b, { from: null, fromIndex: 0, flag: null }));
    let blocks = [];
    tr.cols.forEach((c) => { for (let k = 0; k < c.digit; k++) blocks.push(mk(c.kind, 'pool')); });
    const scenes = [{ blocks: clone(blocks), step: steps[0], removed: [] }];
    for (let s = 1; s < steps.length; s++) {
      const st = steps[s];
      blocks = clone(blocks);
      let removed = [];
      if (st.type === 'share') {
        const c = tr.cols[st.col];
        const poolOfKind = blocks.filter((b) => b.loc === 'pool' && b.kind === c.kind);
        for (let k = 0; k < c.used; k++) { poolOfKind[k].loc = k % tr.d; poolOfKind[k].flag = 'moved'; }
        for (let k = c.used; k < poolOfKind.length; k++) poolOfKind[k].flag = 'left';
      } else if (st.type === 'exchange') {
        const c = tr.cols[st.col];
        const nextKind = tr.kinds[st.col + 1];
        const leftovers = blocks.filter((b) => b.loc === 'pool' && b.kind === c.kind);
        const fresh = [];
        leftovers.forEach((big) => { for (let k = 0; k < 10; k++) { const nb = mk(nextKind, 'pool', big.id, k); nb.flag = 'new'; fresh.push(nb); } });
        removed = leftovers.map((b) => b.id);
        blocks = blocks.filter((b) => !leftovers.includes(b));
        const idx = blocks.findIndex((b) => b.kind === nextKind);
        if (idx < 0) blocks.push(...fresh); else blocks.splice(idx, 0, ...fresh);
      } else if (st.type === 'result') {
        blocks.forEach((b) => { if (b.loc === 'pool') b.flag = 'left'; });
      } else if (st.type === 'check') {
        blocks.forEach((b) => { if (b.loc !== 'pool') { b.loc = 'pool'; b.flag = 'moved'; } });
      } else if (st.type === 'regroup') {
        const order = ['o', 't', 'h'];
        for (let ki = 0; ki < 2; ki++) {
          const kind = order[ki], up = order[ki + 1];
          let same = blocks.filter((b) => b.kind === kind && b.loc === 'pool');
          while (same.length >= 10) {
            const ten = same.slice(0, 10);
            removed.push(...ten.map((b) => b.id));
            blocks = blocks.filter((b) => !ten.includes(b));
            const nb = mk(up, 'pool', ten[0].id, 0); nb.flag = 'new';
            let idx = -1; blocks.forEach((b, i) => { if (b.kind === up) idx = i; });
            if (idx < 0) blocks.push(nb); else blocks.splice(idx + 1, 0, nb);
            same = blocks.filter((b) => b.kind === kind && b.loc === 'pool');
          }
        }
      }
      scenes.push({ blocks, step: st, removed });
    }
    return scenes;
  }

  /* Ordered list of written cells. Each cell: {col, phase, expected, kind}
   * short layout phases per column: q, carry (carry only if not last)
   * long layout phases per column:  q, used, left, bring (bring only if not last)
   * A leading-zero column (first digit < divisor) writes nothing in the quotient;
   * in the short layout it only writes the carry, in the long layout the next column
   * absorbs it (values are right-aligned so they naturally span two columns).
   * remainder: cell {phase:'rem'} appended when remainder > 0 (short layout only; in the
   * long layout the last 'left' is the remainder).
   */
  function cellList(tr, layout) {
    const cells = [];
    tr.cols.forEach((c) => {
      if (layout === 'short') {
        if (!c.leadingZero) cells.push({ col: c.i, phase: 'q', expected: c.q });
        if (!c.isLast) cells.push({ col: c.i, phase: 'carry', expected: c.left });
      } else {
        if (c.leadingZero) return; // merged into the next column
        cells.push({ col: c.i, phase: 'q', expected: c.q });
        cells.push({ col: c.i, phase: 'used', expected: c.used });
        cells.push({ col: c.i, phase: 'left', expected: c.left });
        if (!c.isLast) cells.push({ col: c.i, phase: 'bring', expected: tr.cols[c.i + 1].avail });
      }
    });
    if (layout === 'short' && tr.remainder > 0) cells.push({ col: tr.n - 1, phase: 'rem', expected: tr.remainder });
    return cells;
  }

  /* Map a teaching step to the number of written cells that should be visible after it. */
  function cellsUpTo(tr, layout, step) {
    const cells = cellList(tr, layout);
    if (step.type === 'start') return 0;
    if (step.type === 'result' || step.type === 'check' || step.type === 'regroup') return cells.length;
    const c = tr.cols[step.col];
    let lastPhase;
    if (step.type === 'share') lastPhase = layout === 'short' ? 'q' : 'left';
    else lastPhase = layout === 'short' ? 'carry' : 'bring';
    if (step.type === 'share' && c.leadingZero) {
      // nothing is written for a leading-zero column until it is exchanged
      return cells.filter((x) => x.col < step.col).length;
    }
    let idx = -1;
    cells.forEach((x, k) => { if (x.col === step.col && x.phase === lastPhase) idx = k; });
    if (idx < 0) { cells.forEach((x, k) => { if (x.col <= step.col) idx = k; }); }
    return idx + 1;
  }

  /* ---------- problem generation ---------- */
  const PRESETS = [
    { N: 56, d: 4, tag: 'book-example' },
    { N: 69, d: 3, tag: 'book' }, { N: 85, d: 5, tag: 'book' }, { N: 84, d: 6, tag: 'book' },
    { N: 52, d: 4, tag: 'book' }, { N: 78, d: 6, tag: 'book' }, { N: 72, d: 3, tag: 'book' }
  ];

  function digitsOf(N) { return String(N).split('').map(Number); }
  function hasRegroup(N, d) { const t = trace(N, d); return t.cols.some((c, i) => i < t.n - 1 && c.left > 0); }

  const LEVELS = [
    { id: 'L1', digits: 2, test: (N, d) => { const [t, o] = digitsOf(N); return t >= d && t % d === 0 && o % d === 0; } },
    { id: 'L2', digits: 2, test: (N, d) => { const [t] = digitsOf(N); return t >= d && N % d === 0 && t % d !== 0; } },
    { id: 'L3', digits: 2, test: (N, d) => { const [t] = digitsOf(N); return t >= d && N % d !== 0; } },
    { id: 'L4', digits: 3, test: (N, d) => { const [h] = digitsOf(N); return h >= d && N % d === 0 && hasRegroup(N, d) && !String(Math.floor(N / d)).includes('0'); } },
    { id: 'L5', digits: 3, test: (N, d) => { const [h] = digitsOf(N); return h < d && N % d === 0 && h > 0; } },
    { id: 'L6', digits: 3, test: (N, d) => { const t = trace(N, d); return N % d === 0 && t.quotient >= 100 && t.cols.some((c, i) => i > 0 && c.q === 0 && c.avail > 0); } },
    { id: 'L7', digits: 3, test: (N, d) => N % d !== 0 && Math.floor(N / d) >= 10 }
  ];

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function gen(levelId, divisors, avoid) {
    const lv = LEVELS.find((l) => l.id === levelId) || LEVELS[1];
    const ds = (divisors && divisors.length) ? divisors : [2, 3, 4, 5, 6, 7, 8, 9];
    const lo = lv.digits === 2 ? 10 : 100, hi = lv.digits === 2 ? 99 : 999;
    for (let tries = 0; tries < 5000; tries++) {
      const d = ds[rnd(0, ds.length - 1)];
      const N = rnd(lo, hi);
      if (avoid && avoid.N === N && avoid.d === d) continue;
      if (lv.test(N, d)) return { N, d, level: lv.id };
    }
    return { N: 56, d: 4, level: 'L2' };
  }

  function levelOf(N, d) {
    const n = String(N).length;
    for (const lv of LEVELS) if (lv.digits === n && lv.test(N, d)) return lv.id;
    return n === 2 ? 'L2' : 'L4';
  }

  global.DivEngine = { trace, buildSteps, buildScenes, cellList, cellsUpTo, gen, levelOf, PRESETS, LEVELS, KINDS };
})(window);
