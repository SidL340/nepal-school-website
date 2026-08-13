# Shree Nepal Secondary School Website 🏫

Official repository for **Shree Nepal Secondary School** (`nepalssb.edu.np`), located in Brindaban-02, Rautahat, Nepal.

---

## 🌟 Key Features & Architecture

- **Real-Time Firebase Synchronization**: Instant zero-latency data loading with Firestore **Offline Persistence** enabled.
- **Admin Subdomain Support**: Manage site contents dynamically via `admin.nepalssb.edu.np` or `nepalssb.edu.np/manage`.
- **Modern Interactive UI/UX**: Built with custom Glassmorphism CSS, smooth keyframe animations, glowing gold theme, responsive mobile drawers, and attachment modals.
- **Cloudinary Media Uploads**: Unlimited free image & document upload integration in the admin panel.
- **National Educational Portals**: Embedded links for NEB results, SEE results, CDC Nepal, and E-Pustakalaya Digital Library.

---

## 🌐 Custom Subdomain Setup (`admin.nepalssb.edu.np`)

To point `nepalssb.edu.np` and `admin.nepalssb.edu.np` to your Vercel deployment:

1. Log into your **Vercel Dashboard** -> Open the `nepal-school-website` project.
2. Navigate to **Settings** -> **Domains**.
3. Add Domain 1: `nepalssb.edu.np` (Root domain & `www.nepalssb.edu.np`).
4. Add Domain 2: `admin.nepalssb.edu.np` (Subdomain).
5. In your DNS Provider (e.g. Domain registrar / Cloudflare):
   - Add an **A Record** `@` pointing to Vercel IP `76.76.21.21`
   - Add a **CNAME Record** `admin` pointing to `cname.vercel-dns.com`
6. `vercel.json` will automatically route any request sent to `admin.nepalssb.edu.np` to the Admin Portal (`manage.html`).

---

## 🔐 Admin Portal Access

- **Public Site**: `https://nepalssb.edu.np`
- **Admin Portal**: `https://admin.nepalssb.edu.np` or `https://nepalssb.edu.np/manage`

Manage school information, principal messages, staff members, committee lists, photo galleries, and notice circulars directly from the built-in executive dashboard!
