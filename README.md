# Minicloud

A simple, password-protected personal cloud for uploading and managing images, files, and more.

**Password:** `100012`

## Features

- Password-protected access
- Drag & drop or click to upload
- Supports images, videos, audio, documents, archives
- Preview images, videos, and audio
- Download and delete files
- Files stored in browser localStorage (max ~5MB per file)

## Deploy

This app is designed to run on Vercel.

```bash
npm install
npm run dev
```

## Note

Files are stored client-side in localStorage. For true multi-device cloud storage, connect Vercel Blob or another storage backend.
