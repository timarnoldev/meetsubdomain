"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, account, meet, apiKey } from "@/db/schema";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { hashPassword } from "better-auth/crypto";

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getBaseUrl() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export async function getUsers() {
  await requireAuth();
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);

  return users;
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await requireAuth();

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create user";
    return { error: message };
  }
}

export async function changePassword(userId: string, newPassword: string) {
  await requireAuth();

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const hashed = await hashPassword(newPassword);

    await db
      .update(account)
      .set({ password: hashed })
      .where(eq(account.userId, userId));

    return { success: true };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to change password";
    return { error: message };
  }
}

function generateMeetId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const part = () =>
    Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${part()}-${part()}`;
}

export async function getMeets() {
  await requireAuth();
  return db.select().from(meet).orderBy(meet.meetingTime);
}

export async function createMeet(
  resolveUrl: string,
  showContactPage: boolean,
  meetingTime: string,
  name: string | null,
  notes: string | null,
  slug: string | null,
) {
  await requireAuth();

  if (!resolveUrl) {
    return { error: "Resolve URL is required" };
  }

  if (!meetingTime) {
    return { error: "Meeting time is required" };
  }

  try {
    const id = generateMeetId();
    await db.insert(meet).values({
      id,
      slug: slug || null,
      name: name || null,
      notes: notes || null,
      resolveUrl,
      showContactPage,
      meetingTime: new Date(meetingTime),
    });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create meet";
    return { error: message };
  }
}

export async function updateMeet(
  id: string,
  resolveUrl: string,
  showContactPage: boolean,
  meetingTime: string,
  name: string | null,
  notes: string | null,
  slug: string | null,
) {
  await requireAuth();

  if (!resolveUrl) {
    return { error: "Resolve URL is required" };
  }

  if (!meetingTime) {
    return { error: "Meeting time is required" };
  }

  try {
    await db
      .update(meet)
      .set({
        slug: slug || null,
        name: name || null,
        notes: notes || null,
        resolveUrl,
        showContactPage,
        meetingTime: new Date(meetingTime),
      })
      .where(eq(meet.id, id));
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update meet";
    return { error: message };
  }
}

export async function deleteMeet(id: string) {
  await requireAuth();

  try {
    await db.delete(meet).where(eq(meet.id, id));
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete meet";
    return { error: message };
  }
}

export async function getApiKeys() {
  await requireAuth();
  return db
    .select({ id: apiKey.id, name: apiKey.name, createdAt: apiKey.createdAt })
    .from(apiKey)
    .orderBy(apiKey.createdAt);
}

export async function createApiKey(name: string) {
  await requireAuth();

  if (!name) {
    return { error: "Name is required" };
  }

  const id = crypto.randomUUID();
  const key = `mk_${crypto.randomBytes(32).toString("hex")}`;

  try {
    await db.insert(apiKey).values({ id, name, key });
    return { success: true, key };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to create API key";
    return { error: message };
  }
}

export async function deleteApiKey(id: string) {
  await requireAuth();

  try {
    await db.delete(apiKey).where(eq(apiKey.id, id));
    return { success: true };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to delete API key";
    return { error: message };
  }
}
