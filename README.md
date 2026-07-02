# TinkerSpace Digital

Digital display app for TinkerSpace — rotates between maker profiles and the event calendar on a kiosk-style screen.

**Live site:** [tinkerhub.github.io/tinkerspace_digital](https://tinkerhub.github.io/tinkerspace_digital/)

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11+ (`corepack enable` if needed)

This project uses pnpm only. `npm install` and `yarn` are blocked.

## Local setup

```bash
git clone https://github.com/tinkerhub/tinkerspace_digital.git
cd tinkerspace_digital
pnpm install
cp .env.example .env
# fill in the values in .env
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

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
| `pnpm build` | Create a production build |
| `pnpm test` | Run tests |
| `pnpm deploy` | Build and publish to GitHub Pages |

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
- **`main`** is the production branch — the live GitHub Pages build is deployed from `main`.
- After changes on `develop` are tested and verified, merge `develop` → `main` to release to production.
