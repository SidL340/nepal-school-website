# Shree Nepal Secondary School — Website

## 🌐 Live Website: [nepalssb.edu.np](https://nepalssb.edu.np)

Official website of **Shree Nepal Secondary School, Bishrampur-02, Rautahat, Madhesh Province, Nepal**.

---

## 📁 File Structure

```
/
├── index.html              ← Home page
├── about.html              ← About the school
├── academics.html          ← Classes ECD–12, streams, facilities
├── faculty.html            ← Principal + staff
├── committee.html          ← Bidhyala Bebastapan Samiti
├── notices.html            ← Notice board
├── gallery.html            ← Photo gallery
├── epustakalaya.html       ← E-Pustakalaya digital library
├── links.html              ← Educational links
├── contact.html            ← Contact page
├── style.css               ← Global styles
├── script.js               ← Global JavaScript
├── vercel.json             ← Vercel deployment config
│
├── notices/
│   ├── notices-list.js     ← EDIT THIS to add notices
│   └── *.jpg / *.png       ← Notice image files
│
└── images/
    ├── logo.png            ← ⚠️ REPLACE with actual logo
    ├── school-bg.jpg       ← ⚠️ REPLACE with school photo
    ├── principal.jpg       ← ⚠️ REPLACE with principal photo
    ├── computer-lab.jpg    ← ⚠️ REPLACE with lab photo
    ├── smart-room.jpg      ← ⚠️ REPLACE with smart room photo
    ├── staff-room.jpg      ← ⚠️ REPLACE with staff room photo
    ├── assembly.jpg        ← ⚠️ REPLACE with assembly photo
    ├── ground.jpg          ← ⚠️ REPLACE with ground photo
    └── students.jpg        ← ⚠️ REPLACE with students photo
```

---

## 📸 How to Add Photos

1. Name your photos exactly as listed above (e.g., `logo.png`, `school-bg.jpg`)
2. Place them in the `images/` folder
3. Push to GitHub → Vercel auto-deploys

For committee member photos, place them in `images/committee/` folder.

---

## 📋 How to Add a Notice

1. Take a photo/screenshot of the notice
2. Save it as `.jpg` or `.png` in the `notices/` folder
3. Open `notices/notices-list.js`
4. Add a new entry at the top of the `notices` array:

```js
{
  id: 4,                          // unique number
  title: "Your Notice Title",
  file: "your-notice-filename.jpg",
  date: "2081-04-01",
  category: "Exam",               // Exam | Holiday | Meeting | Result | Admission | General
  important: true                 // true = red badge, false = gold badge
},
```

5. Push to GitHub — Vercel deploys in ~1 minute

---

## 👥 How to Update Committee Members

Open `committee.html` and find the placeholder cards:
- Replace `[ Adhyaksha Name ]` with actual name
- Replace `[ Member Name ]` with actual names
- Replace `Add Contact` with actual phone numbers
- Add photos: place files in `images/committee/` and uncomment the `<img>` tags

---

## 🚀 Deployment (Vercel)

1. Push this repository to GitHub
2. Log in to [vercel.com](https://vercel.com)
3. Click **New Project** → Import from GitHub
4. Select this repository → click **Deploy**
5. In Settings → Domains → add `nepalssb.edu.np`
6. Update your domain DNS records as shown by Vercel

---

## 📞 Contact

- 📧 admin@nepalssb.edu.np
- 📧 info@nepalssb.edu.np
- 📞 +977 9855084542
- 🌐 nepalssb.edu.np
