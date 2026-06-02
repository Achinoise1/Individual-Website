#!/usr/bin/env node
// scripts/md-image-sync.js
// Watches markdown files and silently syncs image files when refs are renamed or removed.

'use strict';

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Map<filePath, Set<relativeImagePath>>
const imageRefMap = new Map();

/**
 * Parse all local image references from markdown content.
 * Returns a Set of relative paths (skips http/https/data: URLs).
 */
function parseImageRefs(content) {
  const refs = new Set();
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const p = m[1].trim();
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
      continue;
    }
    refs.add(p);
  }
  return refs;
}

/**
 * Resolve a relative image path against the markdown file's directory.
 */
function resolveImg(mdFile, imgRelPath) {
  return path.resolve(path.dirname(mdFile), imgRelPath);
}

/**
 * Read a file and return its content, or null on error.
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function onAdd(filePath) {
  const content = readFileSafe(filePath);
  if (content === null) return;
  imageRefMap.set(filePath, parseImageRefs(content));
}

function onChange(filePath) {
  const content = readFileSafe(filePath);
  if (content === null) return;

  const newRefs = parseImageRefs(content);
  const oldRefs = imageRefMap.get(filePath) ?? new Set();

  const removed = new Set([...oldRefs].filter((r) => !newRefs.has(r)));
  const added = new Set([...newRefs].filter((r) => !oldRefs.has(r)));

  // Rename detection: exactly 1 removed + 1 added, old exists, new does not
  if (removed.size === 1 && added.size === 1) {
    const [oldRel] = removed;
    const [newRel] = added;
    const oldAbs = resolveImg(filePath, oldRel);
    const newAbs = resolveImg(filePath, newRel);

    if (fs.existsSync(oldAbs) && !fs.existsSync(newAbs)) {
      try {
        fs.mkdirSync(path.dirname(newAbs), { recursive: true });
        fs.renameSync(oldAbs, newAbs);
        // Clean up empty source directory
        tryRmdir(path.dirname(oldAbs));
      } catch {
        // silently ignore
      }
      imageRefMap.set(filePath, newRefs);
      return;
    }
  }

  // Delete: files whose refs were removed and whose files still exist
  for (const rel of removed) {
    const absPath = resolveImg(filePath, rel);
    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
        tryRmdir(path.dirname(absPath));
      } catch {
        // silently ignore
      }
    }
  }

  imageRefMap.set(filePath, newRefs);
}

/**
 * Remove a directory if it is empty (best-effort, silent).
 */
function tryRmdir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      fs.rmdirSync(dirPath);
    }
  } catch {
    // silently ignore
  }
}

const watcher = chokidar.watch(['docs/**/*.md', 'blog/**/*.md'], {
  cwd: path.resolve(__dirname, '..'),
  ignoreInitial: false,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 150,
    pollInterval: 50,
  },
});

watcher.on('add', (relPath) => {
  const absPath = path.resolve(__dirname, '..', relPath);
  onAdd(absPath);
});

watcher.on('change', (relPath) => {
  const absPath = path.resolve(__dirname, '..', relPath);
  onChange(absPath);
});

watcher.on('unlink', (relPath) => {
  const absPath = path.resolve(__dirname, '..', relPath);
  imageRefMap.delete(absPath);
});

console.log('md-image-sync: watching docs/**/*.md and blog/**/*.md ...');
