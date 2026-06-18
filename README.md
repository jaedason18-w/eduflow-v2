# EduFlow 🎓
### Your Academic Operating System

---

## Project Structure

```
eduflow/
├── index.html              ← Landing page
├── dashboard.html          ← Student dashboard (after login)
│
├── pages/
│   ├── login.html          ← Sign in page
│   └── register.html       ← Sign up page
│
├── css/
│   ├── main.css            ← Global styles & shared components
│   ├── auth.css            ← Login & register page styles
│   └── dashboard.css       ← Dashboard styles
│
├── js/
│   ├── supabase.js         ← Supabase client (URL + key)
│   ├── auth.js             ← All auth functions
│   ├── landing.js          ← Landing page logic
│   ├── login.js            ← Login page logic
│   ├── register.js         ← Register page logic
│   └── dashboard.js        ← Dashboard logic
│
└── assets/                 ← Images, icons, logo files
```

---

## Setup

### 1. Supabase
Already configured in `js/supabase.js` with your project credentials.

### 2. Enable Google OAuth in Supabase
1. Go to **Supabase Dashboard → Authentication → Providers**
2. Enable **Google**
3. Add your Google Client ID: `803094066950-8k59qsfe36uipgcunblh6d98ug0sc46i.apps.googleusercontent.com`
4. Add your Google Client Secret (from Google Cloud Console)
5. Copy the **Callback URL** from Supabase and add it to Google Cloud Console under **Authorized redirect URIs**

### 3. Run locally
```bash
# Option 1 — VS Code Live Server
# Right-click index.html → "Open with Live Server"

# Option 2 — Node.js
npx serve .
# Then open http://localhost:3000
```

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

---

## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JS (ES Modules)
- **Backend:** Supabase (Auth + Database + Storage)
- **Icons:** Remix Icons CDN
- **Fonts:** Clash Display + Bricolage Grotesque (Google Fonts)

---

## Supabase Database Tables (set up in Supabase SQL editor)

```sql
-- User profiles (auto-created on signup)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  university text,
  department text,
  year text,
  degree text,
  gpa numeric(3,2) default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

---

## Next Steps
- [ ] Connect Google OAuth fully (add callback URL)
- [ ] Create Supabase database tables
- [ ] Build out Planner, Courses, and Vault features
- [ ] Deploy to Vercel or Netlify
- [ ] Add mobile app (React Native / Expo)

---

Built with ❤️ for students everywhere.
