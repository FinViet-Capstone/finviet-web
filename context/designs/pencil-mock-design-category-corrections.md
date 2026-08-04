# FinViet Admin — Category Correction Log Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers the **Category Correction Log**
(Feature E) — a read-only, paginated audit log of every time a customer overrode the
AI's suggested category on a transaction. It's a feedback signal for improving the AI
categorization prompt over time — a page for humans reading patterns, not an editable
moderation queue. No CRUD, no destructive actions.

## Users
- **System Administrator** — scans this log to spot where the AI categorizer is
  guessing wrong most often (e.g. one category being corrected repeatedly), filters by
  date range or category to narrow that pattern-finding.

## Screens to design
1. **Category Correction Log — list view** — filter bar + paginated table
2. **Correction detail modal** — read-only, triggered by clicking a row

### List view
- **Filter bar**: date range picker, category dropdown (filter by corrected-to
  category) — no search-by-customer, this is a pattern-reading tool not a lookup tool
- **Table columns**: Mô tả giao dịch, AI đề xuất (original guess, muted/gray text),
  → , Danh mục đã sửa (corrected, in the category's own badge color), Khách hàng
  (email), Thời gian
- No row actions — clicking a row opens the detail modal, nothing else

### Correction detail modal
Read-only, triggered by clicking a row.
- Shows: transaction description, amount (if available), AI's original guess vs. the
  corrected category side by side (visually connected with an arrow, same layout as
  the table row but larger), customer email, corrected date
- Single button: `Đóng` — no edit/save affordance anywhere in this modal, reinforcing
  that this screen is observation-only

## Design Principles
- Same visual language as Overview/Users/System Configuration — professional, light
  theme, desktop-first, Vietnamese-first copy
- Visually communicate "this is read-only" — no primary-colored action buttons in the
  table rows, no add/edit/delete affordances anywhere on the page
- The AI-guess → corrected-category arrow is the visual focal point of each row, since
  that comparison is the whole point of the screen

## Layout
Filter bar + table:

```
┌─────────────────────────────────────────────────────────────┐
│  Sửa danh mục AI                                             │
│  [ 📅 30 ngày qua ▾ ]  [ Danh mục: Tất cả ▾ ]                │
├─────────────────────────────────────────────────────────────┤
│  Mô tả GD         AI đề xuất      →   Đã sửa       KH        Thời gian│
│  Highlands Coffee  Ăn uống        →   Cà phê       a@mail.com 2 giờ trước│
│  Grab Bike         Di chuyển      →   Giải trí     b@mail.com Hôm qua│
│  ...                                                          │
├─────────────────────────────────────────────────────────────┤
│                          ‹ 1 2 3 … 18 ›                       │
└─────────────────────────────────────────────────────────────┘
```

Detail modal (read-only):

```
        ┌───────────────────────────────┐
        │  Chi tiết sửa danh mục      ✕ │
        │                                │
        │  Highlands Coffee               │
        │  120,000₫                      │
        │                                │
        │  Ăn uống  →  Cà phê             │
        │  (AI đề xuất)  (đã sửa)         │
        │                                │
        │  Khách hàng: a@mail.com        │
        │  Thời gian: 14:32, 03/08/2026  │
        │                                │
        │                       [ Đóng ] │
        └───────────────────────────────┘
```

## Color Tokens
Reused from Overview/Users/System Configuration:
- Background `#f8fafc` · Surface `#ffffff` · Border `#e2e8f0`
- Text primary `#0f172a` · Text secondary `#64748b`
- Primary accent `#2563eb` (used sparingly here — mainly the arrow/connector)

New for this screen:
- AI-guess text: muted, text secondary `#64748b`, no badge — visually "less final"
  than the corrected category
- Corrected-category badge: inherits that category's own catalog color (from System
  Configuration's Danh mục tab) — ties the two screens together conceptually

## Icon Mapping (Lucide)
- Date range filter → `Calendar`
- Category filter → `Filter`
- AI-guess → corrected connector → `ArrowRight`
- Modal close → `X`

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Full filter bar + table |
| Below 1024px | Out of scope — desktop-only, same as other screens |

## Micro-interactions
- Row hover: subtle background tint (signals clickable-for-detail, not clickable-for-
  action)
- Modal fade + scale-in, 150–200ms, matching other screens
- No toast — nothing is ever saved on this screen
