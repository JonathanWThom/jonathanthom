#!/usr/bin/env bun

/**
 * Add a photo to the gallery
 * Usage: bun run add-photo /path/to/photo.jpg
 */

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

  // Copy full-size image (convert to jpg if needed)
  await sharp(inputFile)
    .jpeg({ quality: 95 })
    .toFile(fullSizePath);

  console.log(`Created: photos/${outputName}`);

  // Create optimized thumbnail
  await sharp(inputFile)
    .resize(WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toFile(outputPath);

  console.log(`Created: photos/optimized/${outputName}`);

  const htmlContent = await Bun.file(HTML_FILE).text();

  const escapedDesc = description.replace(/"/g, '&quot;');
  const imgTag = `                <img src="/photos/optimized/${outputName}" alt="${escapedDesc}" tabindex="0" title="${escapedDesc}">`;

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
  console.log(`  git add photos/${outputName} photos/optimized/${outputName} photos/index.html`);
  console.log(`  git commit -m "Add photo: ${description}"`);
}

main();
