import { auth } from "../lib/auth";

async function seed() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] ?? "Admin";

  if (!email || !password) {
    console.error("Usage: npx tsx db/seed.ts <email> <password> [name]");
    process.exit(1);
  }

  const ctx = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  console.log("Admin user created:", ctx.user.email);
  process.exit(0);
}

seed();
