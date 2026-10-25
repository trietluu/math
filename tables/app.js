/* Times-tables trainer: learn (patterns + arrays), adaptive test (Leitner boxes + spacing),
 * remainder drill (the exact sub-skill the bus-stop method needs), report (heatmap), settings.
 * All progress lives in localStorage ('tt_v1'); export/import as JSON.
 */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const STORE = 'tt_v1';
  const INTERVALS = [1, 2, 5, 10, 20, 40, 80]; // questions until the fact is due again, by box

  /* ---------- i18n ----------
   * Learn / Test / Remainders tabs talk to the child (short sentences, "em");
   * Report / Settings / "how it works" talk to the adult.
   * Language is shared with the other apps (localStorage "math_lang"). */
  const DICT = {
    vi: {
      appTitle: 'Bảng cửu chương', back: 'Trang chủ',
      tabLearn: 'Học', tabTest: 'Đố nhanh', tabRem: 'Chia có dư (remainder)', tabReport: 'Báo cáo', tabSettings: 'Cài đặt',
      pickTable: 'Chọn bảng', practiceThis: 'Đố bảng này', hideAnswers: 'Che kết quả', showAnswers: 'Hiện kết quả', arrayTitle: 'Nhìn hình', tipsTitle: 'Mẹo nhớ',
      arrayDesc: '{a} × {b} là {b} hàng, mỗi hàng {a} chấm, tất cả có {p} chấm. Đếm thêm {a} (count in {a}s): ', familyTitle: 'Nhân và chia là bạn (multiply ↔ divide)',
      familyHint: 'Cùng một hình này: {b} hàng, mỗi hàng {a} chấm thì có {p} chấm. Nếu hỏi ngược lại "{p} chấm xếp mỗi hàng {a} chấm thì được mấy hàng?", đó chính là {p} ÷ {a}.',
      start: 'Bắt đầu', stop: 'Dừng', sessionTitle: 'Lượt này', howTitle: 'App chọn câu hỏi thế nào (cho người lớn)',
      howText: 'Mỗi phép tính có một "hộp" từ 0 đến 6. Trả lời đúng và nhanh thì lên hộp, lâu mới hỏi lại. Sai hoặc hết giờ thì về hộp 0 và được hỏi lại ngay. App chỉ thêm vài phép mới khi các phép đang học đã ổn, và thỉnh thoảng hỏi lại phép đã thuộc để không quên.',
      remLead: 'Đố kiểu Bus stop nhé: "17 chia 5 được mấy, còn dư mấy?" (how many 5s in 17?)',
      divisors: 'Chia cho', remWhy: 'Vì sao luyện cái này? (cho người lớn)',
      remWhyText: 'Ở mỗi cột của phép chia Bus stop, trẻ phải trả lời "số chia nhân mấy thì gần nhất mà không vượt quá?" và "dư mấy?". Thuộc bảng nhân theo chiều xuôi chưa đủ; cần nhanh ở việc tìm số lớn nhất không vượt quá.',
      heatTitle: 'Bản đồ thuộc bài', needTitle: 'Cần học thêm', tableMastery: 'Mức thuộc từng bảng', historyTitle: 'Các lượt gần đây',
      sTables: 'Bảng cần học', sTablesHint: 'Nên bắt đầu với ×2, ×3, ×4, ×5, ×6, ×8, ×10. Thêm ×7, ×9 khi trẻ đã vững.', sMax: 'Nhân đến', sTypes: 'Dạng câu hỏi',
      typeMul: 'a × b = ?', typeMissing: 'a × ? = c', typeDiv: 'c ÷ a = ?', sTime: 'Giới hạn thời gian', noLimit: 'Không',
      sTimeHint: 'Quá giờ được tính là chưa thuộc (trẻ còn phải đếm): app cho xem đáp án rồi hỏi lại sớm. Lúc đầu nên để Không; khi trẻ trả lời đúng gần hết thì chọn 8 giây.',
      sNew: 'Số phép mới học cùng lúc', sNewHint: 'Ít thì chắc, nhiều thì nhanh. 4 là vừa.', sData: 'Dữ liệu', export: 'Xuất JSON', import: 'Nhập JSON', reset: 'Xoá hết', resetConfirm: 'Xoá toàn bộ tiến độ bảng cửu chương?',
      scopeAll: 'Các bảng đã chọn', scopeTable: 'Bảng ×{a}', qCount: 'Câu {n}', correctFb: 'Đúng rồi!', slowFb: 'Đúng rồi! Lần sau cậu thử trả lời nhanh hơn một chút nhé.', wrongFb: 'Chưa đúng.', timeoutFb: 'Hết giờ rồi.',
      retypeFb: 'Cậu gõ lại đáp án đúng nhé: <b>{say}</b>', pressStart: 'Cậu bấm "Bắt đầu" để chơi nhé.',
      sumTitle: 'Xong một lượt rồi!', sumN: 'Số câu', sumAcc: 'Đúng', sumAvg: 'Mỗi câu', sumImproved: 'Phép tính đã tiến bộ', sumReview: 'Cần ôn', streakLbl: 'Đúng liên tiếp', bestLbl: 'nhiều nhất', sumEmpty: 'Cậu chưa làm câu nào.',
      unseen: 'chưa gặp', boxLbl: 'hộp', wrongLbl: 'sai', seenLbl: 'gặp', avgLbl: 'TB', noData: 'Chưa có dữ liệu. Hãy cho trẻ làm tab Đố nhanh.', unseenCount: 'Còn {n} phép tính chưa gặp.', allGood: 'Tuyệt, không có gì cần ôn gấp!',
      legend: ['chưa gặp', 'hộp 0', 'hộp 1–2', 'hộp 3–4', 'hộp 5–6'],
      remQ: '{n} chia {d} được mấy?', remR: '{n} chia {d} được {q}, vậy còn dư mấy?', remHint: 'Vì {d} × {q} = {p} chưa quá {n}, còn {d} × {q1} = {p1} thì quá {n} rồi. Vậy {n} chia {d} được {q}, dư {r}.', remOk: 'Đúng rồi! {n} = {d} × {q} + {r}', remStatsTitle: 'Theo số chia', remTooBig: '{d} × {x} = {p}, quá {n} rồi. Cậu thử số nhỏ hơn nhé.', remTooSmall: '{d} × {x} = {p}, còn dư {rest} nên vẫn chia thêm được. Cậu thử số lớn hơn nhé.', remRHint: 'Số dư bằng {n} − {d} × {q}.',
      hist: { date: 'Ngày', n: 'Câu', acc: 'Đúng', avg: 'TB (giây)' },
      tips: {
        1: 'Nhân với 1 thì số vẫn giữ nguyên.',
        2: 'Gấp đôi (double) là cộng một số với chính nó: 2 × 7 = 7 + 7 = 14. Kết quả luôn là số chẵn (even).',
        3: 'Đếm thêm 3: 3, 6, 9, 12, 15… Nếu cộng các chữ số của kết quả, cậu sẽ luôn được 3, 6 hoặc 9 (3 × 8 = 24, 2 + 4 = 6).',
        4: 'Bảng 4 là gấp đôi bảng 2: 2 × 7 = 14, gấp đôi lên thì 4 × 7 = 28.',
        5: 'Kết quả luôn có số cuối là 0 hoặc 5. Muốn tính 5 × 8, cậu lấy một nửa (half) của 10 × 8 = 80, được 40.',
        6: 'Bảng 6 là gấp đôi bảng 3: 3 × 7 = 21, gấp đôi lên thì 6 × 7 = 42. Thêm một mẹo nữa: 6 × 2 = 12, 6 × 4 = 24, 6 × 6 = 36, 6 × 8 = 48, số cuối giống hệt số cậu nhân!',
        7: 'Phần lớn bảng 7 cậu đã biết rồi, vì đã học ở bảng 2 đến 6 (7 × 3 = 3 × 7). Cậu chỉ cần nhớ thêm: 7 × 7 = 49, 7 × 8 = 56 ("5, 6, 7, 8"), 7 × 9 = 63.',
        8: 'Bảng 8 là gấp đôi bảng 4: 4 × 6 = 24, gấp đôi lên thì 8 × 6 = 48. Số cuối đi lùi dần: 8, 6, 4, 2, 0.',
        9: 'Hai chữ số của kết quả cộng lại luôn bằng 9 (9 × 7 = 63, 6 + 3 = 9). Còn số đầu thì nhỏ hơn số cậu nhân 1 đơn vị (7 − 1 = 6).',
        10: 'Cậu chỉ cần thêm số 0 vào cuối: 10 × 7 = 70.',
        11: 'Từ 1 đến 9, cậu chỉ cần viết số đó hai lần: 11 × 4 = 44.',
        12: '12 × 7 = 10 × 7 + 2 × 7 = 70 + 14 = 84.'
      }
    },
    en: {
      appTitle: 'Times tables', back: 'Home',
      tabLearn: 'Learn', tabTest: 'Quick quiz', tabRem: 'Remainders', tabReport: 'Report', tabSettings: 'Settings',
      pickTable: 'Pick a table', practiceThis: 'Quiz this table', hideAnswers: 'Hide answers', showAnswers: 'Show answers', arrayTitle: 'See it', tipsTitle: 'Tips',
      arrayDesc: '{a} × {b} is {b} rows of {a} dots, which makes {p} dots. Count in {a}s: ', familyTitle: 'Times and divide are friends',
      familyHint: 'In the same picture, {b} rows of {a} dots make {p} dots. If we ask the other way round, "{p} dots in rows of {a}: how many rows?", that is {p} ÷ {a}.',
      start: 'Start', stop: 'Stop', sessionTitle: 'This round', howTitle: 'How questions are chosen (for adults)',
      howText: 'Every fact has a "box" from 0 to 6. Fast correct answers move it up and it is asked less often. Wrong or too slow sends it back to box 0 and it is asked again soon. New facts are added only when the current ones are going well, and known facts come back now and then so they are not forgotten.',
      remLead: 'Bus stop practice: "How many 5s in 17, and how many are left over?"',
      divisors: 'Divide by', remWhy: 'Why practise this? (for adults)',
      remWhyText: 'In every column of bus stop division the child must answer "the divisor times what is closest without going over?" and "what is left?". Knowing the tables forwards is not enough; finding the biggest multiple that fits must be quick.',
      heatTitle: 'Mastery map', needTitle: 'Needs more work', tableMastery: 'Mastery by table', historyTitle: 'Recent rounds',
      sTables: 'Tables to learn', sTablesHint: 'Start with ×2, ×3, ×4, ×5, ×6, ×8, ×10. Add ×7 and ×9 once those are solid.', sMax: 'Up to', sTypes: 'Question types',
      typeMul: 'a × b = ?', typeMissing: 'a × ? = c', typeDiv: 'c ÷ a = ?', sTime: 'Time limit', noLimit: 'None',
      sTimeHint: 'Going over the limit counts as not yet known (still counting): the answer is shown and the fact comes back soon. Start with None; switch to 8 s once most answers are right.',
      sNew: 'New facts at once', sNewHint: 'Fewer is safer, more is faster. 4 is a good middle.', sData: 'Data', export: 'Export JSON', import: 'Import JSON', reset: 'Reset all', resetConfirm: 'Delete all times-table progress?',
      scopeAll: 'Chosen tables', scopeTable: '×{a} table', qCount: 'Question {n}', correctFb: 'Correct!', slowFb: 'Correct! Next time, try to answer a little faster.', wrongFb: 'Not yet.', timeoutFb: 'Time is up!',
      retypeFb: 'Type the right answer again: <b>{say}</b>', pressStart: 'Press "Start" to play.',
      sumTitle: 'You finished a round!', sumN: 'Questions', sumAcc: 'Correct', sumAvg: 'Per question', sumImproved: 'Facts you improved', sumReview: 'To practise', streakLbl: 'Right in a row', bestLbl: 'best', sumEmpty: 'You haven’t answered any questions yet.',
      unseen: 'not seen', boxLbl: 'box', wrongLbl: 'wrong', seenLbl: 'seen', avgLbl: 'avg', noData: 'No data yet. Let the child try the Quick quiz.', unseenCount: '{n} facts not seen yet.', allGood: 'Great, nothing urgent to review!',
      legend: ['not seen', 'box 0', 'box 1–2', 'box 3–4', 'box 5–6'],
      remQ: 'How many {d}s in {n}?', remR: 'There are {q} {d}s in {n}. How many are left over?', remHint: 'Because {d} × {q} = {p} is not more than {n}, but {d} × {q1} = {p1} is more than {n}. So there are {q} {d}s in {n}, with {r} left over.', remOk: 'Correct! {n} = {d} × {q} + {r}', remStatsTitle: 'By divisor', remTooBig: '{d} × {x} = {p}, which is more than {n}. Try a smaller number.', remTooSmall: '{d} × {x} = {p}, so {rest} is left and another one fits. Try a bigger number.', remRHint: 'Left over = {n} − {d} × {q}.',
      hist: { date: 'Date', n: 'Qs', acc: 'Correct', avg: 'Avg (s)' },
      tips: {
        1: 'Times 1 keeps the number the same.',
        2: 'Doubling means adding a number to itself: 2 × 7 = 7 + 7 = 14. The answer is always even.',
        3: 'Count in 3s: 3, 6, 9, 12, 15… Add the digits of the answer and you always get 3, 6 or 9 (3 × 8 = 24, 2 + 4 = 6).',
        4: 'The 4s are double the 2s: 2 × 7 = 14, and double that is 4 × 7 = 28.',
        5: 'The answer always ends in 0 or 5. To work out 5 × 8, take half of 10 × 8 = 80, which is 40.',
        6: 'The 6s are double the 3s: 3 × 7 = 21, and double that is 6 × 7 = 42. Another trick: 6 × 2 = 12, 6 × 4 = 24, 6 × 6 = 36, 6 × 8 = 48. The last digit matches the number you multiply by!',
        7: 'You already know most of the 7s from the 2 to 6 tables (7 × 3 = 3 × 7). Just learn: 7 × 7 = 49, 7 × 8 = 56 ("5, 6, 7, 8"), 7 × 9 = 63.',
        8: 'The 8s are double the 4s: 4 × 6 = 24, and double that is 8 × 6 = 48. The last digits go down: 8, 6, 4, 2, 0.',
        9: 'The two digits always add up to 9 (9 × 7 = 63, 6 + 3 = 9). The first digit is one less than the number you multiply by (7 − 1 = 6).',
        10: 'Just put a 0 on the end: 10 × 7 = 70.',
        11: 'From 1 to 9, just write the number twice: 11 × 4 = 44.',
        12: '12 × 7 = 10 × 7 + 2 × 7 = 70 + 14 = 84.'
      }
    }
  };
  const LANG_KEY = 'math_lang';
  let lang = (function () { try { return localStorage.getItem(LANG_KEY) || localStorage.getItem('div_lang') || 'vi'; } catch (e) { return 'vi'; } })();
  if (!DICT[lang]) lang = 'vi';
  function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ } }
  function t(k, p) {
    let s = DICT[lang][k];
    if (s === undefined) return k;
    if (typeof s !== 'string') return s;
    return p ? s.replace(/\{(\w+)\}/g, (m, key) => (p[key] !== undefined ? p[key] : m)) : s;
  }

  /* ---------- storage ---------- */
  /* Defaults: tables 2–6 first (check fluency before adding new tables); no time limit at first,
   * then 8 s once answers are mostly correct. */
  const DEFAULTS = { tables: [2, 3, 4, 5, 6], maxFactor: 10, types: { mul: true, missing: true, div: true }, timeLimit: 0, newLimit: 4 };
  let DB = LS.get(STORE, null) || { settings: {}, facts: {}, counter: 0, sessions: [], remStats: {}, remDivisors: [2, 3, 4, 5, 6] };
  DB.settings = Object.assign({}, DEFAULTS, DB.settings || {});
  DB.settings.types = Object.assign({}, DEFAULTS.types, DB.settings.types || {});
  DB.facts = DB.facts || {}; DB.sessions = DB.sessions || []; DB.remStats = DB.remStats || {}; DB.remDivisors = DB.remDivisors || [2, 3, 4, 5, 6];
  DB.counter = DB.counter || 0;
  function save() { LS.set(STORE, DB); }

  const key = (a, b) => Math.min(a, b) + 'x' + Math.max(a, b);
  const parseKey = (k) => { const [a, b] = k.split('x').map(Number); return { a, b }; };
  function fact(k) { return DB.facts[k] || (DB.facts[k] = { seen: 0, correct: 0, wrong: 0, slow: 0, box: 0, due: 0, last: 0, ms: 0, streak: 0 }); }
  function peek(k) { return DB.facts[k] || { seen: 0, correct: 0, wrong: 0, slow: 0, box: 0, due: 0, last: 0, ms: 0, streak: 0 }; }
  function scopeKeys(table) {
    const s = DB.settings, set = new Set();
    (table ? [table] : s.tables).forEach((a) => { for (let b = 1; b <= s.maxFactor; b++) set.add(key(a, b)); });
    return Array.from(set);
  }
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- scheduler ---------- */
  function pickNext(scope, prevKey) {
    const now = DB.counter;
    const seen = scope.filter((k) => peek(k).seen > 0);
    const unseen = scope.filter((k) => peek(k).seen === 0);
    const learning = seen.filter((k) => peek(k).box < 3);
    const due = seen.filter((k) => peek(k).due <= now && k !== prevKey);
    const mastered = seen.filter((k) => peek(k).box >= 3 && k !== prevKey);
    if (mastered.length && Math.random() < 0.12) return pickRandom(mastered); // interleave a known fact
    if (due.length) {
      due.sort((x, y) => (peek(x).box - peek(y).box) || (peek(x).due - peek(y).due) || (Math.random() - 0.5));
      return pickRandom(due.slice(0, 3));
    }
    if (unseen.length && (learning.length < DB.settings.newLimit || Math.random() < 0.4)) return unseen[0];
    const pool = seen.filter((k) => k !== prevKey);
    if (!pool.length) return unseen[0] || scope[0];
    pool.sort((x, y) => peek(x).due - peek(y).due);
    return pickRandom(pool.slice(0, 3));
  }

  function grade(k, correct, ms) {
    const f = fact(k), now = ++DB.counter, lim = DB.settings.timeLimit * 1000;
    f.seen++; f.last = now;
    const slow = lim > 0 && ms > lim;
    if (correct) {
      f.correct++; f.streak++;
      if (slow) f.slow++; else f.box = Math.min(6, f.box + 1);
      f.due = now + INTERVALS[f.box] + rnd(0, 2);
    } else {
      f.wrong++; f.streak = 0; f.box = 0; f.due = now + 2;
    }
    f.ms = f.ms ? Math.round(f.ms * 0.7 + ms * 0.3) : Math.round(ms);
    save();
    return { slow };
  }

  function makeQuestion(k) {
    const { a, b } = parseKey(k), f = peek(k), types = DB.settings.types, tabs = DB.settings.tables;
    let T = a, O = b;
    const aIn = tabs.includes(a), bIn = tabs.includes(b);
    if (bIn && !aIn) { T = b; O = a; } else if (aIn && bIn && Math.random() < 0.5) { T = b; O = a; }
    const prod = a * b;
    const choices = [];
    if (types.mul !== false) choices.push('mul', 'mul');
    if (f.box >= 1) { if (types.missing) choices.push('missing'); if (types.div) choices.push('div', 'div'); }
    if (!choices.length) choices.push('mul');
    const type = pickRandom(choices);
    const swap = Math.random() < 0.5;
    if (type === 'mul') return { k, type, text: (swap ? O + ' × ' + T : T + ' × ' + O) + ' = ?', answer: prod, say: T + ' × ' + O + ' = ' + prod };
    if (type === 'missing') return { k, type, text: T + ' × ? = ' + prod, answer: O, say: T + ' × ' + O + ' = ' + prod };
    return { k, type, text: prod + ' ÷ ' + T + ' = ?', answer: O, say: prod + ' ÷ ' + T + ' = ' + O };
  }

  /* ---------- test session ---------- */
  const T = { active: false, scope: [], table: null, q: null, typed: '', t0: 0, timer: null, n: 0, correct: 0, msSum: 0, streak: 0, best: 0, improved: new Set(), review: new Set(), prevKey: null, phase: 'idle', boxBefore: 0 };

  function startTest(table) {
    Object.assign(T, { active: true, scope: scopeKeys(table || null), table: table || null, n: 0, correct: 0, msSum: 0, streak: 0, best: 0, improved: new Set(), review: new Set(), prevKey: null });
    $('#tStart').classList.add('hidden'); $('#tStop').classList.remove('hidden');
    $('#tScope').textContent = table ? t('scopeTable', { a: table }) : t('scopeAll');
    nextQuestion();
  }
  function renderQuestionText(el, text, typed) {
    el.innerHTML = text.replace('?', '<span class="unk">' + (typed || '?') + '</span>');
  }
  function nextQuestion() {
    const k = pickNext(T.scope, T.prevKey);
    T.q = makeQuestion(k); T.typed = ''; T.phase = 'ask'; T.boxBefore = peek(k).box;
    $('#tFeedback').innerHTML = '';
    $('#answerLine').textContent = '';
    $('#tCount').textContent = t('qCount', { n: T.n + 1 });
    renderQuestionText($('#question'), T.q.text, '');
    renderSession();
    startTimer();
  }
  function startTimer() {
    stopTimer();
    const bar = $('#timerBar'), lim = DB.settings.timeLimit * 1000;
    T.t0 = performance.now();
    bar.classList.remove('warn', 'over');
    if (!lim) { bar.style.visibility = 'hidden'; return; }
    bar.style.visibility = 'visible'; bar.firstElementChild.style.width = '100%';
    T.timer = setInterval(() => {
      const el = performance.now() - T.t0, frac = Math.min(1, el / lim);
      bar.firstElementChild.style.width = (100 * (1 - frac)) + '%';
      bar.classList.toggle('warn', frac > 0.6);
      if (el >= lim) { stopTimer(); onTimeout(); }
    }, 50);
  }
  function stopTimer() { if (T.timer) { clearInterval(T.timer); T.timer = null; } }

  function submitTest() {
    if (!T.active) return;
    if (T.phase === 'ask') {
      const x = parseInt(T.typed, 10); if (isNaN(x)) return;
      const ms = performance.now() - T.t0; stopTimer();
      const ok = x === T.q.answer;
      const res = grade(T.q.k, ok, ms);
      T.n++; T.msSum += ms;
      if (ok) {
        T.correct++; T.streak++; T.best = Math.max(T.best, T.streak);
        if (peek(T.q.k).box > T.boxBefore) T.improved.add(T.q.k);
        $('#tFeedback').innerHTML = '<span class="big-ok">' + (res.slow ? '⏱ ' + t('slowFb') : '✔ ' + t('correctFb')) + '</span>';
        T.prevKey = T.q.k; T.phase = 'between';
        setTimeout(nextQuestion, res.slow ? 1100 : 600);
      } else {
        T.streak = 0; T.review.add(T.q.k);
        T.phase = 'retype'; T.typed = '';
        $('#tFeedback').innerHTML = '<span class="big-no">✘ ' + t('wrongFb') + '</span><div class="retype">' + t('retypeFb', { say: T.q.say }) + '</div>';
        renderQuestionText($('#question'), T.q.text, '');
      }
      renderSession();
    } else if (T.phase === 'retype') {
      const x = parseInt(T.typed, 10);
      if (x === T.q.answer) { T.prevKey = T.q.k; T.phase = 'between'; $('#tFeedback').innerHTML = '<span class="big-ok">👍</span>'; setTimeout(nextQuestion, 500); }
      else { T.typed = ''; renderQuestionText($('#question'), T.q.text, ''); $('#question').classList.add('shake'); setTimeout(() => $('#question').classList.remove('shake'), 400); }
    }
  }
  function onTimeout() {
    if (!T.active || T.phase !== 'ask') return;
    const lim = DB.settings.timeLimit * 1000;
    grade(T.q.k, false, lim);
    T.n++; T.msSum += lim; T.streak = 0; T.review.add(T.q.k);
    T.phase = 'retype'; T.typed = '';
    $('#timerBar').classList.add('over');
    $('#tFeedback').innerHTML = '<span class="big-no">⏱ ' + t('timeoutFb') + '</span><div class="retype">' + t('retypeFb', { say: T.q.say }) + '</div>';
    renderQuestionText($('#question'), T.q.text, '');
    renderSession();
  }
  function typeDigit(ch) {
    if (!T.active || (T.phase !== 'ask' && T.phase !== 'retype')) return;
    if (ch === 'back') T.typed = T.typed.slice(0, -1);
    else if (T.typed.length < 3) T.typed += ch;
    renderQuestionText($('#question'), T.q.text, T.typed);
  }
  function stopTest() {
    if (!T.active) return;
    T.active = false; stopTimer();
    if (T.n > 0) {
      DB.sessions.push({ at: Date.now(), n: T.n, correct: T.correct, avg: Math.round(T.msSum / T.n) });
      if (DB.sessions.length > 60) DB.sessions = DB.sessions.slice(-60);
      save();
    }
    $('#tStart').classList.remove('hidden'); $('#tStop').classList.add('hidden');
    $('#timerBar').style.visibility = 'hidden';
    const rev = Array.from(T.review).map(fmtKey).join(', ');
    $('#question').innerHTML = '<span class="small" style="font-size:1.4rem">' + t('sumTitle') + '</span>';
    $('#tFeedback').innerHTML = T.n ? '<div class="note info" style="text-align:left">' +
      t('sumN') + ': <b>' + T.n + '</b> · ' + t('sumAcc') + ': <b>' + T.correct + '/' + T.n + '</b> · ' + t('sumAvg') + ': <b>' + (T.msSum / T.n / 1000).toFixed(1) + 's</b><br>' +
      t('sumImproved') + ': <b>' + T.improved.size + '</b><br>' + t('sumReview') + ': ' + (rev || '–') + '</div>' : '<p class="muted">' + t('sumEmpty') + '</p>';
    $('#answerLine').textContent = t('pressStart');
    renderSession();
  }
  function fmtKey(k) { const { a, b } = parseKey(k); return a + ' × ' + b; }
  function renderSession() {
    const el = $('#tSession');
    if (!T.active && !T.n) { el.innerHTML = '<p class="muted small">' + t('pressStart') + '</p>'; $('#tStreak').textContent = ''; return; }
    el.innerHTML = '<div>' + t('sumN') + ': <b>' + T.n + '</b></div><div>' + t('sumAcc') + ': <b>' + T.correct + '</b></div>' +
      '<div>' + t('sumAvg') + ': <b>' + (T.n ? (T.msSum / T.n / 1000).toFixed(1) : '–') + 's</b></div>' +
      '<div>' + t('sumImproved') + ': <b>' + T.improved.size + '</b></div>' +
      '<div class="small muted" style="margin-top:6px">' + t('sumReview') + ': ' + (Array.from(T.review).map(fmtKey).join(', ') || '–') + '</div>';
    $('#tStreak').textContent = T.streak >= 2 ? '🔥 ' + T.streak : (T.best ? t('streakLbl') + ' ' + t('bestLbl') + ' ' + T.best : '');
  }

  /* ---------- remainder drill ---------- */
  const R = { active: false, q: null, phase: 'idle', typed: '', n: 0, correct: 0, tries: 0 };
  function remNext() {
    const d = pickRandom(DB.remDivisors), q = rnd(1, 9), r = rnd(0, d - 1);
    R.q = { n: d * q + r, d, q, r }; R.phase = 'q'; R.typed = ''; R.tries = 0;
    $('#remFeedback').innerHTML = '';
    renderRem();
  }
  function renderRem() {
    const q = R.q; if (!q) return;
    const qTxt = R.phase === 'q' ? '<span class="unk">' + (R.typed || '?') + '</span>' : '<b>' + q.q + '</b>';
    const rTxt = R.phase === 'r' ? '<span class="unk">' + (R.typed || '?') + '</span>' : (R.phase === 'done' ? '<b>' + q.r + '</b>' : '?');
    $('#remQuestion').innerHTML = q.n + ' ÷ ' + q.d + ' = ' + qTxt + ' <span class="small">' + (lang === 'vi' ? 'dư' : 'r') + '</span> ' + rTxt;
    $('#remQuestion').classList.add('small');
    $('#remAnswerLine').textContent = R.phase === 'q' ? t('remQ', q) : R.phase === 'r' ? t('remR', q) : '';
  }
  function remSubmit() {
    if (!R.active || !R.q) return;
    const x = parseInt(R.typed, 10); if (isNaN(x)) return;
    const q = R.q;
    if (R.phase === 'q') {
      if (x === q.q) { R.phase = 'r'; R.typed = ''; $('#remFeedback').innerHTML = '<span class="big-ok">✔</span>'; renderRem(); }
      else {
        R.tries++;
        const p = x * q.d;
        let h = p > q.n ? t('remTooBig', { d: q.d, x, p, n: q.n }) : t('remTooSmall', { d: q.d, x, p, rest: q.n - p });
        if (R.tries >= 2) h += ' ' + t('remHint', { d: q.d, q: q.q, p: q.d * q.q, n: q.n, p1: q.d * (q.q + 1), q1: q.q + 1, r: q.r });
        $('#remFeedback').innerHTML = '<div class="note bad">' + h + '</div>';
        R.typed = ''; renderRem();
      }
    } else if (R.phase === 'r') {
      if (x === q.r) {
        R.phase = 'done'; renderRem();
        const st = DB.remStats[q.d] || (DB.remStats[q.d] = { n: 0, clean: 0 });
        st.n++; if (R.tries === 0) st.clean++; save();
        R.n++; if (R.tries === 0) R.correct++;
        $('#remFeedback').innerHTML = '<span class="big-ok">' + t('remOk', q) + '</span>';
        renderRemStats();
        setTimeout(remNext, 900);
      } else {
        R.tries++;
        $('#remFeedback').innerHTML = '<div class="note bad">' + t('remRHint', { n: q.n, d: q.d, q: q.q }) + '</div>';
        R.typed = ''; renderRem();
      }
    }
  }
  function remType(ch) {
    if (!R.active || (R.phase !== 'q' && R.phase !== 'r')) return;
    if (ch === 'back') R.typed = R.typed.slice(0, -1); else if (R.typed.length < 2) R.typed += ch;
    renderRem();
  }
  function renderRemStats() {
    const ds = Object.keys(DB.remStats).map(Number).sort((a, b) => a - b);
    $('#remStats').innerHTML = '<h3 style="margin-top:10px">' + t('remStatsTitle') + '</h3>' + (ds.length ? ds.map((d) => { const s = DB.remStats[d]; return '<div>÷' + d + ': <b>' + s.clean + '/' + s.n + '</b></div>'; }).join('') : '<p class="muted small">–</p>');
  }
  function renderRemChips() {
    const el = $('#remDivChips'); el.innerHTML = '';
    for (let d = 2; d <= 9; d++) {
      const b = document.createElement('button'); b.className = 'chip sm' + (DB.remDivisors.includes(d) ? ' active' : ''); b.textContent = '÷' + d;
      b.onclick = () => { if (DB.remDivisors.includes(d)) { if (DB.remDivisors.length > 1) DB.remDivisors = DB.remDivisors.filter((x) => x !== d); } else DB.remDivisors = DB.remDivisors.concat([d]).sort((a, b2) => a - b2); save(); renderRemChips(); };
      el.appendChild(b);
    }
  }

  /* ---------- learn ---------- */
  const L = { table: null, sel: 4, hide: false };
  function renderLearn() {
    if (!L.table) L.table = DB.settings.tables[0] || 2;
    const chips = $('#learnChips'); chips.innerHTML = '';
    for (let a = 1; a <= 12; a++) { const b = document.createElement('button'); b.className = 'chip' + (a === L.table ? ' active' : '') + (DB.settings.tables.includes(a) ? '' : ' muted'); b.textContent = '×' + a; b.onclick = () => { L.table = a; L.sel = 4; renderLearn(); }; chips.appendChild(b); }
    const a = L.table, max = DB.settings.maxFactor;
    const rows = $('#learnRows'); rows.innerHTML = ''; rows.classList.toggle('hide', L.hide);
    rows.style.gridAutoFlow = 'column'; rows.style.gridTemplateRows = 'repeat(' + Math.ceil(max / 2) + ', auto)';
    for (let b = 1; b <= max; b++) {
      const r = document.createElement('div'); r.className = b === L.sel ? 'sel' : '';
      r.innerHTML = '<span>' + a + ' × ' + b + '</span><span class="ans">' + a * b + '</span>';
      r.onclick = () => { if (L.hide && L.sel === b) r.classList.toggle('reveal'); L.sel = b; renderLearn(); };
      rows.appendChild(r);
    }
    $('#learnHideToggle').textContent = L.hide ? t('showAnswers') : t('hideAnswers');
    const arr = $('#learnArray'); arr.innerHTML = ''; arr.style.gridTemplateColumns = 'repeat(' + a + ', 16px)';
    for (let i = 0; i < L.sel; i++) for (let j = 0; j < a; j++) { const s = document.createElement('span'); if (i % 2) s.className = 'alt'; arr.appendChild(s); }
    const skip = $('#learnSkip'); skip.innerHTML = '';
    for (let b = 1; b <= max; b++) { const s = document.createElement('span'); s.textContent = a * b; if (b === L.sel) s.className = 'cur'; skip.appendChild(s); }
    const b = L.sel, p = a * b;
    $('#learnArrayDesc').textContent = t('arrayDesc', { a, b, p });
    $('#learnFamily').innerHTML = '<h3>' + t('familyTitle') + '</h3><div class="family">' +
      '<span>' + a + ' × ' + b + ' = ' + p + '</span><span>' + b + ' × ' + a + ' = ' + p + '</span>' +
      '<span class="divf">' + p + ' ÷ ' + a + ' = ' + b + '</span><span class="divf">' + p + ' ÷ ' + b + ' = ' + a + '</span></div>' +
      '<p class="small muted">' + t('familyHint', { a, b, p }) + '</p>';
    $('#learnTips').innerHTML = '<p>' + t('tips')[a] + '</p>';
  }

  /* ---------- report ---------- */
  function boxClass(f) { if (!f || !f.seen) return 'b-1'; return 'b' + f.box; }
  function renderReport() {
    const s = DB.settings, tables = s.tables.slice().sort((a, b) => a - b), max = s.maxFactor;
    const heat = $('#heatmap'); heat.innerHTML = '';
    heat.style.gridTemplateColumns = 'repeat(' + (max + 1) + ', 38px)';
    heat.appendChild(Object.assign(document.createElement('div'), { className: 'hh', textContent: '×' }));
    for (let b = 1; b <= max; b++) heat.appendChild(Object.assign(document.createElement('div'), { className: 'hh', textContent: b }));
    tables.forEach((a) => {
      heat.appendChild(Object.assign(document.createElement('div'), { className: 'hh', textContent: a }));
      for (let b = 1; b <= max; b++) {
        const k = key(a, b), f = DB.facts[k];
        const c = document.createElement('div'); c.className = 'hc ' + boxClass(f); c.textContent = a * b;
        c.title = a + ' × ' + b + ' = ' + a * b + (f && f.seen ? ' · ' + t('boxLbl') + ' ' + f.box + ' · ' + t('wrongLbl') + ' ' + f.wrong + '/' + f.seen + ' · ' + t('avgLbl') + ' ' + (f.ms / 1000).toFixed(1) + 's' : ' · ' + t('unseen'));
        c.onclick = () => { const d = $('#heatDetail'); d.classList.remove('hidden'); d.textContent = c.title; };
        heat.appendChild(c);
      }
    });
    const lg = $('#legend'); lg.innerHTML = '';
    const legendCls = ['b-1', 'b0', 'b1', 'b3', 'b5'];
    t('legend').forEach((txt, i) => { const sp = document.createElement('span'); sp.innerHTML = '<i class="hc ' + legendCls[i] + '" style="display:inline-block"></i>' + txt; lg.appendChild(sp); });
    // need list
    const scope = scopeKeys(null);
    const seen = scope.filter((k) => peek(k).seen > 0);
    const need = seen.filter((k) => peek(k).box <= 1 || peek(k).wrong > peek(k).correct).sort((x, y) => (peek(x).box - peek(y).box) || (peek(y).wrong - peek(x).wrong)).slice(0, 15);
    const nl = $('#needList'); nl.className = 'needlist';
    nl.innerHTML = need.length ? need.map((k) => { const { a, b } = parseKey(k), f = peek(k); return '<div><span>' + a + ' × ' + b + ' = ' + a * b + '</span><span class="muted">' + t('boxLbl') + ' ' + f.box + ' · ' + t('wrongLbl') + ' ' + f.wrong + '/' + f.seen + '</span></div>'; }).join('') : '<p class="muted">' + (seen.length ? t('allGood') : t('noData')) + '</p>';
    const unseenN = scope.length - seen.length;
    if (unseenN) nl.innerHTML += '<p class="small muted">' + t('unseenCount', { n: unseenN }) + '</p>';
    // mastery per table
    const m = $('#mastery'); m.className = 'mastery'; m.innerHTML = '';
    tables.forEach((a) => {
      let tot = 0, ok = 0;
      for (let b = 1; b <= max; b++) { tot++; if (peek(key(a, b)).box >= 3) ok++; }
      const pct = Math.round(100 * ok / tot);
      m.innerHTML += '<div>×' + a + ' <span class="muted small">' + ok + '/' + tot + '</span><div class="progress"><span style="width:' + pct + '%"></span></div></div>';
    });
    // history
    const h = $('#history'); h.className = 'history';
    const ss = DB.sessions.slice(-10).reverse();
    const H = t('hist');
    h.innerHTML = ss.length ? '<table><tr><th>' + H.date + '</th><th>' + H.n + '</th><th>' + H.acc + '</th><th>' + H.avg + '</th></tr>' +
      ss.map((x) => '<tr><td>' + new Date(x.at).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) + '</td><td>' + x.n + '</td><td>' + x.correct + '</td><td>' + (x.avg / 1000).toFixed(1) + '</td></tr>').join('') + '</table>' : '<p class="muted">' + t('noData') + '</p>';
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    const s = DB.settings;
    const st = $('#sTables'); st.innerHTML = '';
    for (let a = 1; a <= 12; a++) {
      const b = document.createElement('button'); b.className = 'chip' + (s.tables.includes(a) ? ' active' : ''); b.textContent = '×' + a;
      b.onclick = () => { if (s.tables.includes(a)) { if (s.tables.length > 1) s.tables = s.tables.filter((x) => x !== a); } else s.tables = s.tables.concat([a]).sort((x, y) => x - y); save(); renderSettings(); };
      st.appendChild(b);
    }
    $$('#sMax button').forEach((b) => { b.classList.toggle('active', Number(b.dataset.v) === s.maxFactor); b.onclick = () => { s.maxFactor = Number(b.dataset.v); save(); renderSettings(); }; });
    $$('#sTypes input').forEach((i) => { i.checked = !!s.types[i.dataset.type]; i.onchange = () => { s.types[i.dataset.type] = i.checked; if (!s.types.mul && !s.types.missing && !s.types.div) { s.types.mul = true; i.checked = i.dataset.type === 'mul'; } save(); }; });
    $$('#sTime button').forEach((b) => { b.classList.toggle('active', Number(b.dataset.v) === s.timeLimit); b.onclick = () => { s.timeLimit = Number(b.dataset.v); save(); renderSettings(); }; });
    $$('#sNew button').forEach((b) => { b.classList.toggle('active', Number(b.dataset.v) === s.newLimit); b.onclick = () => { s.newLimit = Number(b.dataset.v); save(); renderSettings(); }; });
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bang-cuu-chuong-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importJSON(file) {
    const rd = new FileReader();
    rd.onload = () => { try { const obj = JSON.parse(rd.result); if (!obj || typeof obj !== 'object' || !obj.facts) throw new Error('bad'); DB = obj; DB.settings = Object.assign({}, DEFAULTS, DB.settings || {}); save(); location.reload(); } catch (e) { alert('Invalid file'); } };
    rd.readAsText(file);
  }

  /* ---------- keypad + tabs ---------- */
  function buildKeypad(el, onKey, onOk) {
    el.innerHTML = '';
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach((k) => {
      const b = document.createElement('button'); b.textContent = k; if (k === 'OK') b.className = 'primary';
      b.onclick = () => { if (k === 'OK') onOk(); else if (k === '⌫') onKey('back'); else onKey(k); };
      el.appendChild(b);
    });
  }
  let tab = LS.get('tt_tab', 'learn');
  function showTab(name) {
    tab = name; LS.set('tt_tab', tab);
    ['learn', 'test', 'rem', 'report', 'settings'].forEach((k) => $('#tab-' + k).classList.toggle('hidden', k !== tab));
    $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'learn') renderLearn();
    if (tab === 'report') renderReport();
    if (tab === 'settings') renderSettings();
    if (tab === 'test') renderSession();
    if (tab === 'rem') { renderRemChips(); renderRemStats(); }
    if (tab !== 'test' && T.active) stopTest();
    if (tab !== 'rem') R.active = false;
  }
  function applyI18n() {
    $$('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.title = t('appTitle'); document.documentElement.lang = lang;
    $$('#langSeg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  }

  function init() {
    applyI18n();
    $$('#langSeg button').forEach((b) => { b.onclick = () => { lang = b.dataset.lang; saveLang(lang); applyI18n(); showTab(tab); if (T.active) renderQuestionText($('#question'), T.q.text, T.typed); }; });
    $$('#tabs button').forEach((b) => { b.onclick = () => showTab(b.dataset.tab); });
    buildKeypad($('#tKeypad'), typeDigit, submitTest);
    buildKeypad($('#remKeypad'), remType, remSubmit);
    $('#tStart').onclick = () => startTest(null);
    $('#tStop').onclick = stopTest;
    $('#tStop').classList.add('hidden');
    $('#remStart').onclick = () => { R.active = true; R.n = 0; R.correct = 0; $('#remStart').classList.add('hidden'); remNext(); };
    $('#learnPractice').onclick = () => { showTab('test'); startTest(L.table); };
    $('#learnHideToggle').onclick = () => { L.hide = !L.hide; renderLearn(); };
    $('#sExport').onclick = exportJSON;
    $('#sImportFile').onchange = (e) => { if (e.target.files[0]) importJSON(e.target.files[0]); };
    $('#sReset').onclick = () => { if (confirm(t('resetConfirm'))) { localStorage.removeItem(STORE); location.reload(); } };
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (tab === 'test') {
        if (!T.active && e.key === 'Enter') { startTest(null); return; }
        if (/^[0-9]$/.test(e.key)) typeDigit(e.key);
        else if (e.key === 'Backspace') typeDigit('back');
        else if (e.key === 'Enter') submitTest();
        else if (e.key === 'Escape') stopTest();
      } else if (tab === 'rem') {
        if (!R.active && e.key === 'Enter') { $('#remStart').click(); return; }
        if (/^[0-9]$/.test(e.key)) remType(e.key);
        else if (e.key === 'Backspace') remType('back');
        else if (e.key === 'Enter') remSubmit();
      }
    });
    $('#answerLine').textContent = t('pressStart');
    $('#timerBar').style.visibility = 'hidden';
    showTab(tab);
  }
  document.addEventListener('DOMContentLoaded', init);
})();
