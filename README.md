# Jonathan Thom's Personal Website

This is the source code for my personal website, jonathanthom.com.

## Development

This project uses [pnpm](https://pnpm.io/) as the package manager. To run the website locally:

```bash
pnpm install
pnpm start
```

### Prerequisites

- Node.js 24.9.0 (managed via `.node-version` and `.tool-versions` files)
- pnpm 10+ (install with `npm install -g pnpm`)

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

**Debian/Ubuntu:**
```bash
sudo apt-get install imagemagick
```

## Linting

This project uses Stylelint for CSS and HTMLHint for HTML to maintain code quality and consistency.

### Commands

- **Lint CSS:**
  ```bash
  pnpm run lint:css
  ```
- **Lint HTML:**
  ```bash
  pnpm run lint:html
  ```
- **Run All Linters:**
  ```bash
  pnpm run lint
  ```
- **Fix CSS Issues (where possible):**
  ```bash
  pnpm run lint:fix
  ```

### Accessibility Testing

This project uses [Pa11y](https://pa11y.org/) for automated accessibility testing.

- **Run Accessibility Tests:**
  ```bash
  pnpm run test:a11y
  ```

## Testing

This project uses Jest for unit testing and Playwright for end-to-end testing.

### Unit Tests

- **Run Unit Tests:**
  ```bash
  pnpm test
  ```

### E2E Tests

End-to-end tests are written with Playwright and include:
- Functional testing of all pages
- Lightbox interaction testing
- Visual regression testing with snapshots
- Responsive design testing across multiple viewports

- **Run E2E Tests:**
  ```bash
  pnpm run test:e2e
  ```
- **Run E2E Tests in UI Mode:**
  ```bash
  pnpm run test:e2e:ui
  ```
- **Run E2E Tests in Headed Mode:**
  ```bash
  pnpm run test:e2e:headed
  ```
- **Update Visual Snapshots:**
  ```bash
  pnpm run test:e2e:update-snapshots
  ```

## Deployment (Heroku)

This website is deployed to Heroku via a continuous integration (CI) step. The `Procfile` in the root directory specifies how to run the application.

### Heroku Configuration

The project uses:
- **Node.js 24.9.0** (specified in `.node-version` and read by Heroku buildpack)
- **pnpm** as package manager (Heroku automatically detects `pnpm-lock.yaml` and uses pnpm)

The CI/CD pipeline runs all tests in parallel (linting, unit tests, E2E tests, and accessibility tests) before deploying to Heroku. All tests must pass for deployment to proceed.
