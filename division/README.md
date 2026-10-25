# Phép chia Bus stop · Bus stop division

**https://trietluu.github.io/math/division/** · Mã bài / Unit code: **OF3-3F**

[Tiếng Việt](#tiếng-việt) · [English](#english)

---

## Tiếng Việt

Dạy phép chia số có 2 hoặc 3 chữ số cho số có 1 chữ số, theo kiểu "bến xe buýt" (*bus stop*). Trẻ hiểu **vì sao** phải đổi chục dư thành đơn vị trước, rồi mới học các bước viết.

### Ba bước học

| Tab | Trẻ làm gì |
|---|---|
| **1. Chia khối** | Xem khối trăm, chục, đơn vị được chia đều vào các nhóm. Chục dư "vỡ" thành 10 khối đơn vị. Cuối bài, các nhóm gộp lại để thử bằng phép nhân. Bật *Cậu đoán trước* để trẻ trả lời từng bước trước khi khối chuyển động. |
| **2. Khối và số** | Khối và phép viết chạy song song. Mỗi con số viết ra được tô sáng và giải thích nó là khối nào. |
| **3. Tới lượt cậu** | Trẻ điền từng ô. Sai thì có gợi ý theo đúng lỗi, ví dụ lấy trừ thay cho chia, viết nhầm số đã chia, hay quên số dư khi hạ xuống. Sai hai lần có nút *Xem bằng khối*, sai ba lần app hiện đáp án. |

### Mức bài

2 chữ số không phải đổi → có đổi (như sách) → có dư → 3 chữ số → chữ số đầu nhỏ hơn số chia → kết quả có số 0 → 3 chữ số có dư.
Nút *Bài OF3-3F* có ví dụ 56 ÷ 4 và 6 bài luyện của bài OF3-3F. *Tự nhập* nhận bài bất kỳ từ 10 đến 999, chia cho 2 đến 9.

### Tuỳ chọn

- **Cách viết:** *Dài* (nhân, trừ, hạ xuống, có mũi tên và màu theo hàng) hoặc *Ngắn* (ghi số dư nhỏ, như trong sách). Nên chọn giống cách cô dạy ở lớp.
- **Hiện bảng nhân:** bảng nhân của số chia hiện bên cạnh. Tắt khi trẻ đã quen.
- **Số chia:** chọn các số chia dùng cho bài ngẫu nhiên.
- **Hướng dẫn cho người lớn:** ở cuối trang app.

### File

```
index.html    giao diện
engine.js     tính toán từng bước, sinh bài theo mức
blocks.js     vẽ và chuyển động khối base-10 (SVG)
busstop.js    vẽ phép chia (dạng dài / ngắn), ô nhập
i18n.js       toàn bộ chữ hiển thị VI/EN
app.js        ba tab, gợi ý theo lỗi, thống kê
```

Lưu trong trình duyệt: các khoá `div_…` và `math_lang`.

---

## English

Teaches dividing a 2- or 3-digit number by a 1-digit number with the "bus stop" layout. Children first understand **why** a leftover ten is exchanged for ones, then learn the written steps.

### Three steps

| Tab | What the child does |
|---|---|
| **1. Share blocks** | Watch hundreds, tens and ones being shared equally into groups. A leftover ten "breaks" into 10 ones. At the end the groups are put back together to check by multiplying. Turn on *Guess first* so the child answers each step before the blocks move. |
| **2. Blocks and numbers** | Blocks and the written sum move together. Each written number is highlighted and explained in terms of the blocks. |
| **3. Your turn** | The child fills in each box. Hints target the actual mistake, such as subtracting instead of dividing, writing the wrong "shared out" number, or forgetting the leftover when bringing down. After two wrong tries a *Show blocks* button appears; after three the answer is shown. |

### Levels

2 digits no exchange → with exchange (as in the book) → with remainder → 3 digits → first digit smaller than the divisor → zero in the answer → 3 digits with remainder.
*Unit OF3-3F* has the 56 ÷ 4 example and the 6 practice sums of unit OF3-3F. *Type your own* accepts any number from 10 to 999 divided by 2 to 9.

### Options

- **How to write:** *Long* (times, take away, bring down, with arrows and place-value colours) or *Short* (small carried digits, as in the book). Pick the one used at school.
- **Show times table:** the divisor's times table is shown alongside. Turn it off once the child is confident.
- **Divide by:** which divisors random sums use.
- **Guide for parents and teachers:** at the bottom of the app page.

### Files

```
index.html    page layout
engine.js     step-by-step calculation, sums by level
blocks.js     base-10 block drawing and animation (SVG)
busstop.js    written layout (long / short), input boxes
i18n.js       all VI/EN text
app.js        the three tabs, mistake-specific hints, statistics
```

Browser storage: keys `div_…` and `math_lang`.
