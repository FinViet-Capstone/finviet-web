# FinViet Admin — Overview Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. It gives a small team of trusted administrators
visibility into system-wide activity (customers, transactions, wallets, budgets,
subscriptions) that today is only visible by querying the database directly. This
brief covers the **Overview screen** — the page an admin lands on right after login:
a system-health summary, not a drill-down into any single customer. Reads as a
credible internal ops tool a finance team relies on daily — not a consumer app.

## Users
- **System Administrator** — the only actor in this system. Seeded account, no
  self-registration. Logs in once, then checks Overview regularly to answer
  "how many users do we have and are they active," "is transaction volume trending
  up," and "what's our free vs. premium split" at a glance, before drilling into
  other screens (Users, System Configuration, etc.) for anything actionable.

## Screens to design
1. **Overview** — sidebar nav shell + stat-card row (system health at a glance) +
   trend-chart row below (signups and transaction volume over time)

Sidebar nav items exist as part of the shell (Overview / Users / System
Configuration / Category Corrections / Knowledge Base / Announcements) but only the
**Overview** content area is designed in this pass — the rest are placeholders/labels
for later screens.

### Overview stats (stat-card row)
- Total customers
- Active vs. inactive customers (`Customer.IsActive` split)
- New customers (this period)
- Total transactions
- Total wallets
- Total budgets
- Free vs. premium subscription split

### Overview trends (chart row)
- Signups over time (line chart)
- Transaction volume over time (line or bar chart)

## Design Principles
- Clean, professional, data-forward — internal fintech back-office tool, not the
  mobile app's Gen Z-facing consumer styling
- **Light mode** — dense stat cards and charts read better on a light background for
  this kind of ops tool
- Vietnamese-first UI copy, matching the mobile app's language convention
- Desktop-first, dense information layout — no phone-form-factor constraint
- Generous but not excessive whitespace — this is a glance-and-act tool, not a
  marketing page

## Layout
Sidebar (fixed) + main content:

```
┌─────────────────────────────────────────────────────────────┐
│  FinViet Admin                                    🔍  👤     │
├──────────────┬──────────────────────────────────────────────┤
│  ▸ Tổng quan │  Tổng quan hệ thống                           │
│    Người dùng│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│    Cấu hình  │  │Tổng KH │ │Hoạt động│ │Giao dịch│ │Ví      │ │
│    hệ thống  │  │ 12,480 │ │ 11,203  │ │ 84,210  │ │ 15,902 │ │
│    Sửa danh  │  └────────┘ └────────┘ └────────┘ └────────┘ │
│    mục AI    │  ┌────────┐ ┌──────────────────┐             │
│    Kho tri   │  │Ngân sách│ │ Free / Premium   │             │
│    thức AI   │  │ 9,340  │ │ ▓▓▓▓▓▓▓░░░ 68/32%│             │
│    Thông báo │  └────────┘ └──────────────────┘             │
│              │                                                │
│              │  Người dùng mới theo thời gian                │
│              │  ┌──────────────────────────────────────┐    │
│              │  │        ╭─╮      ╭──╮                  │    │
│              │  │    ╭──╯  ╰──╮ ╭─╯   ╰─╮                │    │
│              │  └──────────────────────────────────────┘    │
│              │                                                │
│              │  Khối lượng giao dịch theo thời gian           │
│              │  ┌──────────────────────────────────────┐    │
│              │  │  ▂ ▄ ▆ █ ▅ ▃ ▆ █ ▇ ▄ ▂ ▅ ▇ █ ▆ ▃      │    │
│              │  └──────────────────────────────────────┘    │
└──────────────┴──────────────────────────────────────────────┘
```

## Color Tokens
Light theme:
- Background (app): `#f8fafc`
- Surface / card: `#ffffff`
- Border: `#e2e8f0`
- Text primary: `#0f172a`
- Text secondary: `#64748b`
- Primary accent (brand, active nav, links): `#2563eb`

Semantic tokens (the two categorical splits Overview reports on):
- Active customer: `#10b981` (green)
- Inactive / locked customer: `#94a3b8` (slate — neutral, not alarming; locking an
  account is an admin action, not an error state)
- Premium subscription: `#6366f1` (indigo)
- Free subscription: `#cbd5e1` (light slate)

## Icon Mapping (Lucide)
Sidebar nav:
- Tổng quan (Overview) → `LayoutDashboard`
- Người dùng (Users) → `Users`
- Cấu hình hệ thống (System Configuration) → `Settings`
- Sửa danh mục AI (Category Corrections) → `Wand2`
- Kho tri thức AI (Knowledge Base) → `BookOpen`
- Thông báo (Announcements) → `Megaphone`

Stat cards:
- Total customers → `Users`
- Active/inactive → `ToggleLeft`
- Total transactions → `ArrowLeftRight`
- Total wallets → `Wallet`
- Total budgets → `PiggyBank`
- Free/premium split → `Crown`

## Responsive Behavior
| Viewport | Sidebar | Layout |
|---|---|---|
| Desktop (≥1024px) | Fixed, always visible | Full sidebar + main content |
| Below 1024px | Not designed | Out of scope — FinViet Admin is desktop-only, no tablet/mobile breakpoints planned |

## Micro-interactions
- 150–200ms smooth transitions
- Hover state on stat cards (subtle elevation/border highlight)
- Skeleton loading placeholders for stat cards and charts while data loads
- Chart tooltips on hover (exact value + date)
- No toast notifications on this screen — Overview is read-only, no save or
  destructive actions here
