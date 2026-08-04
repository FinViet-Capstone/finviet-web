# FinViet Admin — Login Screen Design Brief (for Pencil)

## Product
FinViet Admin is an internal-only web dashboard for FinViet, a Vietnamese
personal-finance mobile app. This brief covers **Admin Auth** (Feature A) — the
standalone entry point before any of the other screens. Credential check plus a
mandatory 2FA (TOTP) step on every login. No public sign-up, no "forgot password"
email link — admin accounts are seeded, and lost-password recovery falls to a
break-glass process outside this app, so the UI deliberately has no self-service
recovery link.

## Users
- **System Administrator** — the only actor, logging into a seeded account. Expects a
  standard username/password step immediately followed by a TOTP code step; already
  has an authenticator app enrolled (enrollment flow itself is out of scope for this
  mockup pass — this brief covers steady-state login only).

## Screens to design
1. **Login — credential step**
2. **Login — 2FA (TOTP) step**
3. **Error states** — invalid credentials, invalid TOTP code (shown inline on the
   relevant step, not separate screens)

### Credential step
- Centered card on a plain background (no sidebar — this screen exists outside the
  authenticated app shell)
- FinViet Admin logo/wordmark above the card
- Username field, password field (with show/hide toggle), `Đăng nhập` button
  (full-width, primary)
- No "Quên mật khẩu?" link — instead, small static text below the card: "Liên hệ quản
  trị viên khác nếu bạn không thể đăng nhập" (non-interactive, just informational)

### 2FA (TOTP) step
- Same centered-card layout, replaces the credential card after a successful password
  check
- Short instruction text: "Nhập mã 6 chữ số từ ứng dụng xác thực của bạn"
- 6-digit code input (segmented boxes, one digit per box, matching common TOTP input
  patterns), `Xác minh` button (full-width, primary)
- Small `← Quay lại` link to return to the credential step

### Error states (inline, not separate screens)
- Credential step: red inline banner above the form — "Tên đăng nhập hoặc mật khẩu
  không đúng" — fields get a red border
- 2FA step: same red inline banner pattern — "Mã xác thực không đúng" — code boxes get
  a red border and visually clear/reset

## Design Principles
- Same visual language as the rest of the app (light theme, same primary blue, same
  type scale) but a simpler, more centered composition — this is the one screen
  outside the sidebar shell
- Calm and minimal — no marketing copy, no illustration-heavy treatment; this is a
  back-office login, not a consumer app's onboarding
- The two-step flow (password → TOTP) should read as clearly sequential — the 2FA
  card should feel like "step 2 of the same action," not a separate destination

## Layout
Credential step:

```
┌─────────────────────────────────────────────────────────────┐
│                                                                 │
│                          🏛  FinViet Admin                     │
│                                                                 │
│                    ┌───────────────────────┐                  │
│                    │  Đăng nhập             │                  │
│                    │                        │                  │
│                    │  Tên đăng nhập         │                  │
│                    │  [__________________]  │                  │
│                    │  Mật khẩu         👁    │                  │
│                    │  [__________________]  │                  │
│                    │                        │                  │
│                    │  [     Đăng nhập     ] │                  │
│                    └───────────────────────┘                  │
│                                                                 │
│           Liên hệ quản trị viên khác nếu bạn không              │
│                     thể đăng nhập                              │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

2FA step:

```
┌─────────────────────────────────────────────────────────────┐
│                                                                 │
│                          🏛  FinViet Admin                     │
│                                                                 │
│                    ┌───────────────────────┐                  │
│                    │  Xác thực 2 lớp        │                  │
│                    │  Nhập mã 6 chữ số từ    │                  │
│                    │  ứng dụng xác thực     │                  │
│                    │                        │                  │
│                    │  [_] [_] [_] [_] [_] [_]│                  │
│                    │                        │                  │
│                    │  [     Xác minh      ] │                  │
│                    │  ← Quay lại            │                  │
│                    └───────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Color Tokens
Reused from other screens:
- Background `#f8fafc` · Surface/card `#ffffff` · Border `#e2e8f0`
- Text primary `#0f172a` · Text secondary `#64748b`
- Primary accent `#2563eb`
- Error/destructive `#ef4444` (invalid-credential and invalid-code states)

## Icon Mapping (Lucide)
- Password show/hide → `Eye` / `EyeOff`
- Back link on 2FA step → `ArrowLeft`
- Logo mark → `Landmark` (placeholder building/institution icon for "FinViet Admin")

## Responsive Behavior
| Viewport | Layout |
|---|---|
| Desktop (≥1024px) | Centered card, fixed max-width | 
| Below 1024px | Out of scope — desktop-only, same as other screens |

## Micro-interactions
- Card swap between credential → 2FA step: fade/slide transition, 150–200ms
- TOTP digit boxes auto-advance focus as each digit is typed (visual state to design:
  one box focused/active with accent border)
- Error banner: fades in above the form, fields shake subtly or just gain a red border
  (pick one — border alone is enough, keep it calm rather than jarring)
- Button shows a loading state (spinner replacing label) between submit and result —
  visual state only, no real request
