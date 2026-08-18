# Yêu cầu kỹ thuật gửi Backend Team — Tỷ lệ ngân sách mặc định hệ thống (UC-15)

**Từ:** FinViet Admin (frontend)
**Ngày:** 2026-08-18
**Đối chiếu với:** `origin/dev` (finviet-be)
**Liên quan:** UC-15 "Update Budget Selection Value" — *"Allows the admin to update the system's
default budget allocation ratio."*

## Hiện trạng — chưa có gì để nối, khác với 2 gap trước

Không giống Announcements/Category Corrections (chỉ thiếu API, dữ liệu đã có), UC-15 mô tả một
khái niệm **chưa tồn tại ở bất kỳ đâu trong backend**, kể cả trong schema:

- `Bucket` (bảng "Nhóm ngân sách" admin đang thấy — `GET`/`PATCH /api/buckets`,
  `[Authorize(Roles = "Admin")]`) chỉ có `Id, NameVi, NameEn, Color, Icon, SortOrder, IsLocked` —
  **không có cột tỷ lệ (%) nào**. `UpdateBucketRequest` cũng vậy.
- Tỷ lệ Needs/Wants/Savings thật ra nằm ở `Customer.NeedsPct/WantsPct/SavingsPct` — **cài đặt
  riêng của từng khách hàng**, khách tự đổi qua `POST /api/profile/income-allocation`
  (`[Authorize(Roles = "Customer")]`). Giá trị mặc định `50/30/20` chỉ là default cứng trên
  property C# (`Customer.cs`: `NeedsPct { get; set; } = 50`), **không đọc từ đâu cả** —
  `RegisterCommandHandler` tạo `Customer` mới không set field này, tự động ăn theo default.

→ Không có bảng lưu "tỷ lệ mặc định hệ thống" để admin đọc/sửa, và không có nơi nào code đọc lại
giá trị đó khi tạo khách hàng mới.

## Đề xuất thiết kế

**Thêm cột vào `Bucket`** thay vì tạo bảng mới — 3 dòng `Bucket` hiện có (needs/wants/savings)
đã đúng là đơn vị cần gắn % mặc định:

```sql
ALTER TABLE bucket ADD COLUMN default_pct numeric(5,2);
-- Seed: needs=50, wants=30, savings=20 (khớp giá trị default hiện có trên Customer)
```

**Mở rộng endpoint có sẵn** thay vì thêm endpoint mới:
- `PATCH /api/buckets/{id}` — `UpdateBucketRequest` thêm `DefaultPct` (nullable, optional).
- `GET /api/buckets` — `BucketResponse` thêm `DefaultPct` để admin UI đọc giá trị hiện tại.

Validate tổng 3 bucket phải = 100 — theo đúng pattern đã có ở Scoring Weights
(`ScoringCriteriaController`): **không cần validate atomic ở server** (3 lần PATCH độc lập không
có chỗ nào để server enforce tổng), frontend tự validate tổng = 100 trên tập đã merge trước khi
bắn PATCH, giống hệt cách `saveScoringCriteria` đang làm.

## Câu hỏi sản phẩm cần chốt trước khi làm (quan trọng hơn phần code)

1. **Đổi tỷ lệ mặc định có ảnh hưởng khách hàng đã tồn tại không?**
   - Khuyến nghị: **Không** — chỉ áp dụng cho khách hàng **mới đăng ký sau đó**. Khách cũ đã tự
     chọn/chỉnh tỷ lệ riêng qua app, âm thầm đổi tỷ lệ của họ khi admin sửa default hệ thống sẽ là
     hành vi bất ngờ, không mong muốn.
   - Nếu đúng vậy: `RegisterCommandHandler` cần sửa để đọc `Bucket.DefaultPct` (3 dòng) khi tạo
     `Customer` mới, thay vì ăn theo default cứng `50/30/20` trên property C#. Đây là điểm nối
     duy nhất khiến giá trị admin sửa thực sự có tác dụng — nếu bỏ qua bước này, sửa
     `Bucket.DefaultPct` sẽ không ảnh hưởng gì tới khách hàng mới cả, chỉ là con số hiển thị suông.
2. Có cần audit log (ai đổi, khi nào) như `AdminAuditLog` ở Feature A không, hay tái dùng cơ chế
   sẵn có nào khác?

## Tóm tắt

| Việc | Độ khó | Cần migration? |
|---|---|---|
| Thêm `default_pct` vào `Bucket` + seed 50/30/20 | Nhỏ | Có (1 cột + seed update) |
| Mở rộng `PATCH`/`GET /api/buckets` | Nhỏ | Không |
| Sửa `RegisterCommandHandler` đọc `Bucket.DefaultPct` khi tạo Customer mới | Nhỏ, nhưng **bắt buộc** để tính năng có tác dụng thật | Không |

Chỉ nên bắt đầu code sau khi chốt câu hỏi #1 — nếu chọn "có ảnh hưởng khách cũ", thiết kế sẽ khác
hẳn (cần chiến lược migrate dữ liệu hàng loạt, không chỉ đổi default cho khách mới).
