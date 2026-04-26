# Auth setup — Google / Apple / Magic-link

The code is in. Three things still need manual setup outside the repo
before sign-in works in production.

## 1. Magic-link (works out of the box on Free tier — 30 sec)

Supabase enables email auth by default, but the default outbound email
is rate-limited and uses Supabase branding. For SOUK demo this is fine.

To verify it works:
1. Open https://detox-project.vercel.app/login
2. Enter your email
3. Check inbox — you should get a "Confirm your signup" email
4. Click → lands on the site, signed in

For production (post-SOUK) point Supabase at a real SMTP (Resend, Postmark, SES) — Supabase Dashboard → Authentication → SMTP Settings.

## 2. Google OAuth (free, ~10 minutes)

### A. Create the OAuth client in Google Cloud Console

1. https://console.cloud.google.com → create or select a project
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Detox Project`
   - User support email: your email
   - Authorized domains: `supabase.co`, `vercel.app`
   - Save
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: `Detox Supabase`
   - Authorized JavaScript origins: `https://detox-project.vercel.app`
   - Authorized redirect URIs: `https://akbnmgnninaxrlpeisec.supabase.co/auth/v1/callback`
   - Create → copy **Client ID** and **Client Secret**

### B. Wire it up in Supabase

1. https://supabase.com/dashboard/project/akbnmgnninaxrlpeisec/auth/providers
2. Find **Google** → toggle **Enabled**
3. Paste **Client ID** and **Client Secret**
4. Save

Test: open `/login`, click **Continue with Google** → Google consent
screen → back to the site signed in.

## 3. Apple OAuth (requires $99/year Apple Developer account)

If you don't have one, **skip this for now** — magic-link covers everyone
who doesn't have Google. The Apple button on `/login` will surface a
clear "provider not enabled" error from Supabase if a user clicks it.

If you decide to enable Apple later:
1. Apple Developer → Certificates, Identifiers & Profiles → create a
   Services ID. Configure: domain = `akbnmgnninaxrlpeisec.supabase.co`,
   redirect = `https://akbnmgnninaxrlpeisec.supabase.co/auth/v1/callback`
2. Create a Sign In with Apple key → download the `.p8` file
3. Supabase Dashboard → Auth → Providers → Apple → paste Services ID +
   Team ID + Key ID + the contents of the `.p8`

## 4. URL configuration in Supabase

Whichever method(s) you enable, set these once in Supabase Dashboard →
Authentication → URL Configuration:

- **Site URL**: `https://detox-project.vercel.app`
- **Redirect URLs** (add all):
  - `https://detox-project.vercel.app/auth/callback`
  - `https://detox-project.vercel.app/en/auth/callback`
  - `http://localhost:3000/auth/callback` (local dev)

Without these, the code exchange step rejects every callback as a
redirect mismatch.
