# RootedCare Admin Dashboard

A standalone web admin panel for managing RootedCare content — herbs, wellness guides, articles, images, AI configuration, and users.

---

## How to open

### Option A — Direct file open (simplest)
Open `admin/index.html` directly in Chrome or Edge.

> ⚠️ Some browsers block ES module imports from `file://`. If the page stays blank, use Option B.

### Option B — Local server (recommended)
In your project terminal:
```bash
npx serve admin/
```
Then open **http://localhost:3000** in your browser.

---

## First-time setup

On first load you'll see a **Connect to Supabase** form. Fill in:

| Field | Where to find it |
|---|---|
| **Supabase URL** | Supabase → Settings → API → Project URL |
| **Publishable key** | Supabase → Settings → API → `anon` public key |
| **Service role key** | Supabase → Settings → API → `service_role` secret |

> 🔒 These credentials are stored only in your browser's `sessionStorage` and cleared when you close the tab.

---

## Running the DB migration

Before using the dashboard, run the migration in your Supabase SQL editor:

```
supabase/migrations/00003_admin_controls.sql
```

This adds:
- `is_featured` column to herbs, wellness, articles
- `updated_at` auto-trigger
- `app_config` table (AI rate limits, etc.)
- `user_profiles` table (auto-created on signup)

---

## Features

| Section | What you can do |
|---|---|
| **Dashboard** | Stats overview, incomplete records, quick links |
| **Herbs** | Search, filter by draft/published/featured, toggle publish/feature, edit all fields, delete |
| **Wellness** | Same as herbs |
| **Articles** | Full content editing, publish/feature toggles |
| **Images** | Upload to Supabase Storage `content-images` bucket, click to copy URL |
| **AI Config** | Edit rate limits, model, temperature in the `app_config` table |
| **Users** | View registered users and admin flags |

---

## Notes

- The **service role key bypasses RLS** — keep it secret. Never deploy this dashboard publicly.
- Images are uploaded to a `content-images` storage bucket. Create the bucket in Supabase → Storage if it doesn't exist, and set it to **public**.
- The dashboard reads real-time data — refresh sections after making changes from other sources.
