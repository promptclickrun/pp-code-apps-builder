#!/usr/bin/env node

/**
 * validate.js — Pre-publish validation for the skill package
 * Ensures all required files exist and manifests are valid JSON.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

let errors = 0;

function check(path, label) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    console.error(`  ✗ MISSING: ${label} (${path})`);
    errors++;
  } else {
    console.log(`  ✓ ${label}`);
  }
}

function checkJson(path, label) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    console.error(`  ✗ MISSING: ${label} (${path})`);
    errors++;
    return;
  }
  try {
    JSON.parse(readFileSync(full, 'utf8'));
    console.log(`  ✓ ${label} (valid JSON)`);
  } catch (e) {
    console.error(`  ✗ INVALID JSON: ${label} — ${e.message}`);
    errors++;
  }
}

console.log('=== Validating Power Apps Code Apps Skill Package ===\n');

console.log('Manifests:');
checkJson('package.json', 'package.json');
checkJson('skill-manifest.json', 'skill-manifest.json');
checkJson('copilot-extensions.json', 'copilot-extensions.json');
checkJson('.github/copilot-skills.json', 'copilot-skills.json');
checkJson('claude-skill-manifest.json', 'claude-skill-manifest.json');

console.log('\nSkill files:');
check('.agents/skills/power-apps-code-apps/SKILL.md', 'SKILL.md');
check('.agents/skills/power-apps-code-apps/README.md', 'README.md');
check('.agents/skills/power-apps-code-apps/references/frontend.md', 'frontend reference');
check('.agents/skills/power-apps-code-apps/references/backend-data.md', 'backend-data reference');
check('.agents/skills/power-apps-code-apps/references/infra-ops.md', 'infra-ops reference');

console.log('\nAgent files:');
check('.github/agents/power-apps-code-apps.agent.md', 'orchestrator agent');
check('.github/agents/pa-frontend.agent.md', 'pa-frontend');
check('.github/agents/pa-backend.agent.md', 'pa-backend');
check('.github/agents/pa-infra.agent.md', 'pa-infra');
check('.github/agents/pa-business-analyst.agent.md', 'pa-business-analyst');
check('.github/agents/pa-architect.agent.md', 'pa-architect');
check('.github/agents/pa-product-manager.agent.md', 'pa-product-manager');

console.log('\nInstaller:');
check('bin/install.js', 'bin/install.js');

console.log('\nPlatform files:');
check('CLAUDE.md', 'CLAUDE.md');
check('LICENSE', 'LICENSE');

console.log(`\n=== ${errors === 0 ? 'All checks passed ✓' : `${errors} error(s) found ✗`} ===`);
process.exit(errors > 0 ? 1 : 0);
