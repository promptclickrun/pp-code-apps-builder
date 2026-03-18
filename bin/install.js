#!/usr/bin/env node

/**
 * pp-code-apps-builder — Cross-platform installer for Power Apps Code Apps skill
 *
 * Install from GitHub (no npm publish required):
 *   npx github:promptclickrun/pp-code-apps-builder --target all
 *
 * Install from npm (if published):
 *   npx pp-code-apps-builder --target copilot|claude|all [--scope workspace|user] [--dest <path>] [--dry-run]
 */

import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');

// --- Argument parsing ---
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
}
const hasFlag = (name) => args.includes(`--${name}`);

const target = getArg('target', 'all');
const scope = getArg('scope', 'workspace');
const dest = getArg('dest', process.cwd());
const dryRun = hasFlag('dry-run');

if (hasFlag('help') || hasFlag('h')) {
  console.log(`
pp-code-apps-builder — Install Power Apps Code Apps skill + agents

Install from GitHub (no npm publish required):
  npx github:promptclickrun/pp-code-apps-builder --target all

Install from npm:
  npx pp-code-apps-builder --target <copilot|claude|all> [options]

Options:
  --target <copilot|claude|all>  Target platform (default: all)
  --scope <workspace|user>       Installation scope (default: workspace)
  --dest <path>                  Destination workspace root (default: cwd)
  --dry-run                      Show what would be copied without writing
  --help                         Show this help

Claude Code plugin (alternative — no installer needed):
  /plugin marketplace add promptclickrun/pp-code-apps-builder
`);
  process.exit(0);
}

console.log('=== Power Apps Code Apps Skill Installer ===');
console.log(`Target: ${target} | Scope: ${scope} | Dest: ${dest}`);
if (dryRun) console.log('  (dry run — no files will be written)\n');

// --- File copy helpers ---
function ensureDir(dir) {
  if (!dryRun && !existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyFile(src, destPath) {
  if (dryRun) {
    console.log(`  [dry-run] ${src} → ${destPath}`);
    return;
  }
  ensureDir(dirname(destPath));
  copyFileSync(src, destPath);
  console.log(`  ✓ ${destPath}`);
}

function writeFile(destPath, content) {
  if (dryRun) {
    console.log(`  [dry-run] CREATE ${destPath}`);
    return;
  }
  ensureDir(dirname(destPath));
  writeFileSync(destPath, content, 'utf8');
  console.log(`  ✓ ${destPath}`);
}

// --- Skill file sources ---
const SKILL_SRC = join(PKG_ROOT, '.agents', 'skills', 'power-apps-code-apps');
const AGENTS_SRC = join(PKG_ROOT, '.github', 'agents');
const CLAUDE_MD_SRC = join(PKG_ROOT, 'CLAUDE.md');

const SKILL_FILES = [
  'SKILL.md',
  'references/frontend.md',
  'references/backend-data.md',
  'references/infra-ops.md',
];

function getAgentFiles() {
  if (!existsSync(AGENTS_SRC)) return [];
  return readdirSync(AGENTS_SRC)
    .filter(f => f.startsWith('pa-') && f.endsWith('.agent.md'))
    .concat('power-apps-code-apps.agent.md')
    .filter(f => existsSync(join(AGENTS_SRC, f)));
}

function copySkill(destSkillDir) {
  console.log(`  Skill → ${destSkillDir}`);
  for (const file of SKILL_FILES) {
    copyFile(join(SKILL_SRC, file), join(destSkillDir, file));
  }
}

function copyAgents(destAgentsDir) {
  console.log(`  Agents → ${destAgentsDir}`);
  for (const file of getAgentFiles()) {
    copyFile(join(AGENTS_SRC, file), join(destAgentsDir, file));
  }
}

// --- Install targets ---
const home = homedir();

if (target === 'copilot' || target === 'all') {
  if (scope === 'workspace') {
    console.log('\n[Copilot] Installing to workspace...');
    copySkill(join(dest, '.agents', 'skills', 'power-apps-code-apps'));
    copySkill(join(dest, '.github', 'skills', 'power-apps-code-apps'));
    copyAgents(join(dest, '.github', 'agents'));

    // Copy copilot-skills.json
    const copilotSkillsJson = join(PKG_ROOT, '.github', 'copilot-skills.json');
    if (existsSync(copilotSkillsJson)) {
      copyFile(copilotSkillsJson, join(dest, '.github', 'copilot-skills.json'));
    }

    // Copy copilot-extensions.json
    const extJson = join(PKG_ROOT, 'copilot-extensions.json');
    if (existsSync(extJson)) {
      copyFile(extJson, join(dest, 'copilot-extensions.json'));
    }

    // Copy copilot-instructions.md (auto-loaded by Copilot CLI)
    const copilotInstructions = join(PKG_ROOT, '.github', 'copilot-instructions.md');
    if (existsSync(copilotInstructions)) {
      const destInstructions = join(dest, '.github', 'copilot-instructions.md');
      if (!existsSync(destInstructions)) {
        copyFile(copilotInstructions, destInstructions);
      } else {
        console.log('  ⓘ .github/copilot-instructions.md already exists, skipping');
      }
    }
  }
  if (scope === 'user') {
    console.log('\n[Copilot] Installing to user profile...');
    copySkill(join(home, '.copilot', 'skills', 'power-apps-code-apps'));
    copySkill(join(home, '.agents', 'skills', 'power-apps-code-apps'));
    console.log('  Note: User-level agents must be placed in your VS Code user prompts folder.');
  }
}

if (target === 'claude' || target === 'all') {
  if (scope === 'workspace') {
    console.log('\n[Claude] Installing to workspace...');
    copySkill(join(dest, '.claude', 'skills', 'power-apps-code-apps'));

    // Copy or create CLAUDE.md
    const claudeMdDest = join(dest, 'CLAUDE.md');
    if (!existsSync(claudeMdDest) && existsSync(CLAUDE_MD_SRC)) {
      copyFile(CLAUDE_MD_SRC, claudeMdDest);
    }

    // Copy claude-skill-manifest.json
    const claudeManifest = join(PKG_ROOT, 'claude-skill-manifest.json');
    if (existsSync(claudeManifest)) {
      copyFile(claudeManifest, join(dest, 'claude-skill-manifest.json'));
    }
  }
  if (scope === 'user') {
    console.log('\n[Claude] Installing to user profile...');
    copySkill(join(home, '.claude', 'skills', 'power-apps-code-apps'));
  }
}

// Copy unified skill-manifest.json
const unifiedManifest = join(PKG_ROOT, 'skill-manifest.json');
if (scope === 'workspace' && existsSync(unifiedManifest)) {
  copyFile(unifiedManifest, join(dest, 'skill-manifest.json'));
}

console.log('\n=== Installation complete ===');
console.log('Skill:  power-apps-code-apps');
console.log('Agents: pa-frontend, pa-backend, pa-infra, pa-business-analyst, pa-architect, pa-product-manager');
console.log('\nUsage:');
console.log('  Copilot CLI:  copilot → /power-apps-code-apps "scaffold a new code app"');
console.log('  Claude Code:  claude → /power-apps-code-apps "connect to Dataverse"');
console.log('  VS Code:      /power-apps-code-apps in Copilot Chat');
console.log('\nClaude Code plugin (alternative):');
console.log('  /plugin marketplace add promptclickrun/pp-code-apps-builder');
console.log('  /plugin install power-apps-code-apps@promptclickrun-pp-code-apps-builder');
