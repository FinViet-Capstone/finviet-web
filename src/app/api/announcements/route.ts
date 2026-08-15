import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listAnnouncements, sendAnnouncement } from "@/services/announcements";

const AnnouncementInputSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1).max(500),
  targetSegment: z.literal("all"),
});

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listAnnouncements();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = AnnouncementInputSchema.parse(await request.json());
    const data = await sendAnnouncement(body);
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
