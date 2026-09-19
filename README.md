# Minicloud

Password-protected personal cloud for images, files, and more — backed by **Supabase Storage** (free tier).

**App password:** `100012`

## Features

- Password-protected access
- Drag & drop / click to upload
- Real cloud storage via Supabase (persists across devices)
- Preview images, video, audio
- Download & delete
- Up to 50 MB per file (Supabase free plan)

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Note your **Project URL** and **anon public** key (Settings → API)

## 2. Create the storage bucket

1. In Supabase Dashboard → **Storage** → **New bucket**
2. Name: `minicloud`
3. Turn **Public bucket** **ON** (so files can be viewed/downloaded via URL)
4. Create bucket

## 3. Add storage policies (required for uploads)

Go to **Storage** → **Policies** → for the `minicloud` bucket, add these policies (or run in SQL Editor):

```sql
-- Allow public read
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'minicloud');

-- Allow public upload
CREATE POLICY "Public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'minicloud');

-- Allow public delete
CREATE POLICY "Public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'minicloud');
```

(These keep the app simple; the UI is still password-gated. For tighter security later, switch to authenticated policies.)

## 4. Environment variables

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

Redeploy after saving.

Locally, copy `.env.example` to `.env.local` and fill in the same values.

## 5. Deploy / run

```bash
npm install
npm run dev
```

Or push to `main` and let Vercel deploy (after fixing Output Directory to empty / Next.js preset).
