#!/usr/bin/env bun

import { join, dirname } from 'path';

const PROJECT_DIR = dirname(dirname(import.meta.path));
const HTML_FILE = join(PROJECT_DIR, 'now', 'index.html');

async function main() {
  const entry = process.argv.slice(2).join(' ').trim();

  if (!entry) {
    process.stdout.write('What\'s going on? ');
    const reader = Bun.stdin.stream().getReader();
    const { value } = await reader.read();
    reader.releaseLock();
    const input = new TextDecoder().decode(value).trim();
    if (!input) {
      console.error('Error: Entry cannot be empty.');
      process.exit(1);
    }
    return addEntry(input);
  }

  return addEntry(entry);
}

async function addEntry(text) {
  const today = new Date().toISOString().split('T')[0];
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const paragraphs = escaped.split('\n').filter(Boolean).map(p => `                    <p>${p}</p>`).join('\n');

  const article = `                <article>\n                    <time datetime="${today}">${today}</time>\n${paragraphs}\n                </article>`;

  const htmlContent = await Bun.file(HTML_FILE).text();
  const marker = '<div class="changelog" data-changelog>';
  const insertPoint = htmlContent.indexOf(marker) + marker.length;

  const newHtml =
    htmlContent.slice(0, insertPoint) +
    '\n' + article +
    htmlContent.slice(insertPoint);

  await Bun.write(HTML_FILE, newHtml);

  console.log();
  console.log(`Added entry for ${today}.`);
  console.log();
  console.log("Don't forget to commit:");
  console.log(`  git add now/index.html`);
  console.log(`  git commit -m "Now: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`);
}

main();
