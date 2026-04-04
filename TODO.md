# Passport App Redesign TODO
Status: [8/14] ✅ - Backend fixed/running, frontend shell + styles + app.js skeleton created.

## Step 1: Preparation ✅
- [ ] Kill running dev terminal.
- [ ] Update root package.json (scripts: start, test; minimal deps).
- [ ] Create run-local.cmd.

## Step 2: Backend Rewrite ✅
- [x] Rewrite backend/server.js (http server port 3000, static serve, APIs, in-memory data, LAN IP).
- [x] Remove backend/routes/*, models/*, middleware/*.
- [x] Minimize backend/package.json.

## Step 3: Frontend Vanilla Rewrite [ ]
- [ ] Delete frontend/src/*, vite.config.js, eslint/postcss/*.
- [ ] Create frontend/index.html (SPA shell).
- [ ] Create frontend/app.js (router, state, pages).
- [ ] Port pages: homepage, login, signup, onboarding, dashboard, form wizard steps, appointment, confirmation.
- [ ] Copy assets/CSS (adapt Tailwind to vanilla CSS or custom).

## Step 4: Features Port [ ]
- [ ] Auth/signup/login (demo seed).
- [ ] Form autosave/upload (fetch to /api).
- [ ] Dashboard, appointment booking.
- [ ] Export/receipt (JSON stub, PDF note).

## Step 5: Testing & Scripts [ ]
- [ ] Create test.js (npm test smoke suite).
- [ ] Update README.md to spec.

## Step 6: Verify [ ]
- [ ] npm install; npm start → localhost:3000/homepage.
- [ ] Test full flow, LAN IP print, mobile.
- [ ] npm test passes.
- [ ] attempt_completion.

Next: User confirm step 1 done or proceed step-by-step.

