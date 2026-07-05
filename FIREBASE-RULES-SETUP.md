# Firebase Security Rules Setup

## ⚠️ IMPORTANT — You must do this once in Firebase Console

### Firestore Database Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project **nepal-school-website**
3. Click **Firestore Database** → **Rules** tab
4. Replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public can read everything
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
5. Click **Publish**

---

### Firebase Storage Rules
1. In Firebase Console, click **Storage** → **Rules** tab
2. Replace everything with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
3. Click **Publish**

---

After setting these rules:
- ✅ The public website can read all data (notices, staff, gallery, etc.)
- ✅ Only the logged-in admin at `/manage` can write/upload/delete data
- ✅ Random visitors cannot add or change anything
