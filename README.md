# 📝 Daily Checklist - Ứng dụng quản lý công việc hiện đại

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Một ứng dụng web quản lý công việc hàng ngày với thiết kế UI/UX hiện đại, áp dụng các xu hướng 2025.

## ✨ Tính năng

### 🎨 UI/UX Hiện đại
- **Glassmorphism Design** - Hiệu ứng kính mờ đẹp mắt
- **Dark Mode** - Tự động theo hệ thống hoặc tùy chỉnh thủ công
- **Smooth Animations** - Chuyển động mượt mà, tự nhiên
- **Responsive Design** - Tương thích mọi thiết bị

### 🚀 Chức năng
- ✅ Thêm, xóa, hoàn thành công việc
- 🔍 Lọc công việc (Tất cả / Đang làm / Hoàn thành)
- 📊 Thống kê realtime
- 💾 Tự động lưu với LocalStorage
- ⌨️ Phím tắt thông minh
- 🎯 Empty state đẹp mắt

## 🛠️ Công nghệ sử dụng

### Frontend Stack
- **HTML5** - Semantic markup
- **CSS3** - Modern CSS với Variables, Grid, Flexbox
- **Vanilla JavaScript** - ES6+, không cần framework

### Design Principles
- Mobile-first approach
- Accessibility (ARIA labels)
- Performance optimization
- Clean & maintainable code

## 📁 Cấu trúc dự án

```
daily-checklist/
├── index.html      # HTML chính
├── styles.css      # Tất cả styles (CSS Variables, Glassmorphism)
├── app.js          # Logic ứng dụng (State management, LocalStorage)
└── README.md       # Tài liệu
```

## 🚦 Cách sử dụng

### 1. Khởi động ứng dụng

Mở file `index.html` bằng trình duyệt web hiện đại:

```bash
# Cách 1: Mở trực tiếp
open index.html

# Cách 2: Sử dụng Live Server (recommended)
# Cài VS Code extension "Live Server"
# Right click index.html -> Open with Live Server

# Cách 3: Python HTTP Server
python -m http.server 8000
# Truy cập: http://localhost:8000
```

### 2. Thêm công việc mới

1. Nhập tên công việc vào ô input
2. Nhấn nút "Thêm" hoặc phím Enter
3. Công việc sẽ xuất hiện ở danh sách

### 3. Quản lý công việc

- **Hoàn thành**: Click vào checkbox
- **Xóa**: Click nút "Xóa"
- **Lọc**: Chọn tab "Tất cả", "Đang làm", hoặc "Hoàn thành"
- **Xóa hàng loạt**: Click "Xóa đã hoàn thành"

### 4. Phím tắt

| Phím | Chức năng |
|------|-----------|
| `Ctrl/Cmd + K` | Focus vào ô nhập |
| `Escape` | Xóa và thoát khỏi ô nhập |
| `Enter` | Thêm công việc |

## 🎨 Tùy chỉnh Theme

### Dark Mode
Click vào icon 🌙/☀️ ở góc phải header để chuyển đổi theme.

### Tùy chỉnh màu sắc

Mở file `styles.css` và chỉnh sửa CSS Variables:

```css
:root {
    --color-primary: #6366f1;     /* Màu chính */
    --color-success: #10b981;     /* Màu thành công */
    --color-danger: #ef4444;      /* Màu xóa */
    --bg-gradient-1: #667eea;     /* Gradient 1 */
    --bg-gradient-2: #764ba2;     /* Gradient 2 */
}
```

## 💾 Lưu trữ dữ liệu

Ứng dụng sử dụng **LocalStorage** để lưu:
- Danh sách công việc
- Trạng thái hoàn thành
- Theme preference (Dark/Light)

**Lưu ý**: Dữ liệu được lưu trên trình duyệt, không đồng bộ giữa các thiết bị.

## 🌐 Tương thích trình duyệt

| Trình duyệt | Version |
|-------------|---------|
| Chrome | 90+ ✅ |
| Firefox | 88+ ✅ |
| Safari | 14+ ✅ |
| Edge | 90+ ✅ |
| Opera | 76+ ✅ |

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

## 🔧 Development

### Yêu cầu
- Trình duyệt web hiện đại
- Editor (VS Code recommended)

### Local Development
```bash
# Clone hoặc download dự án
git clone <repo-url>

# Mở bằng VS Code
code .

# Sử dụng Live Server để phát triển
```

## 🚀 Deployment

### GitHub Pages
```bash
# Push code lên GitHub
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Enable GitHub Pages trong Settings
```

### Netlify / Vercel
- Drag & drop folder vào Netlify/Vercel
- Hoặc connect GitHub repository

## 📈 Tính năng tương lai

- [ ] Cloud sync (Firebase/Supabase)
- [ ] Categories & Tags
- [ ] Due dates & Reminders
- [ ] Drag & drop reordering
- [ ] Export to PDF/CSV
- [ ] Collaboration features
- [ ] PWA support (Offline mode)
- [ ] Push notifications

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón!

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

**SPX Team**
- Website: [spx.com](https://spx.com)
- Email: contact@spx.com

## 🙏 Cảm ơn

- Inspiration từ các ứng dụng todo hiện đại
- Icons từ Unicode Emoji
- Design principles từ Material Design & Apple HIG

---

⭐ Nếu thấy hữu ích, hãy cho dự án một star nhé!

**Made with ❤️ by SPX | © 2025 Daily Checklist**
