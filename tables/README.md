# Bảng cửu chương · Times tables

**https://trietluu.github.io/math/tables/**

[Tiếng Việt](#tiếng-việt) · [English](#english)

---

## Tiếng Việt

Học thuộc bảng nhân bằng mẹo và hình ảnh, rồi đố nhanh. App tự nhớ phép nào trẻ chưa thuộc để hỏi lại nhiều hơn.

### Các tab

| Tab | Dành cho | Nội dung |
|---|---|---|
| **Học** | trẻ | Mẹo nhớ từng bảng, hình chấm xếp hàng, dãy đếm thêm, và "nhân và chia là bạn" (3 × 4 = 12 ↔ 12 ÷ 3 = 4). |
| **Đố nhanh** | trẻ | Hỏi từng câu. Sai thì xem đáp án và gõ lại ngay. Khi đã khá, có thêm dạng `a × ? = c` và `c ÷ a = ?`. |
| **Chia có dư** | trẻ | "17 chia 5 được mấy, dư mấy?" Đây là câu trẻ phải tự trả lời ở mỗi cột của phép chia Bus stop. |
| **Báo cáo** | người lớn | Bản đồ màu theo từng phép tính, danh sách cần học thêm, mức thuộc từng bảng, các lượt gần đây. |
| **Cài đặt** | người lớn | Chọn bảng, nhân đến 10 hay 12, dạng câu hỏi, giới hạn thời gian, xuất/nhập tiến độ (JSON). |

### Cách app chọn câu hỏi

Mỗi phép tính có một "hộp" từ 0 đến 6 (phương pháp Leitner). Đúng và nhanh thì lên hộp, lâu mới hỏi lại. Sai hoặc hết giờ thì về hộp 0, hỏi lại sau vài câu. App chỉ thêm vài phép mới khi các phép đang học đã ổn, và thỉnh thoảng hỏi lại phép đã thuộc.

Mặc định: bảng ×2 đến ×6, nhân đến 10, không giới hạn thời gian (nên đổi sang 8 giây khi trẻ trả lời đúng gần hết).

Lưu trong trình duyệt: khoá `tt_v1`, `tt_tab` và `math_lang`.

---

## English

Learn the times tables with tricks and pictures, then take quick quizzes. The app remembers which facts the child still needs and asks them more often.

### Tabs

| Tab | For | What it does |
|---|---|---|
| **Learn** | child | Tips for each table, dot arrays, counting in steps, and "times and divide are friends" (3 × 4 = 12 ↔ 12 ÷ 3 = 4). |
| **Quick quiz** | child | One question at a time. A wrong answer shows the right one and the child types it again. Once a fact is going well, `a × ? = c` and `c ÷ a = ?` appear too. |
| **Remainders** | child | "17 divided by 5: how many, and how many left?" This is the question the child answers in every column of bus stop division. |
| **Report** | adult | Colour map of every fact, list of facts to practise, mastery by table, recent rounds. |
| **Settings** | adult | Tables, up to 10 or 12, question types, time limit, export/import progress (JSON). |

### How questions are chosen

Every fact sits in a "box" from 0 to 6 (Leitner method). Fast correct answers move it up so it comes back less often. Wrong or too slow sends it back to box 0 and it returns a few questions later. New facts are added only when the current ones are going well, and known facts come back now and then.

Defaults: ×2 to ×6, up to 10, no time limit (switch to 8 seconds once most answers are right).

Browser storage: keys `tt_v1`, `tt_tab` and `math_lang`.
