# Repository Guidelines

## Project Structure & Module Organization

The web app lives in `src/` with entry `src/index.tsx` and route pages under `src/pages/`. Reusable view logic sits in `src/components/`, hooks in `src/hooks/`, and store atoms in `src/store/`. Static resources stay in `src/resources/` and `src/assets/`. End-to-end specs live in `tests/e2e/`. The Tauri wrapper and Rust build scripts live in `src-tauri/`. Shared documentation is in `docs/`; Vite-served assets remain in `public/`.

## Build, Test, and Development Commands

- `yarn install` installs dependencies and Husky hooks.
- `yarn dev` starts Vite at `http://localhost:5173` with hot reload.
- `yarn build` emits the production bundle in `dist/` (forces `CI=false`).
- `yarn lint` runs ESLint across TypeScript, JSX, and configs.
- `yarn prettier` formats the repo per `prettier.config.js`.
- `yarn test:e2e` runs the Playwright suite in `tests/e2e/`.

## Coding Style & Naming Conventions

Prettier enforces 2-space indentation, `singleQuote`, `semi: false`, and a 140-character print width; `@trivago/prettier-plugin-sort-imports` keeps imports grouped. ESLint requires `@typescript-eslint/consistent-type-imports` and flags unsorted imports. Name React components and directories in PascalCase (`src/components/Header/Header.tsx`), hooks with `use*`, stores with `*Store`, and constants in `UPPER_SNAKE_CASE`. Update `components.json` whenever UI aliases or design tokens change.

## Testing Guidelines

Playwright (`playwright.config.ts`) drives the E2E suite. Place scenarios under `tests/e2e/<feature>.spec.ts` and mirror user journeys in `describe` blocks. Generate new traces or screenshots only while debugging; keep the repo clean unless CI artifacts are required. Run `yarn dev` in a second terminal during test authoring, and use `npx playwright codegen` for quick scaffolds. Cover regressions for new flows and confirm mobile breakpoints via the bundled device projects when relevant.

## Commit & Pull Request Guidelines

Follow conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`) used throughout `git log`. Keep commits focused and run `yarn lint` before pushing; the Husky pre-commit hook mirrors lint-staged formatting. Pull requests should include a concise summary, screenshots or GIFs for UI changes, links to related issues, and notes on test coverage (`yarn test:e2e` results or rationale). Request review from domain maintainers (UI, stores, or Tauri) when touching their areas.

## Security & Configuration Tips

Never commit `.env` secrets; rely on local files loaded by Vite. When editing `src-tauri/`, audit permission scopes in `tauri.conf.json`. Coordinate with analytics owners before altering Mixpanel or router configuration.

## Agent Collaboration Notes

AI agents supporting this project must conduct maintainer conversations and produce planning artifacts in Chinese to align with the team's workflow.
