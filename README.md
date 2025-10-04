# Jonathan Thom's Personal Website

This is the source code for my personal website, jonathanthom.com.

## Development

To run the website locally, you can use the `npm run start` command. This will start a local web server.

```bash
npm install
npm run start
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

**Debian/Ubuntu:**
```bash
sudo apt-get install imagemagick
```

## Linting

This project uses Stylelint for CSS and HTMLHint for HTML to maintain code quality and consistency.

### Commands

- **Lint CSS:**
  ```bash
  npm run lint:css
  ```
- **Lint HTML:**
  ```bash
  npm run lint:html
  ```
- **Run All Linters:**
  ```bash
  npm run lint
  ```
- **Fix CSS Issues (where possible):**
  ```bash
  npm run lint:fix
  ```

## Deployment (Heroku)

This website is deployed to Heroku via a continuous integration (CI) step. The `Procfile` in the root directory specifies how to run the application.
