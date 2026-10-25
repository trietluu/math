# Math Practice · Học Toán

**https://trietluu.github.io/math/**

[Tiếng Việt](#tiếng-việt) · [English](#english)

---

## Tiếng Việt

Bộ app luyện Toán tiểu học, chạy ngay trên trình duyệt (máy tính, iPad, điện thoại). Mỗi app dạy theo thứ tự **hiểu trước, làm sau**: trẻ thấy bằng hình ảnh vì sao một phép tính đúng, rồi mới luyện các bước.

- Miễn phí, không cần tài khoản, không quảng cáo.
- Không thu thập dữ liệu. Tiến độ chỉ lưu trong trình duyệt của từng thiết bị.
- Có tiếng Việt và tiếng Anh (nút VI/EN ở góc phải).
- Chữ hiển thị cho trẻ viết bằng câu ngắn, dễ hiểu. Phần cài đặt, báo cáo và hướng dẫn dành cho người lớn.

### Các app

| Chủ đề | App | Thư mục | Mã bài |
|---|---|---|---|
| Nhân và chia | [Bảng cửu chương](https://trietluu.github.io/math/tables/) | [`tables/`](tables/) | – |
| Nhân và chia | [Phép chia Bus stop](https://trietluu.github.io/math/division/) | [`division/`](division/) | OF3-3F |

**Mã bài** (ví dụ `OF3-3F`) là mã tra cứu nhanh cho người dạy. Mọi bài tập và lời giải thích trong app đều do dự án tự viết. Mỗi app có README riêng mô tả chi tiết.

### Cách dùng

Mở link ở trên. Trên iPad: Safari → Share → *Add to Home Screen* để có biểu tượng như app.
Chạy offline: tải repo về rồi mở `index.html`.

### Đóng góp

Mọi người đều có thể góp ý và đóng góp:
- Báo lỗi hoặc đề xuất ý tưởng: mở một *Issue*.
- Sửa lỗi, thêm app: *fork* repo, sửa, rồi mở *Pull Request*. Mỗi Pull Request nên làm một việc.

Khi thêm app mới:
1. Tạo một thư mục mới ở gốc repo, tên tiếng Anh, chữ thường (ví dụ `fractions/`), có `index.html` và `README.md` song ngữ.
2. Dùng `shared/common.css` cho giao diện chung.
3. Chỉ dùng đường dẫn tương đối, vì trang nằm dưới `/math/`. Link bắt đầu bằng `/` sẽ hỏng.
4. Khoá lưu trong `localStorage` phải có tiền tố riêng của app (ví dụ `frac_…`). Ngôn ngữ dùng chung khoá `math_lang`.
5. Có cả VI và EN. Chữ cho trẻ thì ngắn và dễ; chữ cho người lớn thì để ở cài đặt, báo cáo hoặc phần hướng dẫn.
6. Không chép nguyên văn nội dung, hình ảnh hay tên sách giáo khoa. Tự viết bài tập và lời giải thích; nếu cần, chỉ ghi mã bài.
7. Thêm một thẻ vào `index.html` (đúng chủ đề, có mã bài nếu có) và một dòng vào bảng ở trên.
8. Chỉ HTML, CSS, JavaScript thuần: không backend, không bước build, không thư viện ngoài.

### Cấu trúc

```
index.html     trang chủ: danh sách app theo chủ đề
shared/        giao diện dùng chung
tables/        Bảng cửu chương
division/      Phép chia Bus stop
.nojekyll      để GitHub Pages phục vụ file nguyên dạng
LICENSE        giấy phép MIT
```

### Giấy phép

[MIT](LICENSE): được dùng, sửa, chia sẻ và dùng cho mục đích thương mại, miễn giữ lại thông báo bản quyền và giấy phép.

---

## English

A set of primary-school maths apps that run in any browser (computer, iPad, phone). Each app teaches **understanding first, steps second**: children see with pictures why a method works before practising the steps.

- Free, no account, no ads.
- No data collection. Progress is stored only in each device's browser.
- Vietnamese and English (VI/EN switch in the top-right corner).
- Text shown to children uses short, simple sentences. Settings, reports and guides are written for adults.

### Apps

| Topic | App | Folder | Unit code |
|---|---|---|---|
| Times and divide | [Times tables](https://trietluu.github.io/math/tables/) | [`tables/`](tables/) | – |
| Times and divide | [Bus stop division](https://trietluu.github.io/math/division/) | [`division/`](division/) | OF3-3F |

A **unit code** (for example `OF3-3F`) is a quick reference for teachers and parents. All exercises and explanations in the apps are original to this project. Each app has its own README with details.

### How to use

Open the link above. On an iPad: Safari → Share → *Add to Home Screen* for an app icon.
Offline: download the repository and open `index.html`.

### Contributing

Everyone is welcome to give feedback and contribute:
- Bugs and ideas: open an *Issue*.
- Fixes and new apps: *fork* the repository, make your change, and open a *Pull Request*. Keep each Pull Request to one change.

When adding a new app:
1. Create a new top-level folder with a lowercase English name (for example `fractions/`) containing `index.html` and a bilingual `README.md`.
2. Use `shared/common.css` for the common look.
3. Use relative paths only, because the site lives under `/math/`. Links starting with `/` will break.
4. Prefix every `localStorage` key with the app's own prefix (for example `frac_…`). The language choice uses the shared key `math_lang`.
5. Provide both VI and EN. Child-facing text is short and simple; adult-facing text belongs in settings, reports or the guide.
6. Do not copy textbook text, pictures or titles. Write your own exercises and explanations; if needed, give only the unit code.
7. Add a card to `index.html` (under the right topic, with the unit code if any) and a row to the table above.
8. Plain HTML, CSS and JavaScript only: no backend, no build step, no external libraries.

### Structure

```
index.html     home page: apps grouped by topic
shared/        shared styles
tables/        Times tables
division/      Bus stop division
.nojekyll      makes GitHub Pages serve files as they are
LICENSE        MIT licence
```

### License

[MIT](LICENSE): you may use, modify, share and use commercially, as long as the copyright and licence notice are kept.
