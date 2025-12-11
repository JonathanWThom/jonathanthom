# jonathanthom.com

Source code for [jonathanthom.com](https://jonathanthom.com).

## Commands

```bash
# Setup
bun run setup

# Development
bun dev                   # Dev server with auto-reload
bun start                 # Production server

# Testing & Linting
bun run ci                # Run all tests
bun test                  # Unit tests
bun run test:e2e          # E2E tests (includes accessibility)
bun run test:e2e:ui       # E2E tests (UI mode)
bun run lint              # Run linters
bun run lint:fix          # Fix CSS issues

# Images
./scripts/add-photo.sh /path/to/photo.jpg  # Add photo to gallery (requires imagemagick)
./scripts/optimize-images.sh [directory]   # Batch optimize images
```
