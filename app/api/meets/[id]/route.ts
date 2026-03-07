import { db } from "@/db";
import { meet } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateApiKey, unauthorized, badRequest } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await validateApiKey(request))) return unauthorized();

  const { id } = await params;
  const [result] = await db.select().from(meet).where(eq(meet.id, id));

  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await validateApiKey(request))) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const { resolveUrl, showContactPage, meetingTime, name, notes, slug } = body;

  if (!resolveUrl) return badRequest("resolveUrl is required");
  if (!meetingTime) return badRequest("meetingTime is required");

  const [existing] = await db.select().from(meet).where(eq(meet.id, id));
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(meet)
    .set({
      slug: slug || null,
      name: name || null,
      notes: notes || null,
      resolveUrl,
      showContactPage: showContactPage ?? false,
      meetingTime: new Date(meetingTime),
    })
    .where(eq(meet.id, id));

  const [updated] = await db.select().from(meet).where(eq(meet.id, id));
  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await validateApiKey(request))) return unauthorized();

  const { id } = await params;
  const [existing] = await db.select().from(meet).where(eq(meet.id, id));

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(meet).where(eq(meet.id, id));
  return new Response(null, { status: 204 });
}
