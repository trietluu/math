/* Bus-stop renderer. Two layouts:
 *  short: quotient on the roof, small carried digits inside the dividend (textbook style)
 *  long : quotient on the roof, then "subtract – bring down" rows underneath, with a coloured
 *         arrow for every digit that is brought down (the style used in the child's class)
 * Digits are coloured by place value (hundreds / tens / ones) to match the base-10 blocks.
 * renderBusStop(container, tr, {layout, upto, input, cur})
 *   upto : number of cells (from DivEngine.cellList) already visible
 *   input: if true, render an <input> at cell index `upto` (practice mode) – returned
 *   cur  : highlight the last visible cell(s)
 * Grid column indices (0-based): 0 = divisor, 1..n = digits, n+1 = remainder.
 */
(function (global) {
  'use strict';

  function div(cls, text) { const e = document.createElement('div'); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; return e; }

  function renderBusStop(container, tr, opts) {
    opts = opts || {};
    const layout = opts.layout || 'short';
    const cells = DivEngine.cellList(tr, layout);
    const upto = Math.max(0, Math.min(opts.upto === undefined ? cells.length : opts.upto, cells.length));
    const vis = cells.slice(0, upto);
    const inputCell = opts.input && upto < cells.length ? cells[upto] : null;
    const lastVisible = vis.length ? vis[vis.length - 1] : null;
    const isVis = (col, phase) => vis.some((c) => c.col === col && c.phase === phase);
    const isCur = (col, phase) => !!opts.cur && !!lastVisible && lastVisible.col === col && lastVisible.phase === phase;
    const isIn = (col, phase) => !!inputCell && inputCell.col === col && inputCell.phase === phase;

    container.innerHTML = '';
    const n = tr.n;
    const grid = div('bs bs-' + layout);
    grid.style.gridTemplateColumns = 'repeat(' + (n + 2) + ', var(--bs-cell))';
    let inputEl = null;

    const addCell = (row, col, cls, text) => {
      const c = div('bs-cell ' + (cls || ''), text);
      c.style.gridRow = row; c.style.gridColumn = col + 1;
      grid.appendChild(c); return c;
    };
    const addInput = (row, col, span, cls, cell) => {
      const wrap = div('bs-cell bs-inwrap ' + (cls || ''));
      wrap.style.gridRow = row; wrap.style.gridColumn = (col - span + 2) + ' / span ' + span;
      const inp = document.createElement('input');
      inp.className = 'bs-in'; inp.type = 'text'; inp.inputMode = 'numeric'; inp.autocomplete = 'off';
      inp.maxLength = span; inp.dataset.phase = cell.phase; inp.dataset.col = cell.col;
      wrap.appendChild(inp); grid.appendChild(wrap); inputEl = inp; return inp;
    };

    /* row 1: quotient (+ remainder at the far right) */
    addCell(1, 0, 'bs-empty');
    tr.cols.forEach((c) => {
      const pk = 'pk-' + c.kind;
      if (isIn(c.i, 'q')) { addInput(1, c.i + 1, 1, 'bs-q ' + pk, inputCell); return; }
      const show = isVis(c.i, 'q');
      addCell(1, c.i + 1, 'bs-q ' + pk + (show ? ' on' : '') + (isCur(c.i, 'q') ? ' cur' : ''), show ? String(c.q) : '');
    });
    {
      const remPhase = layout === 'short' ? 'rem' : 'left';
      const remVisible = tr.remainder > 0 && isVis(n - 1, remPhase);
      if (isIn(n - 1, 'rem')) addInput(1, n + 1, 1, 'bs-rem', inputCell);
      else if (remVisible) addCell(1, n + 1, 'bs-rem on' + (isCur(n - 1, remPhase) ? ' cur' : ''), 'r' + tr.remainder);
      else addCell(1, n + 1, 'bs-empty');
    }

    /* row 2: divisor | dividend digits (small carries live inside the digit cells, short layout) */
    addCell(2, 0, 'bs-div', String(tr.d));
    tr.cols.forEach((c) => {
      const cell = addCell(2, c.i + 1, 'bs-d' + (c.i === 0 ? ' first' : ''));
      if (layout === 'short' && c.i > 0) {
        const prev = tr.cols[c.i - 1];
        if (isIn(prev.i, 'carry')) {
          const inp = document.createElement('input');
          inp.className = 'bs-in bs-carry-in'; inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 1; inp.autocomplete = 'off';
          inp.dataset.phase = 'carry'; inp.dataset.col = prev.i;
          cell.appendChild(inp); inputEl = inp;
        } else if (isVis(prev.i, 'carry')) {
          cell.appendChild(div('bs-carry pk-' + prev.kind + (prev.left === 0 ? ' zero' : '') + (isCur(prev.i, 'carry') ? ' cur' : ''), String(prev.left)));
        }
      }
      cell.appendChild(div('bs-digit', String(c.digit)));
    });
    addCell(2, n + 1, 'bs-empty');

    /* long layout: work rows (product / difference + bring down, with arrows) */
    if (layout === 'long') {
      let row = 3;
      tr.cols.forEach((c) => {
        if (c.leadingZero) return;
        const usedVis = isVis(c.i, 'used'), leftVis = isVis(c.i, 'left'), bringVis = isVis(c.i, 'bring');
        const usedIn = isIn(c.i, 'used'), leftIn = isIn(c.i, 'left'), bringIn = isIn(c.i, 'bring');
        if (!usedVis && !usedIn) return;
        const span = Math.min(2, c.i + 1);
        const pk = 'pk-' + c.kind, pkNext = 'pk-' + c.nextKind;
        if (usedIn) {
          // one box per digit of the answer, so the typed number lines up with the columns above
          const usedSpan = String(c.used).length;
          addInput(row, c.i + 1, usedSpan, 'bs-used ' + pk, inputCell);
          addCell(row, c.i + 1 - usedSpan, 'bs-minus', '−');
        } else {
          const digits = String(c.used).split('');
          digits.forEach((ch, k) => addCell(row, c.i + 1 - (digits.length - 1 - k), 'bs-used ' + pk + ' on' + (isCur(c.i, 'used') ? ' cur' : ''), ch));
          addCell(row, c.i + 1 - digits.length, 'bs-minus', '−');
        }
        for (let k = Math.max(0, c.i + 1 - span); k <= c.i + 1; k++) {
          const u = div('bs-rule'); u.style.gridRow = row; u.style.gridColumn = k + 1; grid.appendChild(u);
        }
        if (!c.isLast && (bringVis || bringIn)) {
          // arrow from the next dividend digit down to the bring-down row
          const a = div('bs-arrow ' + pkNext);
          a.style.gridRow = '3 / ' + (row + 1); a.style.gridColumn = c.i + 3;
          a.innerHTML = '<svg viewBox="0 0 10 100" preserveAspectRatio="none"><line x1="5" y1="0" x2="5" y2="100"/></svg><i></i>';
          grid.appendChild(a);
        }
        row++;
        // leftover is always one digit (smaller than the divisor): one box, in its own column
        if (leftIn) addInput(row, c.i + 1, 1, 'bs-left ' + pk, inputCell);
        else if (leftVis) addCell(row, c.i + 1, 'bs-left ' + pk + ' on' + (isCur(c.i, 'left') ? ' cur' : ''), String(c.left));
        if (!c.isLast) {
          // bring down: the leftover stays where it is; the child writes only the brought-down digit next to it
          if (bringIn) addInput(row, c.i + 2, 1, 'bs-bring ' + pkNext, inputCell);
          else if (bringVis) addCell(row, c.i + 2, 'bs-bring ' + pkNext + ' on' + (isCur(c.i, 'bring') ? ' cur' : ''), String(tr.cols[c.i + 1].digit));
        }
        row++;
      });
    }

    container.appendChild(grid);
    return { input: inputEl, cells, upto };
  }

  global.renderBusStop = renderBusStop;
})(window);
