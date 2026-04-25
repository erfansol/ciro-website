# Deploy Ciro to Hostinger via Git

Domain: **ciroai.com** · Founder: **Erfan Soleymanzadeh** · Hosting: **Hostinger Node.js Web App**

This guide uses Hostinger's recommended **Git deployment** workflow. You push to GitHub, Hostinger pulls and rebuilds automatically. No zip uploads.

---

## One-time setup

### 1. Push this folder to GitHub

The `website/` folder is already a clean Git repo with an initial commit on the `main` branch.

```bash
cd website
# 1. Create a new PRIVATE repo at https://github.com/new
#    Owner: erfansol · Name: ciro-website · No README/license/gitignore
# 2. The remote is already configured (git@github.com:erfansol/ciro-website.git)
#    so just push:
git push -u origin main
```

> If your machine isn't set up for GitHub SSH yet, switch to HTTPS:
> `git remote set-url origin https://github.com/erfansol/ciro-website.git`
> When prompted, use a [Personal Access Token](https://github.com/settings/tokens?type=beta) as the password.

> Use a **private** repo — `LICENSE` is "all rights reserved", and you may want to commit `.env` references later.

### 2. Create the Node.js app on Hostinger

In **hPanel → Advanced → Node.js → Create application**:

| Field | Value |
| --- | --- |
| Node.js version | **20.x** (or higher) |
| Application root | `domains/ciroai.com/public_html` |
| Application URL | `ciroai.com` (or `https://ciroai.com`) |
| Application startup file | leave default — we use `npm start` |
| Startup command | `npm start` |
| Environment | `production` |

Don't start the app yet — finish Git setup first.

### 3. Connect Git in Hostinger

In **hPanel → Advanced → Git**:

1. Click **Create Repository**.
2. **Repository address**: paste your GitHub clone URL (HTTPS or SSH).
   - For private repos via HTTPS, use a Personal Access Token: `https://<username>:<token>@github.com/<username>/ciro-website.git`
   - For SSH, copy Hostinger's public key from the Git panel and add it as a Deploy Key on GitHub (`Settings → Deploy keys → Add deploy key`).
3. **Branch**: `main`
4. **Install path**: same as Application root above (`domains/ciroai.com/public_html`).
5. Save. Hostinger clones the repo.

### 4. Set environment variables

In the Node.js app panel, add:

```
NEXT_PUBLIC_SITE_URL=https://ciroai.com
EMAIL_BACKEND=mock
NEXT_PUBLIC_IOS_URL=https://apps.apple.com/app/ciro
NEXT_PUBLIC_ANDROID_URL=https://play.google.com/store/apps/details?id=travel.ciro
```

(You can switch `EMAIL_BACKEND` to `firebase` later — see `.env.example`.)

### 5. Build & start

In Hostinger's Node.js panel, set the **build command**:

```
npm ci && npm run build
```

Then click **Run NPM Install** (or just **Restart** — Hostinger runs the build command on each deploy).

When build finishes, click **Start Application**.

### 6. Point DNS to Hostinger

If `ciroai.com` was bought elsewhere:
- In your registrar, set nameservers to Hostinger's: `ns1.dns-parking.com`, `ns2.dns-parking.com` (or whatever Hostinger gives you under **Domains → DNS**).
- Wait 10–60 min for DNS to propagate.

If bought via Hostinger, it's already pointed.

### 7. Enable SSL

**hPanel → Security → SSL → Install** (Let's Encrypt is free).

---

## Updating the site after that

```bash
# in your local website/ folder
git add .
git commit -m "Update copy on landing page"
git push
```

Then in Hostinger's Git panel click **Deploy latest changes** (or set up auto-deploy via webhook). Hostinger pulls, runs the build command, and restarts the app.

That's it.

---

## Verification checklist

After deploy:

- [ ] `https://ciroai.com/` — landing page renders
- [ ] `https://ciroai.com/stories/` — story library renders
- [ ] `https://ciroai.com/city/rome/` — Rome city page renders
- [ ] `https://ciroai.com/sitemap.xml` — sitemap responds
- [ ] `https://ciroai.com/robots.txt` — robots responds
- [ ] Footer shows "© 2026 Erfan Soleymanzadeh · Ciro™. All rights reserved."
- [ ] Submit a test waitlist signup → check `data/submissions.json` on the server (or Firestore if you switched to firebase)
- [ ] Submit `https://ciroai.com/sitemap.xml` to Google Search Console

---

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| `Cannot find module 'next'` at startup | Build command didn't run — set it to `npm ci && npm run build` and redeploy. |
| 502 Bad Gateway | App crashed at startup. Open Node.js logs in hPanel — usually a missing env var. |
| Form submits but nothing in `data/` | Hostinger may have read-only sections of the filesystem. Verify the app root is writable, or switch `EMAIL_BACKEND=firebase`. |
| "Permission denied (publickey)" cloning from GitHub | Hostinger's deploy key isn't on the GitHub repo yet (private repos only). Add it under GitHub → Settings → Deploy keys. |
| Old build still served after `git push` | Click **Deploy latest changes** in the Git panel, or set up the GitHub webhook for auto-deploy. |
| Site loads but `/api/waitlist` returns 405 | Hostinger is serving as static — confirm the Node.js application is **Started** (green dot) in hPanel. |

---

## Why Git over zip

- Atomic deploys — Hostinger checks out a specific commit, never a half-uploaded folder.
- One-line updates — `git push` ships changes.
- Rollback — `git revert` + redeploy = back to a known-good state in seconds.
- Build is reproducible on the server — no risk of "works on my machine" `.next/` artifacts.

---

© 2026 Erfan Soleymanzadeh. Ciro™ — All rights reserved.
