/* Bilingual strings (vi / en). t(key, params) interpolates {name}.
 * Child-facing text (narration, prompts, hints, buttons) is written for 7–8 year olds:
 * short sentences, "em" in Vietnamese, everyday words, classroom English terms in italics.
 * Adult-facing text (levels, settings, statistics, the guide) is written for parents/teachers.
 * The language choice is shared by all apps in the site (localStorage key "math_lang").
 */
(function (global) {
  'use strict';
  const D = {
    vi: {
      appTitle: 'Phép chia Bus stop',
      back: 'Trang chủ',
      tabBlocks: '1. Chia khối', tabBridge: '2. Khối và số', tabPractice: '3. Tới lượt cậu',
      pick: 'Chọn bài', fromBook: 'Bài OF3-3F', custom: 'Tự nhập', random: 'Bài mới', go: 'Làm', level: 'Mức',
      divisors: 'Số chia', settings: 'Cài đặt', lang: 'Ngôn ngữ', layoutLbl: 'Cách viết',
      layoutShort: 'Ngắn (như sách)', layoutLong: 'Dài (trừ, hạ xuống)',
      showTable: 'Hiện bảng nhân', askMode: 'Cậu đoán trước', askModeHint: 'Trẻ trả lời từng bước trước, rồi khối mới chuyển động.',
      next: 'Tiếp ▶', prev: '◀ Lùi', play: 'Tự chạy', stop: 'Dừng', restart: 'Làm lại', another: 'Bài khác', check: 'Kiểm tra', showAnswer: 'Xem đáp án', seeBlocks: 'Xem bằng khối', hideBlocks: 'Ẩn khối',
      stepOf: 'Bước {k}/{n}',
      L1: '2 chữ số · không phải đổi', L2: '2 chữ số · có đổi (như sách)', L3: '2 chữ số · có dư',
      L4: '3 chữ số', L5: '3 chữ số · chữ số đầu nhỏ hơn số chia', L6: '3 chữ số · kết quả có số 0', L7: '3 chữ số · có dư',
      place: { h: 'trăm', t: 'chục', o: 'đơn vị' },
      groups: 'nhóm', group: 'Nhóm', pool: 'Chưa chia', each: 'mỗi nhóm',
      // narration (child)
      nStart: 'Mình có <b>{N}</b>, gồm {comp}. Cậu hãy chia đều (<i>divide</i>) cho <b>{d} nhóm</b> (<i>equal groups</i>) nhé. Mỗi nhóm sẽ được bao nhiêu?',
      nStartRule: 'Mẹo: mình chia hàng {first} (<i>{firstEn}</i>) trước. Nếu còn dư thì <b>đổi</b> sang hàng nhỏ hơn rồi chia tiếp.',
      nShare: 'Chia <b>{avail} {place}</b> cho {d} nhóm thì mỗi nhóm được <b>{q} {place}</b>. Như vậy đã chia {q} × {d} = {used} {place}, còn dư <b>{left} {place}</b>.',
      nShareNoLeft: 'Chia <b>{avail} {place}</b> cho {d} nhóm thì mỗi nhóm được <b>{q} {place}</b>. Như vậy đã chia {q} × {d} = {used} {place}, không còn dư.',
      nShareZero: '<b>{avail} {place}</b> thì không đủ chia cho {d} nhóm, nên mỗi nhóm được 0 {place}. Mình đổi {avail} {place} sang hàng {next} để chia tiếp.',
      nExchange: '{left} {place} còn dư thì không chia đều cho {d} nhóm được, nên mình <b>đổi</b> (<i>exchange</i>) {left} {place} thành <b>{tenfold} {next}</b>. Cộng với {digit} {next} có sẵn, giờ mình có <b>{avail} {next}</b>.',
      nResult: 'Mỗi nhóm có {comp}, tức là <b>{quotient}</b>. Vậy <b>{N} ÷ {d} = {quotient}{rem}</b>.',
      nResultLeft: ' Còn lại {r} đơn vị không chia đều được nữa. Đó gọi là <b>số dư</b> (<i>remainder</i>).',
      nNextCheck: 'Cậu bấm "Tiếp" để mình thử lại bằng phép nhân nhé.',
      nCheckA: 'Thử lại (<i>check</i>) nhé: mình gộp {d} nhóm lại với nhau thì được {comp}{expr} = <b>{N}</b>.',
      nCheckDone: ' Đúng bằng số ban đầu! Vậy <b>{d} × {quotient}{plus} = {N}</b> ✔ Cậu làm đúng rồi!',
      nRegroup: 'Mình gom lại cho gọn: cứ 10 đơn vị thành 1 chục, 10 chục thành 1 trăm. Giờ có {comp}, đúng là <b>{N}</b>.',
      nCheck: 'Thử lại bằng phép nhân: {d} × {quotient}{plus} = {N}. ✔',
      poolBack: 'Gộp lại',
      remWord: ' dư {r}', plusR: ' + {r}',
      // blocks <-> written method (child)
      bStart: 'Đây là "bến xe buýt" (<i>bus stop</i>): số {d} đứng chờ ở bến, còn số {N} ngồi trong xe. Kết quả mình sẽ viết trên nóc xe.',
      bShare: 'Mình viết <b>{q}</b> lên nóc xe, ngay trên cột {place}. Đó là số {place} mà mỗi nhóm được.',
      bShareLong: 'Viết <b>{used}</b> xuống dưới, đó là số {place} đã chia ({q} × {d}). Lấy {avail} − {used} = <b>{left}</b>, nghĩa là còn dư {left} {place}.',
      bShareZero: 'Trên cột {place} mình không viết gì, vì mỗi nhóm được 0 {place}.',
      bExchangeShort: 'Mình viết số <b>{left}</b> thật nhỏ trước số {digit}, rồi đọc là <b>{avail} {next}</b>. Vì {left} {place} đổi được {tenfold} {next}, cộng thêm {digit} {next} nữa.',
      bExchangeLong: 'Mình hạ số {digit} xuống cạnh số {left} thì được <b>{avail}</b>. Vì {left} {place} đổi được {tenfold} {next}, cộng thêm {digit} {next} nữa.',
      bResult: 'Các số trên nóc ghép lại thành <b>{quotient}</b>, đúng bằng số khối mà mỗi nhóm có.{remNote}',
      bRemShort: ' Số dư {r} thì mình viết là "r {r}".', bRemLong: ' Số cuối cùng là {r}, nhỏ hơn {d} nên không chia được nữa. Đó chính là số dư.',
      bCheck: 'Mình nhân ngược lại: {d} × {quotient}{plus} = {N}. Nếu ra đúng {N} thì cậu đã làm đúng rồi.',
      bRegroup: 'Lúc chia, mình đổi 1 chục thành 10 đơn vị. Lúc thử lại thì làm ngược lại: gom 10 đơn vị thành 1 chục.',
      // practice prompts (child)
      pQ: 'Có {avail} {place} chia cho {d} nhóm. Vậy mỗi nhóm được mấy {place}?',
      pQCarry: 'Giờ mình có {avail} {place}, chia cho {d} nhóm. Vậy mỗi nhóm được mấy {place}?',
      pQLead: '{hd} {hplace} không đủ chia cho {d} nhóm, nên mình đổi thành {tenfold} {place}, cộng thêm {digit} {place} là <b>{avail} {place}</b>. Vậy mỗi nhóm được mấy {place}?',
      pCarry: 'Còn dư mấy {place}? Cậu viết số đó thật nhỏ trước số {nextDigit} nhé.',
      pCarryZero: '{avail} {place} không đủ chia cho {d} nhóm, nên mình đổi hết sang hàng {next}. Cậu viết số nhỏ nào trước số {nextDigit}?',
      pUsed: 'Mỗi nhóm được {q} {place}, mà có {d} nhóm. Vậy đã chia tất cả mấy {place}? Cậu viết xuống dưới nhé.',
      pLeft: 'Lấy {avail} − {used} thì còn dư mấy {place}?',
      pBring: 'Giờ cậu hạ chữ số tiếp theo xuống, viết cạnh số {left} nhé.',
      hBringDigit: 'Chữ số cần hạ là số {nextDigit}, ở ngay trên mũi tên đó. Cậu viết nó cạnh số {left} nhé.',
      pRem: 'Vậy số dư (<i>remainder</i>) là mấy? (viết sau chữ "r")',
      pDone: '🎉 Giỏi lắm! {N} ÷ {d} = {quotient}{rem}. Mình thử lại nhé: {d} × {quotient}{plus} = {N}.',
      // hints (child)
      hSubInstead: 'Cậu vừa lấy {avail} − {d} rồi, nhưng mình đang <b>chia</b> mà. Cậu thử hỏi: "{d} nhân mấy thì gần {avail} nhất mà không quá {avail}?" Nhìn bảng nhân {d} nhé.',
      hTooBig: '{x} × {d} = {prod}, nhiều hơn {avail} rồi. Cậu thử số nhỏ hơn nhé.',
      hTooSmall: '{x} × {d} = {prod}, vậy còn dư {rest} nên vẫn chia thêm được. Cậu thử số lớn hơn nhé.',
      hCopy: 'Cậu đang chép lại số {avail} rồi. Mình cần chia {avail} cho {d} mà.',
      hQGeneric: 'Cậu thử nghĩ xem: {d} nhân mấy thì gần {avail} nhất mà không quá {avail}?',
      hUsedIsD: 'Chưa phải {d} đâu. Mỗi nhóm được {q} {place}, mà có {d} nhóm, vậy {q} × {d} bằng mấy?',
      hUsedGeneric: 'Số đã chia bằng số của mỗi nhóm nhân với số nhóm, tức là {q} × {d}.',
      hLeftSubD: 'Cậu vừa trừ đi {d}. Mình phải trừ {used}, là số đã chia nhé.',
      hLeftTooBig: 'Nếu còn dư {x} thì vẫn chia thêm được nữa. Cậu tính lại {avail} − {used} nhé.',
      hLeftGeneric: 'Cậu tính lại xem {avail} − {used} bằng mấy nhé.',
      hBringForgot: 'Cậu quên số dư rồi. {left} {place} đổi được {tenfold} {next}, cộng thêm {nextDigit} {next} nữa là bao nhiêu?',
      hBringOnlyLeft: 'Đúng là còn dư {left} rồi. Giờ thêm số {nextDigit} nữa: cậu viết {left} và {nextDigit} cạnh nhau nhé.',
      hBringGeneric: 'Cậu viết {left} rồi viết {nextDigit} ngay bên cạnh, thành {left}{nextDigit}.',
      hCarryGeneric: 'Số còn dư bằng {avail} − {used}. Nhớ là số dư phải nhỏ hơn {d} nhé.',
      hCarryZeroCase: '{avail} nhỏ hơn {d} nên chưa chia được. Mình đổi hết {avail} {place} sang hàng sau, cậu viết số {avail} thật nhỏ nhé.',
      hRemGeneric: 'Số dư bằng {avail} − {used}.',
      hAnswer: 'Đáp án là <b>{ans}</b>. {why}',
      hCount: 'Cậu thử đếm khối trong một nhóm xem: {comp}.',
      hCheck: 'Mỗi nhóm có {quotient}, mà có {d} nhóm, gộp lại được {comp}. Cậu cộng lại nhé.',
      whyQ: 'Vì {d} × {q} = {used} chưa quá {avail}, còn {d} × {q1} = {used1} thì quá {avail} rồi.',
      whyUsed: '{q} × {d} = {used}.', whyLeft: '{avail} − {used} = {left}.', whyBring: 'Viết {left} và {nextDigit} cạnh nhau thì được {avail}.', whyCarry: '{avail} − {used} = {left}.', whyRem: '{avail} − {used} = {left}.',
      tryAgain: 'Thử lại nhé', correct: '✔ Đúng rồi!', wrongLbl: 'Chưa đúng',
      aq: 'Cậu đoán xem, mỗi nhóm được mấy {place}?', aleft: 'Vậy còn dư mấy {place}?', aex: '{left} {place} đổi được mấy {next}? Cộng thêm {digit} {next} nữa thì có tất cả mấy {next}?', ares: 'Vậy mỗi nhóm có tất cả bao nhiêu?',
      aCheck: 'Gộp {d} nhóm lại thì được bao nhiêu? {d} × {quotient}{plus} = ?',
      tableTitle: 'Bảng nhân {d} (<i>{d} times table</i>)', tableHint: 'Cậu tìm số gần {avail} nhất mà không quá {avail} nhé.',
      starsLbl: 'Sao của cậu',
      // adult: statistics
      statsTitle: 'Hôm nay', solved: 'Bài làm xong', errors: 'Lỗi hay gặp', noErrors: 'Chưa có lỗi nào 🎉',
      e_sub: 'Lấy trừ thay cho chia', e_toobig: 'Số trên nóc quá lớn', e_toosmall: 'Số trên nóc quá nhỏ', e_used: 'Viết nhầm số đã chia', e_bring: 'Quên số dư khi hạ xuống', e_other: 'Lỗi khác',
      assistedLbl: 'Bài phải xem đáp án',
      reset: 'Xoá thống kê', resetConfirm: 'Xoá toàn bộ thống kê luyện tập?',
      invalid: 'Nhập số từ 10 đến 999, và số chia từ 2 đến 9.',
      bridgeLead: 'Bên trái là khối, bên phải là phép chia viết ra giấy. Cậu bấm "Tiếp" để xem mỗi con số có nghĩa là gì nhé.',
      practiceLead: 'Cậu điền từng ô nhé. Nếu sai thì tớ sẽ gợi ý. Nếu vẫn chưa nghĩ ra được thì bấm "Xem bằng khối".',
      blocksLead: 'Mình cùng chia {N} thành {d} nhóm bằng nhau nhé. Cậu bấm "Tiếp" để xem từng bước.',
      ruleShort: 'Các bước: <b>chia</b> (<i>divide</i>) → <b>còn dư</b> → <b>viết số nhỏ</b> (<i>carry</i>)', ruleLong: 'Các bước: <b>chia</b> (<i>divide</i>) → <b>nhân</b> (<i>multiply</i>) → <b>trừ</b> (<i>subtract</i>) → <b>hạ xuống</b> (<i>bring down</i>)',
      // adult: guide
      guideTitle: 'Hướng dẫn cho người lớn',
      guideBody:
        '<p>App dạy theo thứ tự <b>hiểu trước, làm sau</b>: trẻ thấy vì sao phải "đổi" chục dư thành đơn vị, rồi mới học các bước viết.</p>' +
        '<ol>' +
        '<li><b>1. Chia khối:</b> trẻ xem các khối được chia đều vào từng nhóm. Bật <i>Cậu đoán trước</i> để trẻ trả lời mỗi bước trước khi khối chuyển động. Nếu có que tính hoặc LEGO, cho trẻ chia bằng tay trước: chục là một bó 10 que hoặc tháp 10 viên. Đừng nói trước cách làm, hãy hỏi "bó này chia cho 4 bạn được không?" để trẻ tự nghĩ ra việc tháo bó.</li>' +
        '<li><b>2. Khối và số:</b> khối và phép viết chạy song song. Chỉ vào một con số và hỏi trẻ nó là khối nào.</li>' +
        '<li><b>3. Tới lượt cậu:</b> trẻ điền từng ô. App gợi ý theo đúng lỗi, ví dụ lấy trừ thay cho chia. Sai hai lần sẽ có nút xem bằng khối, sai ba lần app hiện đáp án.</li>' +
        '</ol>' +
        '<p><b>Thứ tự mức gợi ý:</b> 2 chữ số không phải đổi → có đổi (như sách) → có dư → 3 chữ số → chữ số đầu nhỏ hơn số chia → kết quả có số 0 → 3 chữ số có dư. Chỉ lên mức khi trẻ làm đúng vài bài liền không cần gợi ý.</p>' +
        '<p><b>Mẹo:</b> chọn <i>Cách viết</i> giống cách cô dạy ở lớp. Tắt <i>Hiện bảng nhân</i> khi trẻ đã quen. Luôn kết thúc bằng bước thử lại bằng phép nhân. Mỗi lần 15–20 phút, dừng khi trẻ còn hứng.</p>' +
        '<p class="muted small">Tiến độ chỉ lưu trên thiết bị này, không gửi đi đâu.</p>',
    },
    en: {
      appTitle: 'Bus stop division',
      back: 'Home',
      tabBlocks: '1. Share blocks', tabBridge: '2. Blocks and numbers', tabPractice: '3. Your turn',
      pick: 'Choose a question', fromBook: 'Unit OF3-3F', custom: 'Type your own', random: 'New question', go: 'Go', level: 'Level',
      divisors: 'Divide by', settings: 'Settings', lang: 'Language', layoutLbl: 'How to write',
      layoutShort: 'Short (as in the book)', layoutLong: 'Long (subtract, bring down)',
      showTable: 'Show times table', askMode: 'Guess first', askModeHint: 'The child answers each step before the blocks move.',
      next: 'Next ▶', prev: '◀ Back', play: 'Play', stop: 'Stop', restart: 'Start again', another: 'New question', check: 'Check', showAnswer: 'Show answer', seeBlocks: 'Show blocks', hideBlocks: 'Hide blocks',
      stepOf: 'Step {k}/{n}',
      L1: '2 digits · no exchange', L2: '2 digits · with exchange (as in the book)', L3: '2 digits · with remainder',
      L4: '3 digits', L5: '3 digits · first digit smaller than the divisor', L6: '3 digits · zero in the answer', L7: '3 digits · with remainder',
      place: { h: 'hundreds', t: 'tens', o: 'ones' },
      groups: 'groups', group: 'Group', pool: 'Not shared yet', each: 'each group',
      nStart: 'We have <b>{N}</b>, which is {comp}. Let’s share it into <b>{d} equal groups</b>. How much will each group get?',
      nStartRule: 'Tip: we share the {first} first. If some are left over, we <b>exchange</b> them for smaller blocks and keep sharing.',
      nShare: 'If we share <b>{avail} {place}</b> into {d} groups, each group gets <b>{q} {place}</b>. So we have shared out {q} × {d} = {used} {place}, with <b>{left} {place}</b> left over.',
      nShareNoLeft: 'If we share <b>{avail} {place}</b> into {d} groups, each group gets <b>{q} {place}</b>. So we have shared out {q} × {d} = {used} {place}, with nothing left over.',
      nShareZero: '<b>{avail} {place}</b>: not enough for {d} groups, so each group gets 0 {place}. Let’s <b>exchange</b> for {next} and keep sharing.',
      nExchange: 'The {left} {place} left over cannot be shared equally between {d} groups, so let’s <b>exchange</b>: {left} {place} = <b>{tenfold} {next}</b>. Add the {digit} {next} we already had, and now we have <b>{avail} {next}</b>.',
      nResult: 'Each group has {comp}, which is <b>{quotient}</b>. So <b>{N} ÷ {d} = {quotient}{rem}</b>.',
      nResultLeft: ' {r} ones are left that cannot be shared equally. That is the <b>remainder</b>.',
      nNextCheck: 'Press "Next" and let’s check by multiplying.',
      nCheckA: 'Let’s check: if we put the {d} groups back together, we get {comp}{expr} = <b>{N}</b>.',
      nCheckDone: ' That’s the number we started with! So <b>{d} × {quotient}{plus} = {N}</b> ✔ You got it right!',
      nRegroup: 'Let’s tidy up: every 10 ones make 1 ten, and 10 tens make 1 hundred. Now we have {comp}, which is <b>{N}</b>.',
      nCheck: 'Check by multiplying: {d} × {quotient}{plus} = {N}. ✔',
      poolBack: 'Back together',
      remWord: ' r {r}', plusR: ' + {r}',
      bStart: 'This is the "bus stop": the {d} waits at the stop, and the {N} sits in the bus. We write the answer on the roof.',
      bShare: 'We write <b>{q}</b> on the roof, right above the {place}. That is how many {place} each group gets.',
      bShareLong: 'We write <b>{used}</b> underneath: the {place} we shared out ({q} × {d}). Then {avail} − {used} = <b>{left}</b>, so we have {left} {place} left over.',
      bShareZero: 'We write nothing above the {place}, because each group gets 0 {place}.',
      bExchangeShort: 'We write a tiny <b>{left}</b> before the {digit} and read it as <b>{avail} {next}</b>, because {left} {place} became {tenfold} {next}, plus {digit} more.',
      bExchangeLong: 'We bring the {digit} down next to the {left}, and now it is <b>{avail}</b>, because {left} {place} became {tenfold} {next}, plus {digit} more.',
      bResult: 'The numbers on the roof make <b>{quotient}</b>, which is exactly what each group has.{remNote}',
      bRemShort: ' We write the remainder {r} as "r {r}".', bRemLong: ' The last number is {r}, which is smaller than {d}, so we stop. That is the remainder.',
      bCheck: 'Multiply back to check: {d} × {quotient}{plus} = {N}. If you get {N}, your answer is right.',
      bRegroup: 'When dividing, we exchanged 1 ten for 10 ones. When checking, we do the opposite and group 10 ones into 1 ten.',
      pQ: 'There are {avail} {place} to share between {d} groups. How many {place} does each group get?',
      pQCarry: 'Now we have {avail} {place} to share between {d} groups. How many {place} does each group get?',
      pQLead: '{hd} {hplace}: not enough for {d} groups, so we exchange for {tenfold} {place}. Add the {digit} and we have <b>{avail} {place}</b>. How many {place} does each group get?',
      pCarry: 'How many {place} are left over? Write that number small, before the {nextDigit}.',
      pCarryZero: '{avail} {place}: not enough for {d} groups, so we exchange for {next}. What tiny number goes before the {nextDigit}?',
      pUsed: 'Each group gets {q} {place}, and there are {d} groups. How many {place} have we shared out altogether? Write it underneath.',
      pLeft: 'What is {avail} − {used}? How many {place} are left over?',
      pBring: 'Now bring the next digit down and write it next to the {left}.',
      hBringDigit: 'The digit to bring down is {nextDigit}, right above the arrow. Write it next to the {left}.',
      pRem: 'So what is the remainder? (write it after the "r")',
      pDone: '🎉 Well done! {N} ÷ {d} = {quotient}{rem}. Let’s check: {d} × {quotient}{plus} = {N}.',
      hSubInstead: 'You did {avail} − {d}, but we are <b>dividing</b>. Try asking: "How many {d}s in {avail}?" Look at the {d} times table.',
      hTooBig: '{x} × {d} = {prod}, which is more than {avail}. Try a smaller number.',
      hTooSmall: '{x} × {d} = {prod}, so {rest} is left over and you can share more. Try a bigger number.',
      hCopy: 'You copied {avail}. We need to share {avail} between {d} groups.',
      hQGeneric: 'Think: how many {d}s in {avail}? Find the biggest one that fits.',
      hUsedIsD: 'Not {d}. Each group got {q} {place}, and there are {d} groups, so what is {q} × {d}?',
      hUsedGeneric: 'Shared out = each group × number of groups, so {q} × {d}.',
      hLeftSubD: 'You took away {d}. We need to take away {used}, the number we shared out.',
      hLeftTooBig: 'If {x} is left over, you can still share more. Work out {avail} − {used} again.',
      hLeftGeneric: 'Work out {avail} − {used} again.',
      hBringForgot: 'You forgot the leftover. {left} {place} make {tenfold} {next}, plus {nextDigit} more. How many is that?',
      hBringOnlyLeft: 'Yes, {left} is left over. Now add the {nextDigit} too: write {left} and {nextDigit} side by side.',
      hBringGeneric: 'Write {left}, then write {nextDigit} right next to it: {left}{nextDigit}.',
      hCarryGeneric: 'Left over = {avail} − {used}. Remember, it must be smaller than {d}.',
      hCarryZeroCase: '{avail} is smaller than {d}, so we cannot share yet. Exchange for smaller blocks and write a tiny {avail}.',
      hRemGeneric: 'The remainder is {avail} − {used}.',
      hAnswer: 'The answer is <b>{ans}</b>. {why}',
      hCount: 'Try counting the blocks in one group: {comp}.',
      hCheck: 'Each group has {quotient}, and there are {d} groups, which makes {comp}. Add them up.',
      whyQ: 'Because {d} × {q} = {used} is not more than {avail}, but {d} × {q1} = {used1} is more than {avail}.',
      whyUsed: '{q} × {d} = {used}.', whyLeft: '{avail} − {used} = {left}.', whyBring: 'Writing {left} and {nextDigit} side by side makes {avail}.', whyCarry: '{avail} − {used} = {left}.', whyRem: '{avail} − {used} = {left}.',
      tryAgain: 'Try again', correct: '✔ Correct!', wrongLbl: 'Not yet',
      aq: 'Have a guess: how many {place} does each group get?', aleft: 'So how many {place} are left over?', aex: 'Exchange {left} {place}: how many {next} is that? Add the {digit} {next}: how many {next} altogether?', ares: 'So how much does each group have altogether?',
      aCheck: 'If we put the {d} groups together, how much is that? {d} × {quotient}{plus} = ?',
      tableTitle: '{d} times table', tableHint: 'Find the biggest answer that is not more than {avail}.',
      starsLbl: 'Your stars',
      statsTitle: 'Today', solved: 'Questions done', errors: 'Common mistakes', noErrors: 'No mistakes yet 🎉',
      e_sub: 'Took away instead of dividing', e_toobig: 'Roof number too big', e_toosmall: 'Roof number too small', e_used: 'Wrong "shared out" number', e_bring: 'Forgot the leftover when bringing down', e_other: 'Other',
      assistedLbl: 'Questions where the answer was shown',
      reset: 'Clear statistics', resetConfirm: 'Clear all practice statistics?',
      invalid: 'Type a number from 10 to 999, and divide by 2 to 9.',
      bridgeLead: 'On the left are the blocks, and on the right is the written division. Press "Next" to see what each number means.',
      practiceLead: 'Fill in each box. If you get it wrong, I’ll give you a hint. If you’re still stuck, press "Show blocks".',
      blocksLead: 'Let’s share {N} into {d} equal groups. Press "Next" to see each step.',
      ruleShort: 'Steps: <b>divide → left over → carry</b> (write it small)', ruleLong: 'Steps: <b>divide → multiply → subtract → bring down</b>',
      guideTitle: 'Guide for parents and teachers',
      guideBody:
        '<p>The app teaches <b>understanding first, steps second</b>: children see why a leftover ten must be exchanged for ones before they learn the written steps.</p>' +
        '<ol>' +
        '<li><b>1. Share blocks:</b> the blocks are shared equally into groups. Turn on <i>Guess first</i> so the child answers each step before the blocks move. With straws or LEGO, let the child share by hand first: a ten is a bundle of 10 straws or a tower of 10 bricks. Do not explain the trick; ask "can this bundle be shared between 4 friends?" and let the child discover unbundling.</li>' +
        '<li><b>2. Blocks and numbers:</b> blocks and the written sum move together. Point at a number and ask which blocks it stands for.</li>' +
        '<li><b>3. Your turn:</b> the child fills in each box. Hints target the actual mistake, such as subtracting instead of dividing. After two wrong tries a "Show blocks" button appears; after three the answer is shown.</li>' +
        '</ol>' +
        '<p><b>Suggested level order:</b> 2 digits no exchange → with exchange (as in the book) → with remainder → 3 digits → first digit smaller than the divisor → zero in the answer → 3 digits with remainder. Move up after a few correct sums in a row without hints.</p>' +
        '<p><b>Tips:</b> choose the <i>How to write</i> layout your child uses at school. Hide the times table once the child is confident. Always finish with the check by multiplication. Keep sessions to 15–20 minutes and stop while the child is still keen.</p>' +
        '<p class="muted small">Progress is saved only on this device and is never sent anywhere.</p>',
    }
  };

  const LANG_KEY = 'math_lang';
  function readLang() {
    try { return localStorage.getItem(LANG_KEY) || localStorage.getItem('div_lang') || 'vi'; } catch (e) { return 'vi'; }
  }
  let lang = readLang();
  if (!D[lang]) lang = 'vi';

  function fmt(s, p) {
    if (!p) return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (p[k] !== undefined ? p[k] : m));
  }
  /* English: "1 tens" -> "1 ten" (templates use the plural place word; the count is only known at runtime). */
  function singularize(s) {
    return s.replace(/(^|[^0-9.,])1((?:<\/?b>)?) (hundred|ten|one)s\b/g, '$11$2 $3');
  }
  function t(key, p) {
    const s = D[lang][key];
    if (s === undefined) return key;
    if (typeof s !== 'string') return s;
    const out = fmt(s, p);
    return lang === 'en' ? singularize(out) : out;
  }
  function placeIn(l, kind, n) {
    const w = D[l].place[kind];
    if (l === 'en' && n === 1) return w.replace(/s$/, '');
    return w;
  }
  function place(kind, n) { return placeIn(lang, kind, n); }
  /* composition string, e.g. "1 trăm, 2 chục và 3 đơn vị" (HTML, coloured by place) */
  function compIn(l, counts, plain) {
    const parts = [];
    ['h', 't', 'o'].forEach((k) => {
      const txt = counts[k] + ' ' + placeIn(l, k, counts[k]);
      if (counts[k]) parts.push(plain ? txt : '<span class="pv ' + k + '">' + txt + '</span>');
    });
    if (!parts.length) return '0';
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    return parts.join(', ') + (l === 'vi' ? ' và ' : ' and ') + last;
  }
  function comp(counts) { return compIn(lang, counts, false); }
  function setLang(l) { lang = l; try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ } }
  function getLang() { return lang; }

  global.I18N = { t, place, comp, compIn, setLang, getLang, D };
})(window);
