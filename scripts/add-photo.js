#!/usr/bin/env bun

import sharp from 'sharp';
import { basename, join, dirname } from 'path';
import { existsSync } from 'fs';

const QUALITY = 85;
const WIDTH = 1200;
const PROJECT_DIR = dirname(dirname(import.meta.path));
const PHOTOS_DIR = join(PROJECT_DIR, 'photos');
const OPTIMIZED_DIR = join(PHOTOS_DIR, 'optimized');
const HTML_FILE = join(PHOTOS_DIR, 'index.html');

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: bun run add-photo /path/to/photo.jpg');
    process.exit(1);
  }

  if (!existsSync(inputFile)) {
    console.error(`Error: File '${inputFile}' not found.`);
    process.exit(1);
  }

  const originalName = basename(inputFile);
  const filenameNoExt = originalName.replace(/\.[^.]+$/, '');
  const outputName = `${filenameNoExt}.jpg`;
  const outputPath = join(OPTIMIZED_DIR, outputName);

  const fullSizePath = join(PHOTOS_DIR, outputName);

  if (existsSync(outputPath) || existsSync(fullSizePath)) {
    console.error(`Error: '${outputName}' already exists in photos/`);
    console.error('Remove it first or rename your input file.');
    process.exit(1);
  }

  console.log();
  console.log(`Adding photo: ${originalName}`);
  console.log();

  process.stdout.write('Enter a description for this photo: ');
  const reader = Bun.stdin.stream().getReader();
  const { value } = await reader.read();
  reader.releaseLock();
  const description = new TextDecoder().decode(value).trim();

  if (!description) {
    console.error('Error: Description cannot be empty.');
    process.exit(1);
  }

  console.log();
  console.log('Processing image...');

  await sharp(inputFile)
    .rotate()
    .jpeg({ quality: 95 })
    .toFile(fullSizePath);

  console.log(`Created: photos/${outputName}`);

  await sharp(inputFile)
    .rotate()
    .resize(WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toFile(outputPath);

  console.log(`Created: photos/optimized/${outputName}`);

  const webpName = `${filenameNoExt}.webp`;
  await sharp(inputFile)
    .rotate()
    .resize(WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(join(OPTIMIZED_DIR, webpName));

  console.log(`Created: photos/optimized/${webpName}`);

  await sharp(inputFile)
    .rotate()
    .webp({ quality: 90 })
    .toFile(join(PHOTOS_DIR, webpName));

  console.log(`Created: photos/${webpName}`);

  const htmlContent = await Bun.file(HTML_FILE).text();

  const escapedDesc = description.replace(/"/g, '&quot;');
  const imgTag = `                <picture>\n                    <source srcset="/photos/optimized/${webpName}" type="image/webp">\n                    <img src="/photos/optimized/${outputName}" alt="${escapedDesc}" tabindex="0" title="${escapedDesc}" loading="lazy" decoding="async">\n                </picture>`;

  const marker = '<div class="photos" data-photos-container>';
  const insertPoint = htmlContent.indexOf(marker) + marker.length;

  const newHtml =
    htmlContent.slice(0, insertPoint) +
    '\n' + imgTag +
    htmlContent.slice(insertPoint);

  await Bun.write(HTML_FILE, newHtml);

  console.log();
  console.log('Done! Photo added to gallery.');
  console.log();
  console.log(`Preview: ${outputPath}`);
  console.log(`HTML added to: photos/index.html`);
  console.log();
  console.log("Don't forget to commit your changes:");
  console.log(`  git add photos/${outputName} photos/${webpName} photos/optimized/${outputName} photos/optimized/${webpName} photos/index.html`);
  console.log(`  git commit -m "Add photo: ${description}"`);
}

main();
