# Meet Subdomain

A self-hosted meeting link manager. Create short, shareable meeting links (e.g. `meet.tim-arnold.de/a3f-9k2` or `meet.tim-arnold.de/coffee-chat`) that redirect to video call URLs. Optionally show a contact page after the meeting ends.

## Features

- **Short meeting links** with auto-generated IDs (`xxx-xxx`) or custom slugs
- **Admin dashboard** with tabs for managing meets, users, and API keys
- **Contact page mode** — opens the meeting in a new tab, then shows a "stay in touch" page with further links after 2 minutes
- **REST API** with Bearer token authentication for programmatic access
- **OpenAPI spec** available at `/admin/openapi`
- **Email/password auth** via Better Auth (no public registration)
- **PostgreSQL** on a self-hosted VM, accessed via SSH tunnel for local development

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Auth**: Better Auth
- **UI**: shadcn/ui, Tailwind CSS 4, Base UI
- **Testing**: Vitest

## Project Structure

```
app/
  [meetId]/           # Dynamic route — redirects to meet URL or shows contact page
  admin/              # Protected dashboard (meets, users, API keys)
    openapi/          # OpenAPI spec (session-protected)
    actions.ts        # Server actions for all CRUD operations
  api/
    auth/[...all]/    # Better Auth API routes
    meets/            # REST API for meets (API key auth)
      [id]/           # Single meet CRUD
  login/              # Login page
  not-found.tsx       # Custom 404 matching tim-arnold.de design
db/
  schema.ts           # Drizzle schema (user, session, account, verification, meet, apiKey)
  index.ts            # Database connection
  seed.ts             # Seed script for creating admin users
lib/
  auth.ts             # Better Auth server config
  auth-client.ts      # Client-side auth hooks
  api-auth.ts         # API key validation
```

## Setup

### Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL instance (local or remote)

### Install

```bash
bun install
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/postgres"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### Database

Push the schema to your database:

```bash
bun run db:push
```

### Seed Admin User

```bash
bun db/seed.ts you@example.com yourpassword "Your Name"
```

### Run

```bash
bun run dev
```

## SSH Tunnel (Remote PostgreSQL)

If your PostgreSQL runs on a remote VM, use the included tunnel script:

```bash
./tunnel.sh
```

This forwards `localhost:5432` to the remote database via SSH. Edit `tunnel.sh` to change the host/user.

## Admin Dashboard

Navigate to `/admin` (redirects to `/login` if not authenticated).

### Meets Tab
- Create, edit, and delete meeting links
- Set a custom slug, name, notes, meeting time, and contact page toggle
- Past meetings are hidden by default (toggle to show)

### Users Tab
- Create new users with email/password
- Change passwords for existing users

### API Keys Tab
- Generate API keys for programmatic access
- Keys are shown once on creation — copy immediately
- Delete keys to revoke access

## REST API

All endpoints require a valid API key as a Bearer token:

```
Authorization: Bearer mk_your_api_key_here
```

### Endpoints

| Method | Endpoint | Description |
|--------|-----------------|--------------------------|
| GET | `/api/meets` | List all meets |
| POST | `/api/meets` | Create a meet |
| GET | `/api/meets/:id` | Get a meet by ID |
| PUT | `/api/meets/:id` | Update a meet |
| DELETE | `/api/meets/:id` | Delete a meet |

### Create/Update Body

```json
{
  "resolveUrl": "https://meet.google.com/abc-def-ghi",
  "meetingTime": "2026-04-15T14:00:00.000Z",
  "showContactPage": true,
  "name": "Call with Alex",
  "notes": "Discuss project timeline",
  "slug": "coffee-chat"
}
```

Required fields: `resolveUrl`, `meetingTime`. All others are optional.

### Example

```bash
# Create a meet
curl -X POST https://meet.example.com/api/meets \
  -H "Authorization: Bearer mk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"resolveUrl":"https://zoom.us/j/123","meetingTime":"2026-04-15T14:00:00Z"}'

# List all meets
curl https://meet.example.com/api/meets \
  -H "Authorization: Bearer mk_your_key"

# Delete a meet
curl -X DELETE https://meet.example.com/api/meets/a3f-9k2 \
  -H "Authorization: Bearer mk_your_key"
```

### OpenAPI Spec

Available at `/admin/openapi` (requires active session, not API key).

## How Meeting Links Work

1. User visits `/{id}` or `/{slug}`
2. If `showContactPage` is **false** — instant redirect to `resolveUrl`
3. If `showContactPage` is **true**:
   - Opens `resolveUrl` in a new tab automatically
   - Shows a fallback "Open meeting" button
   - After 2 minutes, transitions to a "Stay in touch" page with email, LinkedIn, and website links

## Testing

```bash
bun run test          # Run once
bun run test:watch    # Watch mode
```

## Database Scripts

```bash
bun run db:generate   # Generate migrations from schema changes
bun run db:migrate    # Run pending migrations
bun run db:push       # Push schema directly (dev)
bun run db:studio     # Open Drizzle Studio GUI
```

## TODO
- [ ] Add pagination to meets list in admin
- [ ] Implement customizations for contact page
- [ ] Auto generate meeting links

