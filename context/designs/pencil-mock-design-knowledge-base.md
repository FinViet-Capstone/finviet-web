# FinViet Admin — AI Knowledge Base Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers **AI Knowledge Base Management**
(Feature F) — where an admin ingests global knowledge documents (PDFs) that become
visible to every customer's AI chat via retrieval. Simple screen: a document list plus
an upload flow.

## Users
- **System Administrator** — uploads a new PDF (e.g. an updated FAQ, product policy
  doc) so the AI chatbot can reference it, and can remove outdated documents.

## Screens to design
1. **Knowledge Base — list view** — document table + upload button
2. **Upload document modal** — file picker → progress state → success state
3. **Delete confirmation modal** — triggered from a row's delete action

### List view
- Table columns: Tiêu đề, Trạng thái (Đang xử lý/Sẵn sàng badge), Số đoạn (chunk
  count), Ngày tải lên
- `+ Tải lên tài liệu` button (top-right) → opens upload modal
- Row action: `Xóa` (trash icon) → delete confirmation modal

### Upload document modal
Three visual states in one modal (design all three as separate frames):
1. **Idle/input state**: drag-and-drop zone ("Kéo thả file PDF vào đây hoặc chọn file"),
   title text field, `Tải lên` button (disabled until both a file and title are set)
2. **Progress state**: file name + progress bar, `Đang tải lên...` label, upload
   cancelled/blocked from closing
3. **Success state**: checkmark icon, "Tải lên thành công", `Xong` button closes modal
   and returns to list (new row now visible with "Đang xử lý" status)

### Delete confirmation modal
Triggered by a row's `Xóa` action.
- Title: "Xóa tài liệu?"
- Body: "Xóa [tiêu đề]? Tài liệu sẽ không còn được AI sử dụng khi trả lời người dùng."
- Buttons: `Hủy` / `Xóa` (destructive)

## Design Principles
- Same visual language as other screens — professional, light theme, desktop-first,
  Vietnamese-first copy
- Upload is the primary action on this page — give it visual weight (prominent button,
  generous drop-zone in the modal) since it's the main reason an admin visits this
  screen
- Processing state must be visually distinct from ready (badge color + icon), since a
  newly uploaded doc isn't queryable by the AI until chunking finishes

## Layout
List view:

```
┌─────────────────────────────────────────────────────────────┐
│  Kho tri thức AI                    [+ Tải lên tài liệu]     │
├─────────────────────────────────────────────────────────────┤
│  Tiêu đề                    Trạng thái     Số đoạn  Ngày tải │
│  Chính sách bảo mật 2026    ● Sẵn sàng     42       01/07/25 │
│  FAQ Premium                ● Đang xử lý   —        Hôm nay  │
│  ...                                                   🗑     │
└─────────────────────────────────────────────────────────────┘
```

Upload modal — idle state:

```
        ┌───────────────────────────────┐
        │  Tải lên tài liệu            ✕ │
        │                                │
        │   ┌─────────────────────────┐  │
        │   │   📄  Kéo thả file PDF   │  │
        │   │   vào đây hoặc chọn file │  │
        │   └─────────────────────────┘  │
        │  Tiêu đề        [____________] │
        │                                │
        │            [ Hủy ] [ Tải lên ] │
        └───────────────────────────────┘
```

Upload modal — progress / success states (same frame, swapped content):

```
        ┌───────────────────────────────┐        ┌───────────────────────────────┐
        │  Đang tải lên...            ✕ │        │              ✓                │
        │  FAQ Premium.pdf               │        │      Tải lên thành công        │
        │  ▓▓▓▓▓▓▓▓░░░░░░  54%           │        │                                │
        │                                │        │                     [ Xong ]  │
        └───────────────────────────────┘        └───────────────────────────────┘
```

## Color Tokens
Reused from other screens:
- Background `#f8fafc` · Surface `#ffffff` · Border `#e2e8f0`
- Text primary `#0f172a` · Text secondary `#64748b`
- Primary accent `#2563eb`
- Destructive `#ef4444` (delete confirm)
- Ready status: `#10b981` (green, reused active tone)

New for this screen:
- Processing status: `#f59e0b` (amber, reused warning tone from System Configuration)

## Icon Mapping (Lucide)
- Upload button/drop-zone → `Upload` / `FileText`
- Row delete → `Trash2`
- Success state → `CheckCircle2`
- Modal close → `X`

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Full table + modal |
| Below 1024px | Out of scope — desktop-only, same as other screens |

## Micro-interactions
- Drag-over state on the drop-zone: border color shifts to primary accent
- Progress bar fills smoothly (visual only, no real upload)
- Success state auto-transitions the modal, then closes after `Xong` — no toast needed,
  the success state itself is the feedback
- Row hover: subtle background tint
