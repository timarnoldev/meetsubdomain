import { db } from "@/db";
import { calendarToken, meet } from "@/db/schema";
import { eq } from "drizzle-orm";

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const result = await db
    .select({ id: calendarToken.id })
    .from(calendarToken)
    .where(eq(calendarToken.token, token))
    .limit(1);

  if (result.length === 0) {
    return new Response("Unauthorized", { status: 401 });
  }

  const meets = await db
    .select()
    .from(meet)
    .orderBy(meet.meetingTime);

  const events = meets
    .map((m) => {
      const start = formatICSDate(new Date(m.meetingTime));
      // Default 1 hour duration
      const end = formatICSDate(
        new Date(new Date(m.meetingTime).getTime() + 60 * 60 * 1000),
      );
      const summary = escapeICS(m.name || `Meeting ${m.id}`);
      const description = m.notes ? escapeICS(m.notes) : "";
      const url = m.resolveUrl;

      const lines = [
        "BEGIN:VEVENT",
        `UID:${m.id}@meetsubdomain`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary}`,
      ];

      if (description) {
        lines.push(`DESCRIPTION:${description}`);
      }
      if (url) {
        lines.push(`URL:${url}`);
        lines.push(`LOCATION:${escapeICS(url)}`);
      }

      lines.push(
        `CREATED:${formatICSDate(new Date(m.createdAt))}`,
        "END:VEVENT",
      );

      return lines.join("\r\n");
    })
    .join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//meetsubdomain//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Meetings",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="meetings.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
