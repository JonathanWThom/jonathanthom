# jonathanthom.com

Source code for [jonathanthom.com](https://jonathanthom.com).

## Commands

```bash
# Setup
pnpm run setup

# Development
pnpm dev                   # Dev server with auto-reload
pnpm start                 # Production server

# Testing & Linting
pnpm run ci                # Run all tests
pnpm test                  # Unit tests
pnpm run test:e2e          # E2E tests (includes accessibility)
pnpm run test:e2e:ui       # E2E tests (UI mode)
pnpm run lint              # Run linters
pnpm run lint:fix          # Fix CSS issues

# Images
./scripts/optimize-images.sh [directory] [quality]  # Requires imagemagick

