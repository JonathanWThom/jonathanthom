#!/usr/bin/env bun

/**
 * Add a photo to the gallery
 * Usage: bun scripts/add-photo.ts /path/to/photo.jpg
 *
 * This script:
 * 1. Prompts for a description
 * 2. Optimizes the image (1200px wide, 85% quality, .jpg format)
 * 3. Copies to photos/optimized/
 * 4. Adds the HTML to the top of the photo gallery
 */

import { $ } from "bun";
import { basename, join, dirname } from "path";
import { existsSync } from "fs";

const QUALITY = 85;
const PROJECT_DIR = dirname(dirname(import.meta.path));
const OPTIMIZED_DIR = join(PROJECT_DIR, "photos", "optimized");
const HTML_FILE = join(PROJECT_DIR, "photos", "index.html");

async function main() {
  // Check if imagemagick is installed
  try {
    await $`which magick`.quiet();
  } catch {
    console.error("Error: imagemagick is not installed.");
    console.error("Install with: brew install imagemagick");
    process.exit(1);
  }

  // Check if a file was provided
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: bun scripts/add-photo.ts /path/to/photo.jpg");
    process.exit(1);
  }

  // Check if file exists
  if (!existsSync(inputFile)) {
    console.error(`Error: File '${inputFile}' not found.`);
    process.exit(1);
  }

  // Get filenames
  const originalName = basename(inputFile);
  const filenameNoExt = originalName.replace(/\.[^.]+$/, "");
  const outputName = `${filenameNoExt}.jpg`;
  const outputPath = join(OPTIMIZED_DIR, outputName);

  // Check if output already exists
  if (existsSync(outputPath)) {
    console.error(`Error: '${outputName}' already exists in photos/optimized/`);
    console.error("Remove it first or rename your input file.");
    process.exit(1);
  }

  // Prompt for description
  console.log();
  console.log(`Adding photo: ${originalName}`);
  console.log();

  process.stdout.write("Enter a description for this photo: ");
  const description = (await Bun.stdin.text()).trim().split('\n')[0];

  if (!description) {
    console.error("Error: Description cannot be empty.");
    process.exit(1);
  }

  // Optimize the image
  console.log();
  console.log("Optimizing image...");
  await $`magick ${inputFile} -resize 1200x -quality ${QUALITY} ${outputPath}`;
  console.log(`Created: photos/optimized/${outputName}`);

  // Read the HTML file
  const htmlContent = await Bun.file(HTML_FILE).text();

  // Build the new img tag
  const escapedDesc = description.replace(/"/g, "&quot;");
  const imgTag = `                <img src="/photos/optimized/${outputName}" alt="${escapedDesc}" tabindex="0" title="${escapedDesc}">`;

  // Insert after the data-photos-container div
  const marker = '<div class="photos" data-photos-container>';
  const insertPoint = htmlContent.indexOf(marker) + marker.length;

  const newHtml =
    htmlContent.slice(0, insertPoint) +
    "\n" + imgTag +
    htmlContent.slice(insertPoint);

  // Write the updated HTML
  await Bun.write(HTML_FILE, newHtml);

  console.log();
  console.log("Done! Photo added to gallery.");
  console.log();
  console.log(`Preview: ${outputPath}`);
  console.log(`HTML added to: photos/index.html`);
  console.log();
  console.log("Don't forget to commit your changes:");
  console.log(`  git add photos/optimized/${outputName} photos/index.html`);
  console.log(`  git commit -m "Add photo: ${description}"`);
}

main();
