# Deploy Web App to Vercel (Complete Guide)

This project is a monorepo with:
- `apps/web` (Next.js web app)
- `apps/mobile` (Expo mobile app)

Use this guide to deploy the web app and get a public link that opens on any laptop browser without installing any app.

## 1) What to remove from the project

Short answer: **remove nothing required**.

You do **not** need to delete files/folders to deploy web.

Optional cleanup only if you are certain:
- Remove `apps/mobile` only if you never plan to build mobile.
- Remove `publisher` only if you never plan to use the AWS/OpenNext publishing flow.

If unsure, keep everything.

## 2) Prerequisites

- GitHub account
- Vercel account (Hobby/free)
- Repo pushed to GitHub

## 3) Push code to GitHub

From repo root:

```bash
git add .
git commit -m "prepare vercel deploy"
git push
```

## 4) Import project in Vercel

1. Open Vercel dashboard.
2. Click **Add New Project**.
3. Import your GitHub repo.
4. In project settings, set:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: `Next.js`
5. Vercel should pick scripts from `apps/web/package.json`.

## 5) Add environment variables in Vercel

Go to: Project -> Settings -> Environment Variables

Set these required values:
- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `EXPO_PUBLIC_PROXY_BASE_URL`
- `NEXT_PUBLIC_CREATE_BASE_URL`
- `NEXT_PUBLIC_CREATE_HOST`

Recommended public flags if used by your UI/flow:
- `NEXT_PUBLIC_CREATE_ENV`
- `NEXT_PUBLIC_CREATE_AUTH_PROVIDERS`

Optional social login values:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`
- `APPLE_CLIENT_SECRET`
- `APPLE_APP_BUNDLE_IDENTIFIER`

Notes:
- `BETTER_AUTH_URL` should be your deployed web URL (for example `https://your-app.vercel.app`).
- Keep secret values in Vercel only, not in git.

## 6) Deploy

Click **Deploy**.

After build finishes, Vercel gives a public URL like:
- `https://your-project.vercel.app`

Open this link on any laptop browser.

## 7) CLI deployment (optional)

If you prefer terminal:

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

When prompted, choose:
- scope/team
- existing or new project
- root directory: `apps/web`

## 8) Troubleshooting

### Build fails because env vars are missing
- Re-check all required env vars in Vercel settings.
- Redeploy after saving env vars.

### Auth/session issues after deploy
- Ensure `BETTER_AUTH_URL` equals the deployed domain.
- Ensure `NEXT_PUBLIC_CREATE_HOST` matches your host/domain.
- If you changed env vars, trigger a redeploy.

### Local `yarn workspace web dev` fails but Vercel deploy should still work
- Local failure can be from local env differences.
- Confirm Vercel env vars are correct and deploy logs pass.

## 9) Existing config file

A Vercel config has been added at:
- `apps/web/vercel.json`

Keep root directory set to `apps/web` in Vercel so this config is used.
