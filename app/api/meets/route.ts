import { db } from "@/db";
import { meet } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateApiKey, unauthorized, badRequest } from "@/lib/api-auth";

function generateMeetId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const part = () =>
    Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${part()}-${part()}`;
}

export async function GET(request: Request) {
  if (!(await validateApiKey(request))) return unauthorized();

  const meets = await db.select().from(meet).orderBy(meet.meetingTime);
  return Response.json(meets);
}

export async function POST(request: Request) {
  if (!(await validateApiKey(request))) return unauthorized();

  const body = await request.json();
  const { resolveUrl, showContactPage, meetingTime, name, notes, slug } = body;

  if (!resolveUrl) return badRequest("resolveUrl is required");
  if (!meetingTime) return badRequest("meetingTime is required");

  const parsedTime = new Date(meetingTime);
  if (isNaN(parsedTime.getTime())) {
    return badRequest("meetingTime must be a valid ISO 8601 date string (e.g. 2026-04-15T14:00:00Z or 2026-04-15T14:00:00+02:00)");
  }
  if (typeof meetingTime === "string" && !(/Z|[+-]\d{2}:\d{2}$/.test(meetingTime))) {
    return badRequest("meetingTime must include timezone info (e.g. 2026-04-15T14:00:00Z or 2026-04-15T14:00:00+02:00)");
  }

  const id = generateMeetId();
  await db.insert(meet).values({
    id,
    slug: slug || null,
    name: name || null,
    notes: notes || null,
    resolveUrl,
    showContactPage: showContactPage ?? false,
    meetingTime: parsedTime,
  });

  const [created] = await db.select().from(meet).where(eq(meet.id, id));
  return Response.json(created, { status: 201 });
}
