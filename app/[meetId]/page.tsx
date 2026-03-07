import { db } from "@/db";
import { meet } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import ContactPage from "./contact-page";

export default async function MeetPage({
  params,
}: {
  params: Promise<{ meetId: string }>;
}) {
  const { meetId } = await params;

  const result = await db
    .select({
      resolveUrl: meet.resolveUrl,
      showContactPage: meet.showContactPage,
    })
    .from(meet)
    .where(or(eq(meet.id, meetId), eq(meet.slug, meetId)))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const { resolveUrl, showContactPage } = result[0];

  if (!showContactPage) {
    redirect(resolveUrl);
  }

  return <ContactPage resolveUrl={resolveUrl} />;
}
