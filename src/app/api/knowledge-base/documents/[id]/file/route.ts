import { z } from "zod";
import { AdminSessionError, requireAdminSession } from "@/lib/auth";
import { HttpError } from "@/lib/http-error";
import { getDocumentFile } from "@/services/knowledge-base";

const IdSchema = z.string().uuid();

// Unlike the JSON Route Handlers, this one is loaded directly by the browser (the preview iframe
// and "Mở trong tab mới"), so failures render as a small readable page instead of a JSON envelope.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const id = IdSchema.parse((await params).id);
    const file = await getDocumentFile(id);
    return new Response(file.content, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return errorPage(err);
  }
}

function errorPage(err: unknown) {
  const status =
    err instanceof AdminSessionError ? 401 : err instanceof HttpError ? err.status : err instanceof z.ZodError ? 400 : 500;
  const message =
    status === 401
      ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : status === 404
        ? "Không tìm thấy file gốc của tài liệu này. Vui lòng tải lên lại tài liệu."
        : "Không thể tải file tài liệu. Vui lòng thử lại.";
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Không thể xem tài liệu</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;font-size:14px;color:#475569;background:#f8fafc;text-align:center;padding:24px;box-sizing:border-box">${message}</body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
