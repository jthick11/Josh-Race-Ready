# Josh // Race Ready — Deploy Guide

## What you're deploying
A full training dashboard with AI coach, adjustable weekly targets, live calendar feed, and ICS export. Once deployed you get:
- A permanent URL you can bookmark on your phone
- A live calendar subscription URL for Google Calendar and Apple Calendar
- All your data saves in the browser between sessions

---

## Step-by-Step Deploy (10 minutes)

### Step 1 — Install Node.js (if you don't have it)
Go to https://nodejs.org and download the LTS version. Install it. This is a one-time thing.

---

### Step 2 — Install Vercel CLI
Open Terminal (Mac) or Command Prompt (Windows) and run:
```
npm install -g vercel
```

---

### Step 3 — Navigate to this folder
In Terminal, run:
```
cd path/to/josh-race-ready
```
(Replace `path/to` with wherever you unzipped this folder)

---

### Step 4 — Install dependencies
```
npm install
```

---

### Step 5 — Test locally (optional but good)
```
npm run dev
```
Open http://localhost:5173 in your browser. You should see the dashboard. Press Ctrl+C to stop when done.

---

### Step 6 — Deploy to Vercel
```
vercel
```

It will ask you a few questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account
- **Link to existing project?** → No
- **Project name?** → josh-race-ready (or whatever you want)
- **In which directory is your code?** → ./ (just hit Enter)
- **Want to override settings?** → No

Hit Enter through everything. Vercel builds it automatically.

---

### Step 7 — Get your URL
After deploy finishes, Vercel gives you a URL like:
```
https://josh-race-ready.vercel.app
```

**Bookmark this on your phone.** That's your dashboard.

---

## Subscribe your Calendar

### Google Calendar
1. Open Google Calendar on desktop
2. Click the + next to "Other calendars"
3. Select "From URL"
4. Paste: `https://josh-race-ready.vercel.app/api/calendar`
5. Click "Add calendar"

Google will sync every few hours automatically.

### Apple Calendar (iPhone / Mac)
1. Open Settings → Calendar → Accounts → Add Account
2. Select "Other" → "Add Subscribed Calendar"
3. Paste: `https://josh-race-ready.vercel.app/api/calendar`
4. Tap Next → Save

### Outlook (Personal)
1. Open Outlook calendar
2. Add calendar → Subscribe from web
3. Paste: `https://josh-race-ready.vercel.app/api/calendar`

---

## Future Updates
If you ever want to update the app (new features, etc.), just run:
```
vercel --prod
```
from the project folder. Takes 30 seconds.

---

## Troubleshooting
- **"command not found: vercel"** → Make sure Node.js installed correctly, restart Terminal
- **Build fails** → Run `npm install` again first
- **Calendar not showing** → Make sure you used the full URL including `/api/calendar`
