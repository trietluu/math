/* Division app: wires engine + block scene + bus-stop renderer into three tabs
 * 1. blocks (principle)  2. bridge (blocks <-> written method)  3. practice (algorithm with diagnostic hints)
 */
(function () {
  'use strict';
  const { t, place, comp } = I18N;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  const S = {
    N: 56, d: 4, level: 'L2', tr: null, steps: [], scenes: [],
    tab: LS.get('div_tab', 'blocks'),
    layout: LS.get('div_layout', 'long'),
    stars: 0,
    showTable: LS.get('div_showTable', true),
    askMode: LS.get('div_askMode', false),
    divisors: LS.get('div_divisors', [2, 3, 4, 5, 6, 7, 8, 9]),
    step: 0, playTimer: null, askPending: false,
    stats: LS.get('div_stats', { solved: {}, errors: {}, assisted: 0 }),
    p: null
  };
  const scenes = {};

  /* ---------- helpers ---------- */
  function compPlain(counts) {
    const parts = [];
    ['h', 't', 'o'].forEach((k) => { if (counts[k]) parts.push(counts[k] + ' ' + place(k, counts[k])); });
    return parts.length ? parts.join(' + ') : '0';
  }
  function dividendCounts(tr) { const c = { h: 0, t: 0, o: 0 }; tr.cols.forEach((col) => { c[col.kind] = col.digit; }); return c; }
  function quotientCounts(tr) { const c = { h: 0, t: 0, o: 0 }; tr.cols.forEach((col) => { c[col.kind] = col.q; }); return c; }
  function poolCountsAt(step) {
    const k = S.steps.indexOf(step), c = { h: 0, t: 0, o: 0 };
    if (k >= 0) S.scenes[k].blocks.forEach((b) => { if (b.loc === 'pool') c[b.kind]++; });
    return c;
  }
  function exprOf(counts) {
    const parts = [];
    if (counts.h) parts.push(counts.h * 100); if (counts.t) parts.push(counts.t * 10); if (counts.o) parts.push(counts.o);
    return parts.length > 1 ? ' = ' + parts.join(' + ') : '';
  }
  function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function remText(tr) { return tr.remainder ? t('remWord', { r: tr.remainder }) : ''; }
  function plusText(tr) { return tr.remainder ? t('plusR', { r: tr.remainder }) : ''; }

  /* ---------- narration ---------- */
  function narrate(step) {
    const tr = S.tr, d = tr.d;
    if (step.type === 'start') {
      const dc = dividendCounts(tr);
      return t('nStart', { N: tr.N, comp: comp(dc), compEn: I18N.compIn('en', dc, true), d }) + '<br><span class="muted">' + t('nStartRule', { first: place(tr.kinds[0], 2), firstEn: I18N.D.en.place[tr.kinds[0]] }) + '</span>';
    }
    if (step.type === 'check') {
      const counts = poolCountsAt(step);
      let s = t('nCheckA', { d, quotient: tr.quotient, plus: plusText(tr), N: tr.N, comp: comp(counts), expr: exprOf(counts) });
      if (!S.steps.some((x) => x.type === 'regroup')) s += t('nCheckDone', { d, quotient: tr.quotient, plus: plusText(tr), N: tr.N });
      return s;
    }
    if (step.type === 'regroup') {
      return t('nRegroup', { comp: comp(poolCountsAt(step)), N: tr.N }) + t('nCheckDone', { d, quotient: tr.quotient, plus: plusText(tr), N: tr.N });
    }
    if (step.type === 'share') {
      const c = tr.cols[step.col], P = place(c.kind, 2); // plural; I18N fixes "1 tens" -> "1 ten" in English
      if (c.q === 0) return t('nShareZero', { avail: c.avail, place: P, d, next: place(c.nextKind, 2) });
      return t(c.left ? 'nShare' : 'nShareNoLeft', { avail: c.avail, place: P, d, q: c.q, used: c.used, left: c.left });
    }
    if (step.type === 'exchange') {
      const c = tr.cols[step.col], nc = tr.cols[c.i + 1];
      return t('nExchange', { left: c.left, place: place(c.kind, c.left), d, tenfold: c.left * 10, next: place(c.nextKind, 2), digit: c.nextDigit, avail: nc.avail });
    }
    if (step.type === 'result') {
      let s = t('nResult', { comp: comp(quotientCounts(tr)), quotient: tr.quotient, N: tr.N, d, rem: remText(tr) });
      if (tr.remainder) s += t('nResultLeft', { r: tr.remainder, d });
      s += '<br><span class="muted">' + t('nNextCheck') + '</span>';
      return s;
    }
    return '';
  }

  function bridgeNote(step) {
    const tr = S.tr, d = tr.d;
    if (step.type === 'start') return t('bStart', { d, N: tr.N });
    if (step.type === 'share') {
      const c = tr.cols[step.col], P = place(c.kind, 2);
      if (c.q === 0) return t('bShareZero', { place: P });
      let s = t('bShare', { q: c.q, place: P });
      if (S.layout === 'long') s += ' ' + t('bShareLong', { used: c.used, q: c.q, d, place: P, avail: c.avail, left: c.left });
      return s;
    }
    if (step.type === 'exchange') {
      const c = tr.cols[step.col], nc = tr.cols[c.i + 1];
      const p = { left: c.left, digit: c.nextDigit, avail: nc.avail, next: place(c.nextKind, 2), place: place(c.kind, c.left), tenfold: c.left * 10 };
      return t(S.layout === 'short' ? 'bExchangeShort' : 'bExchangeLong', p);
    }
    if (step.type === 'result') {
      const remNote = tr.remainder ? t(S.layout === 'short' ? 'bRemShort' : 'bRemLong', { r: tr.remainder, d }) : '';
      return t('bResult', { quotient: tr.quotient, remNote });
    }
    if (step.type === 'check') return t('bCheck', { d, quotient: tr.quotient, plus: plusText(tr), N: tr.N });
    if (step.type === 'regroup') return t('bRegroup');
    return '';
  }

  /* ---------- diagnostic hints (shared by ask-mode and practice) ---------- */
  function hintQ(c, x) {
    const d = S.d, P = place(c.kind, 2);
    if (x === c.avail - d && x !== c.q) return { type: 'sub', html: t('hSubInstead', { avail: c.avail, d }) };
    if (x === c.avail && x !== c.q) return { type: 'other', html: t('hCopy', { avail: c.avail, d }) };
    if (x * d > c.avail) return { type: 'toobig', html: t('hTooBig', { x, d, prod: x * d, avail: c.avail, place: P }) };
    if (x < c.q) return { type: 'toosmall', html: t('hTooSmall', { x, d, prod: x * d, rest: c.avail - x * d }) };
    return { type: 'other', html: t('hQGeneric', { d, avail: c.avail }) };
  }
  function hintUsed(c, x) {
    if (x === S.d && c.q !== 1) return { type: 'used', html: t('hUsedIsD', { d: S.d, q: c.q, place: place(c.kind, 2) }) };
    return { type: 'other', html: t('hUsedGeneric', { q: c.q, d: S.d }) };
  }
  function hintLeft(c, x, genericKey) {
    const d = S.d;
    if (x === c.avail - d && c.used !== d && x !== c.left) return { type: 'sub', html: t('hLeftSubD', { d, used: c.used, place: place(c.kind, 2) }) };
    if (x >= d) return { type: 'other', html: t('hLeftTooBig', { x, d, avail: c.avail, used: c.used }) };
    return { type: 'other', html: t(genericKey || 'hLeftGeneric', { avail: c.avail, used: c.used, d }) };
  }
  function hintCarry(c, x) {
    if (c.leadingZero) return { type: 'other', html: t('hCarryZeroCase', { avail: c.avail, d: S.d, place: place(c.kind, 2) }) };
    return hintLeft(c, x, 'hCarryGeneric');
  }
  function hintBring(c, x) {
    const nc = S.tr.cols[c.i + 1], P = place(c.kind, c.left), NP = place(c.nextKind, 2);
    if (x === nc.digit) return { type: 'bring', html: t('hBringForgot', { left: c.left, place: P, tenfold: c.left * 10, next: NP, nextDigit: nc.digit }) };
    if (x === c.left) return { type: 'bring', html: t('hBringOnlyLeft', { left: c.left, place: P, tenfold: c.left * 10, next: NP, nextDigit: nc.digit }) };
    return { type: 'other', html: t('hBringGeneric', { left: c.left, nextDigit: nc.digit }) };
  }
  function hintRem(c) { return { type: 'other', html: t('hRemGeneric', { place: place(c.kind, 2), avail: c.avail, used: c.used }) }; }
  function hintQuotient() { return { type: 'other', html: t('hCount', { comp: comp(quotientCounts(S.tr)) }) }; }

  function whyQ(c) { return t('whyQ', { d: S.d, q: c.q, used: c.used, avail: c.avail, q1: c.q + 1, used1: (c.q + 1) * S.d }); }
  function whyFor(cell) {
    const c = S.tr.cols[cell.col], d = S.d;
    switch (cell.phase) {
      case 'q': return whyQ(c);
      case 'used': return t('whyUsed', { q: c.q, d, used: c.used });
      case 'left': return t('whyLeft', { avail: c.avail, used: c.used, left: c.left });
      case 'bring': return t('whyBring', { left: c.left, nextDigit: c.nextDigit, avail: S.tr.cols[c.i + 1].avail });
      case 'carry': return c.leadingZero ? t('hCarryZeroCase', { avail: c.avail, d, place: place(c.kind, 2) }) : t('whyCarry', { avail: c.avail, used: c.used, left: c.left });
      case 'rem': return t('whyRem', { avail: c.avail, used: c.used, left: c.left });
    }
    return '';
  }

  function recordError(type) {
    S.stats.errors[type] = (S.stats.errors[type] || 0) + 1;
    LS.set('div_stats', S.stats);
  }

  /* ---------- generic quiz box (ask mode) ---------- */
  function showQuiz(box, qs, onDone) {
    let i = 0, attempts = 0;
    const render = () => {
      const q = qs[i];
      box.classList.remove('hidden');
      box.innerHTML = '<div class="q">' + q.label + '</div>' +
        '<div class="row"><input type="text" inputmode="numeric" class="aIn" autocomplete="off"> ' +
        '<button class="primary aCheck">' + t('check') + '</button> <button class="aShow">' + t('showAnswer') + '</button></div>' +
        '<div class="feedback aFb"></div>';
      const inp = $('.aIn', box), fb = $('.aFb', box);
      setTimeout(() => inp.focus(), 30);
      const advance = () => { i++; attempts = 0; if (i < qs.length) render(); else { box.classList.add('hidden'); box.innerHTML = ''; onDone(); } };
      const reveal = () => { fb.innerHTML = '<div class="note">' + t('hAnswer', { ans: q.expected, why: q.why }) + '</div>'; inp.value = q.expected; inp.disabled = true; setTimeout(advance, 1800); };
      const check = () => {
        const x = parseInt(inp.value, 10);
        if (isNaN(x)) { shake(inp); return; }
        if (x === q.expected) { fb.innerHTML = '<span class="chip good">' + t('correct') + '</span>'; inp.disabled = true; setTimeout(advance, 600); }
        else {
          attempts++;
          const h = q.hint(x, attempts); recordError(h.type);
          fb.innerHTML = '<div class="note bad">' + h.html + '</div>';
          shake(inp); inp.select();
          if (attempts >= 3) reveal();
        }
      };
      $('.aCheck', box).onclick = check;
      $('.aShow', box).onclick = reveal;
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } };
    };
    render();
  }

  function askQuestionsFor(step) {
    const tr = S.tr;
    if (step.type === 'share') {
      const c = tr.cols[step.col], P = place(c.kind, 2);
      const qs = [{ label: t('aq', { place: P }), expected: c.q, hint: (x) => hintQ(c, x), why: whyQ(c) }];
      if (c.q > 0) qs.push({ label: t('aleft', { place: P }), expected: c.left, hint: (x) => hintLeft(c, x), why: t('whyLeft', { avail: c.avail, used: c.used, left: c.left }) });
      return qs;
    }
    if (step.type === 'exchange') {
      const c = tr.cols[step.col], nc = tr.cols[c.i + 1];
      return [{ label: t('aex', { left: c.left, place: place(c.kind, c.left), next: place(c.nextKind, 2), digit: c.nextDigit }), expected: nc.avail, hint: (x) => hintBring(c, x), why: t('whyBring', { left: c.left, nextDigit: c.nextDigit, avail: nc.avail }) }];
    }
    if (step.type === 'result') {
      return [{ label: t('ares'), expected: tr.quotient, hint: () => hintQuotient(), why: comp(quotientCounts(tr)) + ' = ' + tr.quotient }];
    }
    if (step.type === 'check') {
      const counts = { h: 0, t: 0, o: 0 }; tr.cols.forEach((c) => { counts[c.kind] = c.q * tr.d; }); counts.o += tr.remainder;
      return [{ label: t('aCheck', { d: tr.d, quotient: tr.quotient, plus: plusText(tr) }), expected: tr.N,
        hint: () => ({ type: 'other', html: t('hCheck', { quotient: tr.quotient, d: tr.d, comp: comp(counts) }) }),
        why: tr.d + ' × ' + tr.quotient + plusText(tr) + ' = ' + tr.N }];
    }
    return [];
  }

  /* ---------- problem setup ---------- */
  function setProblem(N, d, level) {
    stopPlay();
    S.N = N; S.d = d; S.level = level || DivEngine.levelOf(N, d);
    S.tr = DivEngine.trace(N, d);
    S.steps = DivEngine.buildSteps(S.tr);
    S.scenes = DivEngine.buildScenes(S.tr, S.steps);
    Object.keys(scenes).forEach((k) => scenes[k].setProblem(S.tr, S.scenes));
    S.step = 0; S.askPending = false;
    $('#askBox').classList.add('hidden'); $('#askBox').innerHTML = '';
    $('#inN').value = N; $('#inD').value = d;
    startPractice();
    renderAll();
  }
  function newRandom() {
    const g = DivEngine.gen(S.level, S.divisors, { N: S.N, d: S.d });
    setProblem(g.N, g.d, S.level);
  }

  /* ---------- rendering ---------- */
  function applyI18n() {
    $$('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    $('#guideBody').innerHTML = t('guideBody');
    $('#askMode').parentElement.title = t('askModeHint');
    document.title = t('appTitle');
    document.documentElement.lang = I18N.getLang();
  }

  function renderPicker() {
    const pc = $('#presetChips'); pc.innerHTML = '';
    DivEngine.PRESETS.forEach((p) => {
      const b = document.createElement('button');
      b.className = 'chip' + (S.N === p.N && S.d === p.d ? ' active' : '');
      b.textContent = p.N + ' ÷ ' + p.d + (p.tag === 'book-example' ? ' ★' : '');
      b.onclick = () => setProblem(p.N, p.d);
      pc.appendChild(b);
    });
    const sel = $('#levelSel'); sel.innerHTML = '';
    DivEngine.LEVELS.forEach((l) => { const o = document.createElement('option'); o.value = l.id; o.textContent = t(l.id); sel.appendChild(o); });
    sel.value = S.level;
    const dc = $('#divChips'); dc.innerHTML = '';
    for (let d = 2; d <= 9; d++) {
      const b = document.createElement('button');
      b.className = 'chip sm' + (S.divisors.includes(d) ? ' active' : '');
      b.textContent = '÷' + d;
      b.onclick = () => {
        if (S.divisors.includes(d)) { if (S.divisors.length > 1) S.divisors = S.divisors.filter((x) => x !== d); }
        else S.divisors = S.divisors.concat([d]).sort((a, b2) => a - b2);
        LS.set('div_divisors', S.divisors); renderPicker();
      };
      dc.appendChild(b);
    }
    $$('#layoutSeg button').forEach((b) => b.classList.toggle('active', b.dataset.layout === S.layout));
    $$('#langSeg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === I18N.getLang()));
    $('#showTable').checked = S.showTable;
    $('#askMode').checked = S.askMode;
    $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === S.tab));
  }

  function renderHead() {
    $('#eq').textContent = S.N + ' ÷ ' + S.d + ' = ?';
    const key = S.tab === 'blocks' ? 'blocksLead' : S.tab === 'bridge' ? 'bridgeLead' : 'practiceLead';
    $('#lead').textContent = t(key, { N: S.N, d: S.d });
  }

  function stepLabel(el, dotsEl) {
    el.textContent = t('stepOf', { k: S.step + 1, n: S.steps.length });
    if (dotsEl) {
      dotsEl.innerHTML = '';
      S.steps.forEach((s, i) => { const sp = document.createElement('span'); if (i === S.step) sp.className = 'on'; else if (i < S.step) sp.className = 'done'; dotsEl.appendChild(sp); });
    }
  }

  function renderBlocksTab(animate) {
    scenes.blocks.show(S.step, animate);
    $('#narr').innerHTML = narrate(S.steps[S.step]);
    stepLabel($('#bStep'), $('#bDots'));
    $('#bPrev').disabled = S.step === 0;
    $('#bNext').disabled = S.step >= S.steps.length - 1;
  }
  function renderBridgeTab(animate) {
    scenes.bridge.show(S.step, animate);
    const step = S.steps[S.step];
    $('#narrBridge').innerHTML = narrate(step);
    $('#bridgeNote').innerHTML = bridgeNote(step);
    renderBusStop($('#bsBridge'), S.tr, { layout: S.layout, upto: DivEngine.cellsUpTo(S.tr, S.layout, step), cur: true });
    $('#rhythm').innerHTML = t(S.layout === 'short' ? 'ruleShort' : 'ruleLong');
    stepLabel($('#gStep'));
    $('#gPrev').disabled = S.step === 0;
    $('#gNext').disabled = S.step >= S.steps.length - 1;
  }

  function renderTab(animate) {
    ['blocks', 'bridge', 'practice'].forEach((k) => $('#tab-' + k).classList.toggle('hidden', k !== S.tab));
    renderHead();
    if (S.tab === 'blocks') renderBlocksTab(animate);
    else if (S.tab === 'bridge') renderBridgeTab(animate);
    else renderPractice();
  }

  function renderAll() {
    applyI18n(); renderPicker(); renderTab(false);
  }

  function goStep(k, animate) {
    k = Math.max(0, Math.min(k, S.steps.length - 1));
    if (k === S.step && animate) return;
    S.step = k;
    if (S.tab === 'blocks') renderBlocksTab(animate);
    else if (S.tab === 'bridge') renderBridgeTab(animate);
  }

  function nextWithAsk() {
    if (S.askPending || S.step >= S.steps.length - 1) return;
    const target = S.steps[S.step + 1];
    const qs = S.askMode ? askQuestionsFor(target) : [];
    if (!qs.length) { goStep(S.step + 1, true); return; }
    S.askPending = true;
    $('#bNext').disabled = true;
    showQuiz($('#askBox'), qs, () => { S.askPending = false; goStep(S.step + 1, true); });
  }

  function stopPlay() {
    if (S.playTimer) { clearInterval(S.playTimer); S.playTimer = null; }
    $('#bPlay').textContent = t('play'); $('#gPlay').textContent = t('play');
  }
  function togglePlay() {
    if (S.playTimer) { stopPlay(); return; }
    if (S.step >= S.steps.length - 1) goStep(0, false);
    $('#bPlay').textContent = t('stop'); $('#gPlay').textContent = t('stop');
    S.playTimer = setInterval(() => {
      if (S.step >= S.steps.length - 1) { stopPlay(); return; }
      goStep(S.step + 1, true);
    }, 3200);
  }

  /* ---------- practice ---------- */
  function startPractice() {
    S.p = { cells: DivEngine.cellList(S.tr, S.layout), upto: 0, attempts: 0, assisted: false, done: false, input: null, blocksShown: false };
    $('#feedback').innerHTML = '';
    $('#pBlocksWrap').classList.add('hidden');
  }
  function currentCell() { return S.p.cells[S.p.upto]; }

  function promptFor(cell) {
    const c = S.tr.cols[cell.col], d = S.d, P = place(c.kind, 2);
    switch (cell.phase) {
      case 'q': {
        const prev = c.i > 0 ? S.tr.cols[c.i - 1] : null;
        if (prev && prev.leadingZero) return t('pQLead', { hd: prev.digit, hplace: place(prev.kind, prev.digit), d, tenfold: prev.digit * 10, place: P, digit: c.digit, avail: c.avail });
        return c.carryIn > 0 ? t('pQCarry', { avail: c.avail, place: P, carry: c.carryIn, digit: c.digit, d }) : t('pQ', { avail: c.avail, place: P, d });
      }
      case 'carry': return c.leadingZero ? t('pCarryZero', { avail: c.avail, place: P, d, next: place(c.nextKind, 2), nextDigit: c.nextDigit }) : t('pCarry', { place: P, nextDigit: c.nextDigit });
      case 'used': return t('pUsed', { q: c.q, place: P, d });
      case 'left': return t('pLeft', { avail: c.avail, used: c.used, place: P });
      case 'bring': return t('pBring', { nextDigit: c.nextDigit, left: c.left, next: place(c.nextKind, 2) });
      case 'rem': return t('pRem');
    }
    return '';
  }
  function hintFor(cell, x) {
    const c = S.tr.cols[cell.col];
    switch (cell.phase) {
      case 'q': return hintQ(c, x);
      case 'carry': return hintCarry(c, x);
      case 'used': return hintUsed(c, x);
      case 'left': return hintLeft(c, x);
      case 'bring': return { type: 'other', html: t('hBringDigit', { nextDigit: S.tr.cols[c.i + 1].digit, left: c.left }) };
      default: return hintRem(c, x);
    }
  }

  function renderPractice() {
    const p = S.p;
    const stars = S.stars ? '⭐'.repeat(Math.min(S.stars, 12)) + (S.stars > 12 ? ' ×' + S.stars : '') : '–';
    $('#rhythm2').innerHTML = t(S.layout === 'short' ? 'ruleShort' : 'ruleLong') + ' &nbsp;·&nbsp; <span class="stars">' + t('starsLbl') + ': ' + stars + '</span>';
    const res = renderBusStop($('#bsPractice'), S.tr, { layout: S.layout, upto: p.upto, input: !p.done, cur: p.done });
    p.input = res.input;
    if (p.input && !p.done) {
      p.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPractice(); } });
      p.input.focus();
      setTimeout(() => { if (p.input && document.activeElement !== p.input) p.input.focus(); }, 30);
      $('#prompt').innerHTML = promptFor(currentCell());
    } else {
      $('#prompt').innerHTML = t('pDone', { N: S.N, d: S.d, quotient: S.tr.quotient, rem: remText(S.tr), plus: plusText(S.tr) });
    }
    $('#pCheck').disabled = p.done; $('#pShowAns').disabled = p.done;
    $('#pBlocks').textContent = p.blocksShown ? t('hideBlocks') : t('seeBlocks');
    renderTable(); renderStats();
  }

  function advancePractice() {
    const p = S.p;
    p.upto++; p.attempts = 0;
    if (p.upto >= p.cells.length) finishPractice(); else renderPractice();
  }
  /* What the child types into the current box. For "bring down" the leftover is already shown in its
   * column, so the box takes only the digit being brought down. */
  function boxAnswer(cell) {
    return cell.phase === 'bring' ? S.tr.cols[cell.col + 1].digit : cell.expected;
  }
  function checkPractice() {
    const p = S.p; if (p.done || !p.input) return;
    const x = parseInt(p.input.value, 10);
    if (isNaN(x)) { shake(p.input); return; }
    const cell = currentCell();
    if (x === boxAnswer(cell)) {
      $('#feedback').innerHTML = '<span class="chip good">' + t('correct') + '</span>';
      advancePractice();
      if (p.blocksShown && !p.done) showPracticeBlocks();
    } else {
      p.attempts++;
      const h = hintFor(cell, x); recordError(h.type);
      let html = '<div class="note bad">' + h.html;
      if (p.attempts >= 2) html += ' <button class="sm" id="fbBlocks">' + t('seeBlocks') + '</button>';
      html += '</div>';
      $('#feedback').innerHTML = html;
      const fb = $('#fbBlocks'); if (fb) fb.onclick = () => { p.blocksShown = true; showPracticeBlocks(); };
      shake(p.input);
      p.input.select();
      renderTable();
      if (p.attempts >= 3) revealPractice();
    }
  }
  function revealPractice() {
    const p = S.p; if (p.done || !p.input) return;
    const cell = currentCell();
    p.assisted = true;
    $('#feedback').innerHTML = '<div class="note">' + t('hAnswer', { ans: boxAnswer(cell), why: whyFor(cell) }) + '</div>';
    p.input.value = boxAnswer(cell); p.input.disabled = true;
    $('#pCheck').disabled = true;
    setTimeout(() => { $('#pCheck').disabled = false; advancePractice(); }, 1800);
  }
  function finishPractice() {
    const p = S.p; p.done = true;
    S.stars++;
    S.stats.solved[S.level] = (S.stats.solved[S.level] || 0) + 1;
    if (p.assisted) S.stats.assisted++;
    LS.set('div_stats', S.stats);
    renderPractice();
    $('#feedback').innerHTML = '';
    $('#prompt').classList.add('pop');
    $('#pAnother').focus();
  }

  function stepForCell(cell) {
    if (!cell) return Math.max(0, S.steps.findIndex((s) => s.type === 'result'));
    const type = (cell.phase === 'carry' || cell.phase === 'bring') ? 'exchange' : (cell.phase === 'rem' ? 'result' : 'share');
    let idx = S.steps.findIndex((s) => s.type === type && (type === 'result' || s.col === cell.col));
    if (idx < 0) idx = S.steps.findIndex((s) => s.type === 'share' && s.col === cell.col);
    return Math.max(0, idx);
  }
  function showPracticeBlocks() {
    const p = S.p;
    const idx = stepForCell(p.done ? null : currentCell());
    $('#pBlocksWrap').classList.remove('hidden');
    $('#pBlocks').textContent = t('hideBlocks');
    scenes.practice.show(Math.max(0, idx - 1), false);
    setTimeout(() => scenes.practice.show(idx, true), 120);
    $('#narrPractice').innerHTML = narrate(S.steps[idx]);
  }
  function togglePracticeBlocks() {
    const p = S.p;
    if (p.blocksShown) { p.blocksShown = false; $('#pBlocksWrap').classList.add('hidden'); $('#pBlocks').textContent = t('seeBlocks'); }
    else { p.blocksShown = true; showPracticeBlocks(); }
  }

  function renderTable() {
    const card = $('#tableCard');
    if (!S.showTable) { card.classList.add('hidden'); return; }
    card.classList.remove('hidden');
    const d = S.d;
    const cell = S.p && !S.p.done ? currentCell() : null;
    const c = cell ? S.tr.cols[cell.col] : null;
    const hl = cell && cell.phase === 'q' && S.p.attempts >= 1 ? c.q : -1;
    let html = '<h3>' + t('tableTitle', { d }) + '</h3>';
    for (let k = 1; k <= 10; k++) {
      let cls = '';
      if (hl >= 0) cls = k === hl ? 'hl' : (d * k > c.avail ? 'over' : 'ok');
      html += '<div class="' + cls + '"><span>' + d + ' × ' + k + '</span><span>' + d * k + '</span></div>';
    }
    if (hl >= 0) html += '<p class="small muted">' + t('tableHint', { avail: c.avail }) + '</p>';
    card.innerHTML = html;
  }

  function renderStats() {
    const st = S.stats;
    let html = '<h3>' + t('statsTitle') + '</h3><dl>';
    html += '<dt>' + t('solved') + '</dt>';
    const lv = Object.keys(st.solved).sort();
    html += '<dd>' + (lv.length ? lv.map((k) => t(k) + ': <b>' + st.solved[k] + '</b>').join('<br>') : '0') + '</dd>';
    html += '<dt>' + t('errors') + '</dt>';
    const errs = Object.keys(st.errors).sort((a, b) => st.errors[b] - st.errors[a]);
    html += '<dd>' + (errs.length ? errs.map((k) => t('e_' + k) + ': <b>' + st.errors[k] + '</b>').join('<br>') : t('noErrors')) + '</dd>';
    if (st.assisted) html += '<dt>' + t('assistedLbl') + '</dt><dd>' + st.assisted + '</dd>';
    html += '</dl><button class="sm" id="btnReset" style="margin-top:8px">' + t('reset') + '</button>';
    $('#statsCard').innerHTML = html;
    $('#btnReset').onclick = () => { if (confirm(t('resetConfirm'))) { S.stats = { solved: {}, errors: {}, assisted: 0 }; LS.set('div_stats', S.stats); renderStats(); } };
  }

  function buildKeypad() {
    const kp = $('#keypad'); kp.innerHTML = '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
    keys.forEach((k) => {
      const b = document.createElement('button');
      b.textContent = k; if (k === 'OK') b.className = 'primary';
      b.onclick = () => {
        const inp = S.p && S.p.input; if (!inp || inp.disabled) return;
        if (k === 'OK') { checkPractice(); return; }
        if (k === '⌫') inp.value = inp.value.slice(0, -1);
        else if (inp.value.length < (inp.maxLength || 3)) inp.value += k;
        inp.focus();
      };
      kp.appendChild(b);
    });
  }

  /* ---------- events ---------- */
  function bind() {
    $$('#langSeg button').forEach((b) => { b.onclick = () => { I18N.setLang(b.dataset.lang); renderAll(); }; });
    $$('#layoutSeg button').forEach((b) => { b.onclick = () => { S.layout = b.dataset.layout; LS.set('div_layout', S.layout); startPractice(); renderAll(); }; });
    $$('#tabs button').forEach((b) => { b.onclick = () => { stopPlay(); S.tab = b.dataset.tab; LS.set('div_tab', S.tab); renderPicker(); renderTab(false); }; });
    $('#levelSel').onchange = (e) => { S.level = e.target.value; newRandom(); };
    $('#btnRandom').onclick = newRandom;
    $('#btnGo').onclick = () => {
      const N = parseInt($('#inN').value, 10), d = parseInt($('#inD').value, 10);
      if (!(N >= 10 && N <= 999 && d >= 2 && d <= 9)) { alert(t('invalid')); return; }
      setProblem(N, d);
    };
    $('#inD').onkeydown = (e) => { if (e.key === 'Enter') $('#btnGo').click(); };
    $('#showTable').onchange = (e) => { S.showTable = e.target.checked; LS.set('div_showTable', S.showTable); renderTable(); };
    $('#askMode').onchange = (e) => { S.askMode = e.target.checked; LS.set('div_askMode', S.askMode); };
    $('#bPrev').onclick = () => { stopPlay(); goStep(S.step - 1, true); };
    $('#bNext').onclick = () => { stopPlay(); nextWithAsk(); };
    $('#bPlay').onclick = togglePlay;
    $('#gPrev').onclick = () => { stopPlay(); goStep(S.step - 1, true); };
    $('#gNext').onclick = () => { stopPlay(); goStep(S.step + 1, true); };
    $('#gPlay').onclick = togglePlay;
    $('#pCheck').onclick = checkPractice;
    $('#pShowAns').onclick = revealPractice;
    $('#pBlocks').onclick = togglePracticeBlocks;
    $('#pAnother').onclick = newRandom;
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (S.tab === 'blocks' || S.tab === 'bridge') {
        if (e.key === 'ArrowRight') { stopPlay(); if (S.tab === 'blocks') nextWithAsk(); else goStep(S.step + 1, true); }
        if (e.key === 'ArrowLeft') { stopPlay(); goStep(S.step - 1, true); }
      }
    });
  }

  /* ---------- init ---------- */
  function init() {
    const labels = { pool: (step) => t(step && (step.type === 'check' || step.type === 'regroup') ? 'poolBack' : 'pool'), get group() { return t('group'); }, comp: compPlain };
    scenes.blocks = new BlockScene($('#svgBlocks'), { labels });
    scenes.bridge = new BlockScene($('#svgBridge'), { labels });
    scenes.practice = new BlockScene($('#svgPractice'), { labels });
    buildKeypad();
    bind();
    setProblem(56, 4, 'L2');
  }
  document.addEventListener('DOMContentLoaded', init);
})();
