Build a production-ready MVP web app called “Datum Gems Hub” with NO database.
It’s a simple link hub for Google Gemini Gems (external links), with a public landing page and a lightweight admin area.

Design reference (visual vibe)
- Inspired by https://alice.yandex.ru/prompthub
- Clean, minimal, modern
- Hero header + grid of tiles/cards
- Each tile has preview image + title + short description
- Use Tailwind + shadcn/ui.

Tech / Stack
- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Icons: @phosphor-icons/react
- Forms: React Hook Form + Zod
- State: minimal client state where needed
- Storage: JSON file in the repo (data/gems.json) used as the single source of truth.
  - Admin edits should update this JSON file on the server.
  - Use Next.js Server Actions (preferred) to read/write the JSON file via fs.
  - If file writes are restricted in some environments, still implement the write logic; additionally include a “Download updated JSON” fallback in Admin so changes are not blocked.

App name / branding
- “Datum Gems Hub”

Information Architecture / Routes
Public:
1) / (Landing)
- Header: “Datum Gems Hub”
- Subtitle: “Internal collection of Gemini Gems for the Datum team”
- Search bar to filter by title/description (client-side, debounced)
- Grid of Gem cards, responsive:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3–4 columns
- Card click opens the external gem URL in a new tab (target=_blank, rel=noopener noreferrer)
- Footer with a subtle Admin link to /admin

Admin (no DB, file-based):
2) /admin (Dashboard)
- Protected by a simple password gate using middleware + cookie session:
  - /admin/login page with password form
  - Compare against env var ADMIN_PASSWORD
  - On success, set an HttpOnly cookie (e.g., admin_session=valid) for a limited duration
  - Middleware restricts /admin/* routes unless cookie is present
3) /admin/login
4) /admin/new
5) /admin/[id]/edit

Data model stored in JSON
- data/gems.json holds an array of gems:
  [
    {
      "id": "uuid-or-slug",
      "title": "string",
      "description": "string",
      "url": "https://gemini.google.com/gem/....",
      "previewImageUrl": "https://... or /images/...",
      "published": true,
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  ]

Functional Requirements (must all work)
Landing
- Load only gems where published=true
- Display cards (image 16:9, title, description)
- Hover states (shadow/scale)
- Search filters instantly (debounced)
- Empty states:
  - No gems: show “No gems published yet.”
  - No results: show “No matches found.”
- Loading skeletons while fetching

Admin Auth
- /admin/login:
  - Password input + submit
  - Zod validation: password required
  - On success: set cookie and redirect to /admin
  - On failure: show error toast/message
- Logout button in /admin that clears cookie and redirects to /

Admin CRUD (backed by JSON file)
- /admin shows a table/list of all gems (published and unpublished) with:
  - Preview thumbnail
  - Title
  - Published badge
  - Actions: Edit, Delete, Toggle Published
  - “Add new” button
- Create:
  - Form fields: title, description, url, previewImageUrl, published
  - Zod validation:
    - title required, max 80
    - description required, max 180
    - url required, must be valid http/https
    - previewImageUrl required, must be valid URL OR a local path starting with “/”
  - On submit: write into gems.json
  - Show toast success, redirect to /admin
- Edit:
  - Same form, prefilled
  - Save updates to gems.json
- Delete:
  - Confirmation dialog (shadcn Dialog)
  - Remove from gems.json on confirm
- Toggle Published:
  - Quick toggle button in list that updates gem.published and writes file

File write behavior + fallback
- Implement server-side write to data/gems.json using fs/promises.
- If write fails (e.g., read-only filesystem):
  - Show an error banner explaining “Write failed in this environment”
  - Provide a “Download updated gems.json” button that downloads the new JSON so the user can commit it manually.
  - Still update the UI optimistically in-memory for the current session so the admin can keep working.

Implementation details
- Use Server Actions for:
  - getGems()
  - createGem()
  - updateGem()
  - deleteGem()
  - togglePublished()
  - login()
  - logout()
- Store server actions in /app/actions/gems.ts and /app/actions/auth.ts
- Read/write JSON helpers in /lib/gems-store.ts
- Use crypto.randomUUID() for id generation.
- Use shadcn/ui components:
  - Card, Button, Input, Textarea, Dialog, Table, Badge, Tabs (optional), DropdownMenu (optional), Skeleton, Sonner (toasts)
- Use Next/Image for previews; allow remote images with next.config remotePatterns and local /public images.

Seed content
- Provide initial data/gems.json with ~12 sample gems:
  - Use placeholder preview images from /public/previews/*.png (create a few simple placeholder images)
  - Use example gem links (format like the provided URL)
  - Mix published true/false for testing.

SEO
- Landing page:
  - title: “Datum Gems Hub”
  - meta description: “A curated hub of internal Gemini Gems for the Datum team.”
  - OpenGraph basics

Deliverables
- Full Next.js codebase with:
  - App Router pages
  - Admin auth middleware
  - Server actions for file-based CRUD
  - data/gems.json seed
  - README with:
    - install
    - env vars
    - run dev
    - how to deploy on Vercel
    - note about JSON file write limitations + recommended workflow (edit locally + commit) and the built-in download fallback

Environment variables
- ADMIN_PASSWORD=some-strong-password

Acceptance Criteria
- All buttons and forms function end-to-end.
- Admin routes are protected.
- Public landing shows only published gems and links open correctly.
- Admin can create/edit/delete/toggle gems and the JSON update logic exists, with a visible fallback if writes fail.
- Responsive layout works on mobile + desktop, with proper empty/loading/error states.
Generate the complete implementation.