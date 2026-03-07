import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const key = authHeader.slice(7);
  const result = await db
    .select({ id: apiKey.id })
    .from(apiKey)
    .where(eq(apiKey.key, key))
    .limit(1);

  return result.length > 0;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
