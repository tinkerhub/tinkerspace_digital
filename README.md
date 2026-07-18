# TinkerSpace Digital

Digital display app for TinkerSpace — rotates between maker profiles and the event calendar on a kiosk-style screen.

**Live site:** deployed from `main` via [Netlify](https://tinkerspace-display.netlify.app/)

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11+ (`corepack enable` if needed)

This project uses pnpm only. `npm install` and `yarn` are blocked.

## Local setup

```bash
git clone https://github.com/tinkerhub/tinkerspace_digital.git
cd tinkerspace_digital
pnpm install
pnpm dev:mock
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Local development without private backend access

Use:

```bash
pnpm dev:mock
```

This starts:

- the React dev server on `http://localhost:3000`
- a local mock API server on `http://localhost:4010`

The mock server exposes the same read endpoints the screen uses in production:

- `GET /checkin/active`
- `GET /api/v1/display`

The seeded mock payloads include active makers, a live event, upcoming events, and a populated calendar so contributors can work on the UI without access to the internal TinkerHub services.

### Local setup with private backend access

If you have access to the real backend services:

```bash
cp .env.example .env
# fill in the values in .env
pnpm dev
```

### Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Base URL for maker/user data |
| `REACT_APP_SPACECALENDAR_API` | Space calendar API endpoint |
| `REACT_APP_SPACECALENDAR_API_KEY` | API key for the calendar service |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm dev:mock` | Start the development server with the built-in mock backend |
| `pnpm mock:server` | Start only the local mock backend on port `4010` |
| `pnpm build` | Create a production build |
| `pnpm build:mock` | Create a production build configured against local mock API URLs |
| `pnpm test` | Run tests |
| `pnpm deploy` | Build and publish to GitHub Pages (legacy; production uses Netlify) |

## Deployment (Netlify)

Production builds run on Netlify from the **`main`** branch. `netlify.toml` is already configured:

- **Build command:** `pnpm run build`
- **Publish directory:** `build`
- **Node version:** 22

Set these environment variables in the Netlify site dashboard (**Site configuration → Environment variables**):

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Base URL for maker/user data |
| `REACT_APP_SPACECALENDAR_API` | Space calendar API endpoint |
| `REACT_APP_SPACECALENDAR_API_KEY` | API key for the calendar service |

If the Netlify build fails on Corepack/pnpm version resolution, add `COREPACK_INTEGRITY_KEYS=0` as a build environment variable.

## Contributing

### For contributors

1. Fork [tinkerhub/tinkerspace_digital](https://github.com/tinkerhub/tinkerspace_digital) on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/tinkerspace_digital.git
   cd tinkerspace_digital
   ```
3. Add the upstream remote and create a branch off `develop`:
   ```bash
   git remote add upstream https://github.com/tinkerhub/tinkerspace_digital.git
   git fetch upstream
   git checkout -b your-feature-branch upstream/develop
   ```
4. Make your changes, then commit and push to your fork:
   ```bash
   git add .
   git commit -m "describe your change"
   git push origin your-feature-branch
   ```
5. Open a pull request into **`develop`** on `tinkerhub/tinkerspace_digital`.

Keep PRs focused and test locally with `pnpm dev` and `pnpm build` before submitting.

### For maintainers

- **`develop`** is the integration branch — all contributor PRs land here first.
- **`main`** is the production branch — merging to `main` triggers the Netlify production deploy.
- After changes on `develop` are tested and verified, merge `develop` → `main` to release to production.
