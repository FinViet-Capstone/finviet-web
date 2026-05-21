# FinViet Admin Dashboard

Bảng điều khiển quản trị viên của hệ thống FinViet — viết bằng **ReactJS + Vite + TypeScript + Tailwind CSS**.

## Tính năng

- **Tổng quan**: thống kê tổng người dùng, ví, giao dịch, lượt gọi AI và chi phí.
- **Quản lý người dùng**: tìm kiếm, lọc theo trạng thái, khoá/mở khoá, đặt lại mật khẩu, xoá tài khoản.
- **Phân tích**: biểu đồ DAU, giao dịch theo ngày, lưu lượng AI (7/14/30/90 ngày).
- **Nhật ký sửa danh mục**: xem các trường hợp người dùng ghi đè gợi ý của AI để cải thiện prompt.
- **Gửi thông báo**: phát thông báo qua FCM tới toàn bộ hoặc nhóm người dùng được chọn.

## Stack

- React 18 + Vite 5
- TypeScript
- Tailwind CSS (custom palette `brand` xanh emerald)
- React Router 6
- TanStack Query 5
- Recharts (biểu đồ)
- Axios (HTTP client + token refresh interceptor)
- React Hot Toast (notifications)
- Lucide React (icons)

## Yêu cầu

- Node.js 18+ và npm
- Backend FinViet đang chạy tại `http://localhost:8080` (mặc định)

## Cài đặt và chạy

```bash
cd admin
npm install
cp .env.example .env   # tuỳ chỉnh VITE_API_BASE_URL nếu cần
npm run dev
```

Mở trình duyệt: <http://localhost:5173>

## Đăng nhập

Tài khoản admin được seed sẵn ở backend:

- **Email**: `admin@finviet.local`
- **Mật khẩu**: `admin123`

## Cấu trúc thư mục

```
admin/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── .env.example
└── src/
    ├── main.tsx              # Entry point + providers (Query, Router, Auth, Toast)
    ├── App.tsx               # Routing config
    ├── index.css             # Tailwind + custom @layer components
    ├── api/
    │   ├── client.ts         # Axios instance + token refresh interceptor
    │   ├── auth.ts           # /auth/login, /auth/me, /auth/refresh
    │   ├── users.ts          # /admin/users CRUD
    │   └── analytics.ts      # /admin/analytics + announcements
    ├── auth/
    │   ├── AuthContext.tsx   # Provider + useAuth hook
    │   └── ProtectedRoute.tsx
    ├── components/
    │   ├── AppLayout.tsx
    │   ├── Sidebar.tsx
    │   ├── Header.tsx
    │   ├── PageHeader.tsx
    │   ├── StatCard.tsx
    │   └── DataTable.tsx
    ├── lib/
    │   └── format.ts         # formatVnd, formatNumber, formatDate, ...
    └── pages/
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── UsersPage.tsx
        ├── AnalyticsPage.tsx
        ├── CategoryCorrectionsPage.tsx
        └── AnnouncementsPage.tsx
```

## Build production

```bash
npm run build
npm run preview   # serve thư mục dist/ ở port 4173
```

## Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL của backend Spring Boot |

## Endpoints backend yêu cầu

Tất cả endpoint dưới `/api/v1/admin/**` chỉ truy cập được khi token có role `ADMIN`:

- `POST /api/v1/auth/login` · `GET /api/v1/auth/me` · `POST /api/v1/auth/refresh`
- `GET /api/v1/admin/users?page=&size=&query=&status=`
- `PATCH /api/v1/admin/users/{id}/active`
- `POST /api/v1/admin/users/{id}/reset-password`
- `DELETE /api/v1/admin/users/{id}`
- `GET /api/v1/admin/analytics/summary`
- `GET /api/v1/admin/analytics/dau?days=`
- `GET /api/v1/admin/analytics/transactions-daily?days=`
- `GET /api/v1/admin/analytics/ai-usage?days=`
- `GET /api/v1/admin/analytics/category-corrections?page=&size=`
- `POST /api/v1/admin/announcements`
