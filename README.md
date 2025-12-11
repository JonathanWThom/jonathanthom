# jonathanthom.com

Source code for [jonathanthom.com](https://jonathanthom.com).

## Setup

```bash
./bin/setup   # Installs Bun if needed, then installs dependencies
```

## Commands

```bash
# Development
bun dev                   # Dev server with auto-reload
bun start                 # Production server

# Testing & Linting
bun run ci                # Run all tests
bun test                  # Unit tests
bun run test:e2e          # E2E tests (includes accessibility)
bun run lint              # Run linters

# Images
bun run add-photo /path/to/photo.jpg   # Add photo to gallery
```
