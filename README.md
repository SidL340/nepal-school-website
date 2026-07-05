# Shree Nepal Secondary School Website 🏫

Welcome to the source code for the **Shree Nepal Secondary School** website! This site is designed to be easily managed directly from the **GitHub website** without needing any coding software.

---

## 🚀 Step 1: Upload to Your GitHub

1. Go to [GitHub.com](https://github.com) and log in to your account.
2. Click the **`+`** icon in the top right corner and select **New repository**.
3. Name it something like `nepal-school-website`.
4. Make sure it is set to **Public**.
5. Click **Create repository**.
6. On the next page, click on **"uploading an existing file"** (it's a small link near the top).
7. Drag and drop **all the files and folders** from your `web` folder into the browser window.
8. Wait for them to upload, then click **Commit changes** at the bottom.

---

## 🌐 Step 2: Deploy to Vercel (Go Live!)

1. Go to [Vercel.com](https://vercel.com) and log in (you can use your GitHub account).
2. Click **Add New...** and select **Project**.
3. Under "Import Git Repository", find your `nepal-school-website` repository and click **Import**.
4. You don't need to change any settings. Just click the big **Deploy** button.
5. Wait about 1 minute. Congratulations, your site is live! 🎉
6. **To add your custom domain (`nepalssb.edu.np`)**:
   - Go to your project dashboard on Vercel.
   - Click **Settings** -> **Domains**.
   - Type in `nepalssb.edu.np` and click **Add**.
   - Follow the instructions Vercel gives you to update your DNS records with your domain provider.

---

## 📝 How to Update the Website Directly on GitHub

You can edit text, add notices, and change photos directly from your browser! Whenever you save a change on GitHub, **Vercel will automatically update your live website within 1 minute.**

### 👉 Adding a New Notice
1. Open your repository on GitHub.
2. Click on the `notices` folder.
3. Click **Add file** -> **Upload files** to upload your notice photo (e.g., `exam-routine.jpg`). Click **Commit changes**.
4. Now, click on the file named `notices-list.js` inside the `notices` folder.
5. Click the **✏️ Pencil icon** (Edit this file).
6. Add your notice to the list, like this:
   ```javascript
   const notices = [
     {
       id: 1,
       title: "Exam Routine - Final Examination",
       file: "exam-routine.jpg", // Make sure this matches your uploaded photo name!
       date: "2081-03-15",
       category: "Exam",
       important: true
     }
   ];
   ```
7. Click **Commit changes...** at the top right, and confirm.

### 👉 Updating Staff or Committee Members
1. To upload a new photo, go to `images/staff/` (or `images/committee/`), click **Add file** -> **Upload files**, and upload the photo.
2. To change names, go to `faculty.html` (for staff) or `committee.html` (for committee).
3. Click the **✏️ Pencil icon**.
4. Find the text you want to change and type the new name.
5. Find the `<img>` tag next to it and update the filename to match the photo you uploaded.
6. Click **Commit changes...**

### 👉 Updating General Text (Home, About, etc.)
1. Click on the HTML file for the page you want to edit (e.g., `index.html` for the Home page, `about.html` for the About page).
2. Click the **✏️ Pencil icon**.
3. Carefully edit the text (make sure you don't delete the `<...>` code tags around the text).
4. Click **Commit changes...**.

Enjoy managing your new school website! 🇳🇵
