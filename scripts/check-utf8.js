#!/usr/bin/env node
/**
 * Scans the repo for non-UTF-8 text files and exits non-zero if any found.
 * Pure JS, no deps. Validates UTF-8 byte sequences strictly.
 */
const fs = require('fs');
const path = require('path');

// File globs to scan
const exts = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.mjs', '.cjs',
  '.md', '.yml', '.yaml', '.html', '.svg'
]);

const skipDirs = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo'
]);

function isTextExt(p) {
  return exts.has(path.extname(p).toLowerCase());
}

function readBytes(p) {
  try { return fs.readFileSync(p); } catch { return null; }
}

// Strict UTF-8 validator
function isValidUTF8(buf) {
  let i = 0;
  while (i < buf.length) {
    const b0 = buf[i];
    if (b0 <= 0x7F) { // ASCII
      i += 1; continue;
    }
    // 2-byte sequence: 110xxxxx 10xxxxxx
    if (b0 >= 0xC2 && b0 <= 0xDF) {
      if (i + 1 >= buf.length) return false;
      const b1 = buf[i + 1];
      if ((b1 & 0xC0) !== 0x80) return false;
      i += 2; continue;
    }
    // 3-byte sequence
    if (b0 === 0xE0) {
      if (i + 2 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2];
      if (!(b1 >= 0xA0 && b1 <= 0xBF) || (b2 & 0xC0) !== 0x80) return false;
      i += 3; continue;
    }
    if (b0 >= 0xE1 && b0 <= 0xEC) {
      if (i + 2 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2];
      if ((b1 & 0xC0) !== 0x80 || (b2 & 0xC0) !== 0x80) return false;
      i += 3; continue;
    }
    if (b0 === 0xED) { // exclude surrogates
      if (i + 2 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2];
      if (!(b1 >= 0x80 && b1 <= 0x9F) || (b2 & 0xC0) !== 0x80) return false;
      i += 3; continue;
    }
    if (b0 >= 0xEE && b0 <= 0xEF) {
      if (i + 2 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2];
      if ((b1 & 0xC0) !== 0x80 || (b2 & 0xC0) !== 0x80) return false;
      i += 3; continue;
    }
    // 4-byte sequence
    if (b0 === 0xF0) {
      if (i + 3 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
      if (!(b1 >= 0x90 && b1 <= 0xBF) || (b2 & 0xC0) !== 0x80 || (b3 & 0xC0) !== 0x80) return false;
      i += 4; continue;
    }
    if (b0 >= 0xF1 && b0 <= 0xF3) {
      if (i + 3 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
      if ((b1 & 0xC0) !== 0x80 || (b2 & 0xC0) !== 0x80 || (b3 & 0xC0) !== 0x80) return false;
      i += 4; continue;
    }
    if (b0 === 0xF4) {
      if (i + 3 >= buf.length) return false;
      const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
      if (!(b1 >= 0x80 && b1 <= 0x8F) || (b2 & 0xC0) !== 0x80 || (b3 & 0xC0) !== 0x80) return false;
      i += 4; continue;
    }
    return false; // invalid leading byte
  }
  return true;
}

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name.startsWith('.')) {
      if (skipDirs.has(it.name)) continue;
    }
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (skipDirs.has(it.name)) continue;
      walk(full);
    } else if (it.isFile()) {
      if (!isTextExt(full)) continue;
      const buf = readBytes(full);
      if (!buf) continue;
      if (!isValidUTF8(buf)) problems.push(full);
    }
  }
}

const root = process.argv[2] || process.cwd();
const problems = [];
walk(root);

if (problems.length) {
  console.error('Non-UTF-8 files found:');
  problems.forEach(p => console.error(' - ' + path.relative(root, p)));
  process.exit(1);
} else {
  console.log('All checked files are valid UTF-8.');
}

