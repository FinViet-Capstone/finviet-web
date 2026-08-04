# FinViet Admin — Announcements Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers **Announcements** (Feature G) — where
an admin composes and sends a broadcast notification that lands in customers'
in-app notification centers. The highest-blast-radius action in the whole admin tool
(can reach every customer at once), so the send flow needs a deliberate, hard-to-
misclick confirmation step.

## Users
- **System Administrator** — composes a title/body, chooses a target audience,
  previews how it'll render on the mobile app, then sends it — and can look back at
  what's already been sent.

## Screens to design
1. **Announcements — compose + history view** — single page, compose panel above a
   history table
2. **Preview modal** — triggered by `Xem trước`
3. **Send confirmation modal** — triggered by `Gửi`

### Compose panel
- Title field (Tiêu đề), body textarea (Nội dung), target selector (Đối tượng: Tất cả
  người dùng / segment — segment options shown as disabled/"sắp ra mắt" since the
  segment targeting model is still TBD per the spec, only "Tất cả người dùng" is a
  real selectable option for this mockup)
- Character count under the body textarea
- Two buttons, right-aligned: `Xem trước` (secondary) and `Gửi` (primary)

### Preview modal
Triggered by `Xem trước`. Read-only — no send action inside this modal, closing it
returns to the compose panel unchanged.
- Renders the announcement inside a phone-frame mockup, styled like the mobile app's
  notification center: app icon, title, body, timestamp ("Vừa xong")
- Single button: `Đóng`

### Send confirmation modal
Triggered by `Gửi`. The one truly destructive-weight action on this screen — it can't
be undone once sent.
- Title: "Gửi thông báo?"
- Body: "Gửi thông báo này đến [N] người dùng? Hành động này không thể hoàn tác."
  ([N] = live count of the target audience, e.g. "12,480")
- Buttons: `Hủy` (secondary) / `Gửi` (destructive-styled, red) — deliberately styled
  like a destructive action even though it's not a delete, because of its reach

### History table (below compose panel)
- Columns: Tiêu đề, Đối tượng, Số người nhận, Thời gian gửi
- No row actions — announcements aren't editable once sent, this is a record only

## Design Principles
- Same visual language as other screens — professional, light theme, desktop-first,
  Vietnamese-first copy
- Compose and history are on one page (not tabs) — the history table is short and acts
  as a lightweight audit trail right below the action that creates new rows in it
- The send button is the single highest-stakes control in the app — give the
  confirmation modal a stronger visual warning treatment than any other modal
  (destructive red, explicit "không thể hoàn tác" language)

## Layout
Compose panel + history table:

```
┌─────────────────────────────────────────────────────────────┐
│  Thông báo                                                   │
├─────────────────────────────────────────────────────────────┤
│  Tiêu đề        [____________________________________]      │
│  Nội dung       [____________________________________]      │
│                 [____________________________________]      │
│                                              120/500 ký tự   │
│  Đối tượng      [● Tất cả người dùng  ○ Phân khúc (sắp ra mắt)]│
│                                                                │
│                              [ Xem trước ]  [ Gửi ]           │
├─────────────────────────────────────────────────────────────┤
│  Lịch sử thông báo                                            │
│  Tiêu đề              Đối tượng   Số người nhận  Thời gian    │
│  Cập nhật tính năng   Tất cả      12,102         02/08/2026   │
│  Bảo trì hệ thống     Tất cả      11,980         20/07/2026   │
└─────────────────────────────────────────────────────────────┘
```

Send confirmation modal:

```
        ┌───────────────────────────────┐
        │  Gửi thông báo?              ✕ │
        │                                │
        │  Gửi thông báo này đến 12,480  │
        │  người dùng? Hành động này     │
        │  không thể hoàn tác.           │
        │                                │
        │              [ Hủy ] [ Gửi ]   │
        └───────────────────────────────┘
```

## Color Tokens
Reused from other screens:
- Background `#f8fafc` · Surface `#ffffff` · Border `#e2e8f0`
- Text primary `#0f172a` · Text secondary `#64748b`
- Primary accent `#2563eb`
- Destructive `#ef4444` (send confirm button — reused destructive tone despite not
  being a delete, to signal irreversibility)

## Icon Mapping (Lucide)
- Compose target selector → `Users` (Tất cả), `Filter` (Phân khúc, disabled)
- Preview button → `Eye`
- Send button → `Send`
- History table (implicit, no icon needed — plain table)

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Full compose panel + history table |
| Below 1024px | Out of scope — desktop-only, same as other screens |

## Micro-interactions
- Character counter turns amber near the limit, red if exceeded (visual only)
- Modal fade + scale-in, 150–200ms, matching other screens
- Success toast after confirming send: "Đã gửi thông báo đến 12,480 người dùng" — the
  new row also appears at the top of the history table
