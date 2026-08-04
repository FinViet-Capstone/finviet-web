# FinViet Admin — System Configuration Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers **System Configuration** — where
admins author the system-wide defaults every customer's app experience is built on:
the category catalog, needs/wants/savings buckets, the AI Spending Score's weighting
formula, and the subscription plan catalog. Four sub-areas, one CRUD tab each (Feature
D). Same visual language as the already-built Overview and Users screens.

## Users
- **System Administrator** — the only actor. Edits global defaults that apply to every
  customer, not a single account — so these actions are inherently higher-stakes than
  the per-customer actions on the Users screen (e.g. changing scoring weights
  recalculates every customer's AI Spending Score).

## Screens to design
1. **System Configuration — tab shell**: 4 tabs — Danh mục / Nhóm ngân sách / Trọng số
   điểm / Gói dịch vụ
2. **Danh mục (Categories) tab** — table + Add/Edit modal + Delete confirmation modal
3. **Nhóm ngân sách (Buckets) tab** — simple list + Edit modal (locked buckets read-only)
4. **Trọng số điểm (Scoring Weights) tab** — table with inline weight inputs + Save
   confirmation modal
5. **Gói dịch vụ (Subscription Plans) tab** — card grid + Add/Edit modal + Delete
   confirmation modal

### Danh mục (Categories) tab
- Table columns: Icon, Tên danh mục, Tên (VI/EN), Loại (expense/income badge), Bucket
  mặc định (needs/wants/savings badge), Bắt buộc (yes/no), Thứ tự
- `+ Thêm danh mục` button (top-right) → **Add/Edit modal**: name, name VI, name EN,
  type select (Chi tiêu/Thu nhập), mandatory toggle, default bucket select, icon
  picker, color swatch picker, sort order number input. Same modal reused for `Sửa`.
- Row actions: `Sửa` (pencil), `Xóa` (trash) → **delete confirmation modal**: "Xóa
  danh mục [tên]? Giao dịch hiện có sẽ giữ nguyên nhưng không thể chọn danh mục này
  cho giao dịch mới." Hủy / Xóa (destructive)

### Nhóm ngân sách (Buckets) tab
- Simple 3-row list: Needs, Wants, Savings — each showing name VI/EN, color swatch,
  icon, sort order
- Row action: `Sửa` → edit modal (name VI/EN, color, icon, sort order) — no delete;
  a small lock icon replaces the edit action entirely on rows where `IsLocked` is true,
  with a tooltip "Nhóm này không thể chỉnh sửa"

### Trọng số điểm (Scoring Weights) tab
- Table columns: Mã tiêu chí, Tên tiêu chí, Trọng số tuần, Trọng số tháng, Phiên bản,
  Cập nhật lần cuối
- Weight cells are inline-editable number inputs (visually — click to edit in place)
- `Lưu thay đổi` button (appears once a value changes) → **save confirmation modal**:
  "Lưu trọng số mới? Thay đổi này ảnh hưởng đến điểm chi tiêu AI của tất cả người
  dùng và sẽ tạo phiên bản mới." Hủy / Lưu — this is the highest-stakes action on the
  whole screen, styled with a warning (amber) accent rather than plain primary

### Gói dịch vụ (Subscription Plans) tab
- Card grid (not table) — one card per plan: plan name, price, feature bullet list
  (parsed from FeaturesJson), `Sửa`/`Xóa` icons in the card header
- `+ Thêm gói` button → **Add/Edit modal**: code, name, price input, feature list
  editor (add/remove bullet rows)
- Delete → confirmation modal: "Xóa gói [tên]? Người dùng đang đăng ký gói này sẽ
  không bị ảnh hưởng, nhưng gói sẽ không còn hiển thị cho người dùng mới." Hủy / Xóa

## Design Principles
- Same visual language as Overview/Users — professional, light theme, desktop-first,
  Vietnamese-first copy
- These are *global default* edits, not per-customer actions — visually signal higher
  stakes on the two riskiest actions (category delete, scoring weight save) via
  warning/destructive accent colors, consistent with the confirmation-before-
  destructive-action convention already used on the Users screen
- Tabs share one page shell (header + tab bar); each tab's content area swaps below it

## Layout
Tab shell + per-tab content:

```
┌─────────────────────────────────────────────────────────────┐
│  Cấu hình hệ thống                                           │
│  [ Danh mục ] [ Nhóm ngân sách ] [ Trọng số điểm ] [ Gói ]   │
├─────────────────────────────────────────────────────────────┤
│                                        [+ Thêm danh mục]     │
│  🍔 Ăn uống   expense  Wants   không  1   ✏ 🗑                │
│  🚌 Di chuyển expense  Needs   không  2   ✏ 🗑                │
│  💰 Lương     income   —       không  1   ✏ 🗑                │
└─────────────────────────────────────────────────────────────┘
```

Add/Edit Category modal:

```
        ┌───────────────────────────────┐
        │  Thêm danh mục               ✕ │
        │  Tên danh mục   [____________] │
        │  Tên VI         [____________] │
        │  Tên EN         [____________] │
        │  Loại           [Chi tiêu ▾]   │
        │  Bucket mặc định[Wants ▾]      │
        │  Bắt buộc       [ ○ Có ● Không]│
        │  Icon           [🍔 ▾]  Màu [■]│
        │  Thứ tự         [1]            │
        │                                │
        │            [ Hủy ] [ Lưu ]     │
        └───────────────────────────────┘
```

## Color Tokens
Reused from Overview/Users:
- Background `#f8fafc` · Surface `#ffffff` · Border `#e2e8f0`
- Text primary `#0f172a` · Text secondary `#64748b`
- Primary accent `#2563eb`
- Destructive `#ef4444` (category/plan delete confirm buttons)

New for this screen:
- Warning/high-stakes accent (scoring weight save): `#f59e0b` (amber) — distinct from
  destructive red since it's not a delete, but still system-wide impact
- Expense badge: `#f97316` (orange) · Income badge: `#10b981` (green, reused active tone)

## Icon Mapping (Lucide)
- Tab bar: `Tag` (Danh mục), `Layers` (Nhóm ngân sách), `SlidersHorizontal` (Trọng số
  điểm), `CreditCard` (Gói dịch vụ)
- Row edit → `Pencil` · Row delete → `Trash2` · Locked bucket → `Lock`
- Add buttons → `Plus`

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Full tab shell + content |
| Below 1024px | Out of scope — desktop-only, same as other screens |

## Micro-interactions
- Tab switch: instant, no transition needed (content swap)
- Modal fade + scale-in, 150–200ms, matching Users screen
- Inline weight input shows a subtle "modified" dot next to changed cells before save
- Success toast after any save/delete, e.g. "Đã lưu danh mục", "Đã lưu trọng số mới"
