// ─── supabase-config.js ──────────────────────────────────────────────────────
// Supabase Storage Configuration for Shree Nepal Secondary School
// Replaces Cloudinary for fast, secure file and image uploads.
// 
// Setup Guide:
// 1. Log in to https://supabase.com and open/create your project.
// 2. Go to "Storage" in the left sidebar -> Click "New bucket".
// 3. Name your bucket: school-media
// 4. IMPORTANT: Enable "Public bucket" toggle ON.
// 5. Go to Project Settings -> API.
// 6. Copy your "Project URL" and "anon public" API Key and paste below:
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"; // e.g., https://abcdefghijklm.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";         // e.g., eyJhbGciOi...
const SUPABASE_BUCKET = "school-media";

let supabaseClient = null;

try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL && !SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Storage initialized successfully.");
  }
} catch (e) {
  console.warn("⚠️ Supabase initialization note:", e.message);
}
