# jonathanthom.com

This is the source code for [my personal website](https://jonathanthom.com).

### Setup

```bash
pnpm run setup
```

### Running Locally

```bash
pnpm dev       # Development with auto-reload
# or
pnpm start     # Production server
```

## Image Optimization

To optimize images for the web, you can use the `optimize-images.sh` script.

### Usage

```bash
./scripts/optimize-images.sh [directory] [quality]
```

- `directory`: (Optional) The directory containing the images to optimize. Defaults to `photos/`.
- `quality`: (Optional) The quality of the optimized images. Defaults to `85`.

### Requirements

This script requires the `imagemagick` library. You can install it with Homebrew on macOS or with `apt-get` on Debian/Ubuntu.

**macOS (Homebrew):**
```bash
brew install imagemagick
```

## Useful Commands

```bash
# Linting
pnpm run lint              # Run all linters
pnpm run lint:fix          # Fix CSS issues

# Testing
pnpm test                  # Unit tests
pnpm run test:e2e          # E2E tests
pnpm run test:e2e:ui       # E2E tests (UI mode)
pnpm run test:a11y         # Accessibility tests
pnpm run ci                # Run all tests

