# FinViet Admin — Users Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers the **Users screen** — the searchable,
filterable customer list an admin uses to check on individual accounts and take
account-level actions (lock/unlock, trigger a password reset) without touching the
raw database. Same visual language as the already-built Overview screen — this is a
continuation of that system, not a new style.

## Users
- **System Administrator** — the only actor. Comes to this screen to find a specific
  customer (by name or email), filter down to active or inactive accounts, sanity-check
  an account's activity (transaction/wallet counts) before acting on it, and lock,
  unlock, or trigger a password reset for that account.

## Screens to design
1. **Users — list view** — toolbar + paginated table
2. **Lock/unlock confirmation modal** — triggered from a row's lock toggle
3. **Password reset confirmation modal** — triggered from a row's reset action

### List view
- **Toolbar**: search input (placeholder "Tìm theo tên hoặc email"), status filter
  dropdown (Tất cả / Hoạt động / Không hoạt động)
- **Table columns**: Tên, Email, Trạng thái (status badge), Ngày tạo, Tổng giao dịch,
  Tổng ví, Gói (Free/Premium badge)
- **Row actions** (right-aligned icon buttons): `Khóa`/`Mở khóa` toggle, `Đặt lại mật khẩu`
- **Pagination footer**: page numbers + rows-per-page

### Lock/unlock confirmation modal
Triggered by clicking a row's lock toggle.
- Title: "Khóa tài khoản?"
- Body: "Khóa tài khoản [email]? Người dùng sẽ không thể đăng nhập."
- Buttons: `Hủy` (secondary) / `Xác nhận` (destructive, red)
- Unlock variant swaps copy to "Mở khóa tài khoản [email]?" with a neutral (non-red)
  confirm button — unlocking isn't destructive

### Password reset confirmation modal
Triggered by clicking a row's `Đặt lại mật khẩu` action.
- Title: "Đặt lại mật khẩu?"
- Body: "Gửi email đặt lại mật khẩu cho [email]?"
- Buttons: `Hủy` (secondary) / `Gửi` (primary)

*Could extend to*: a read-only detail drawer on row click showing the fuller
per-customer summary — not required for this pass, noted for later.

## Design Principles
- Same visual language as Overview — professional, data-forward, light theme,
  desktop-first, Vietnamese-first copy
- Table is the primary surface — dense but scannable, status conveyed by color badge
  not just text
- Destructive actions (lock) are visually distinct from neutral ones (unlock, reset)

## Layout
Toolbar + table:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Tìm theo tên hoặc email          [Trạng thái: Tất cả ▾]  │
├─────────────────────────────────────────────────────────────┤
│  Tên          Email          Trạng thái  Ngày tạo  GD  Ví  Gói  ⚙  │
├─────────────────────────────────────────────────────────────┤
│  Nguyễn Văn A a@mail.com     ● Hoạt động  01/03/25  42  3  Free  🔒 🔑│
│  Trần Thị B   b@mail.com     ● Khóa       15/02/25  12  1  Premium🔓 🔑│
│  ...                                                          │
├─────────────────────────────────────────────────────────────┤
│                          ‹ 1 2 3 … 24 ›                       │
└─────────────────────────────────────────────────────────────┘
```

Modal overlay anatomy (centered, dims background):

```
        ┌───────────────────────────────┐
        │  Khóa tài khoản?            ✕ │
        │                                │
        │  Khóa tài khoản a@mail.com?    │
        │  Người dùng sẽ không thể       │
        │  đăng nhập.                    │
        │                                │
        │            [ Hủy ] [ Xác nhận ]│
        └───────────────────────────────┘
```

## Color Tokens
Reused from the Overview brief:
- Background: `#f8fafc` · Surface/card: `#ffffff` · Border: `#e2e8f0`
- Text primary: `#0f172a` · Text secondary: `#64748b`
- Primary accent: `#2563eb`
- Active status: `#10b981` (green) · Inactive/locked status: `#94a3b8` (slate)
- Premium badge: `#6366f1` (indigo) · Free badge: `#cbd5e1` (light slate)

New for this screen:
- Destructive/danger (lock action + its modal confirm button): `#ef4444` (red)

## Icon Mapping (Lucide)
- Search bar → `Search`
- Status filter → `Filter`
- Lock row action → `Lock` (locked state) / `Unlock` (unlocked state)
- Password reset row action → `KeyRound`
- Modal close → `X`

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Full toolbar + table |
| Below 1024px | Out of scope — desktop-only, same as Overview |

## Micro-interactions
- Row hover: subtle background tint
- Modal: fade + scale-in on open, 150–200ms
- Success toast after confirming an action, e.g. "Đã khóa tài khoản a@mail.com" or
  "Đã gửi email đặt lại mật khẩu" — brief, auto-dismissing
- Search input debounces visually (no functional wiring, just the loading-state look)
