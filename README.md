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
bun run ci                # Lint + test
bun run test              # E2E tests (includes accessibility)
bun run lint              # Run linters

# Images
bun run add-photo /path/to/photo.jpg   # Add photo to gallery
```
