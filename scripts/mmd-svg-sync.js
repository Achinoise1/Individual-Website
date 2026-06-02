#!/usr/bin/env node
// scripts/mmd-svg-sync.js
// Watches .mmd files and automatically compiles them to .svg on save.

'use strict';

const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const rootDir = path.resolve(__dirname, '..');

/**
 * Compile a .mmd file to .svg using npx mmdc.
 * @param {string} relPath - Relative path from project root (e.g. "docs/foo/bar.mmd")
 */
function compile(relPath) {
  const svgRelPath = relPath.replace(/\.mmd$/, '.svg');
  console.log(`[mmd-svg-sync] compiling ${relPath} → ${svgRelPath}`);

  const proc = spawn('npx', ['mmdc', '-i', relPath, '-o', svgRelPath], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  proc.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  proc.on('close', (code) => {
    if (code === 0) {
      console.log(`[mmd-svg-sync] ✓ ${svgRelPath}`);
    } else {
      console.error(`[mmd-svg-sync] ✗ ${relPath} (exit ${code})`);
      if (stderr.trim()) {
        console.error(stderr.trim());
      }
    }
  });

  proc.on('error', (err) => {
    console.error(`[mmd-svg-sync] failed to spawn mmdc: ${err.message}`);
  });
}

const watcher = chokidar.watch(['docs/**/*.mmd', 'blog/**/*.mmd'], {
  cwd: rootDir,
  ignoreInitial: false,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

watcher.on('add', (relPath) => {
  compile(relPath);
});

watcher.on('change', (relPath) => {
  compile(relPath);
});

console.log('[mmd-svg-sync] watching docs/**/*.mmd and blog/**/*.mmd ...');
