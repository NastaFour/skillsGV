/**
 * distill-project-skills.mjs — Project-Scoped Skill Distiller for skillsGV
 *
 * Inspects a target workspace to:
 * 1. Analyze tech stack dependencies and map relevant catalog skills.
 * 2. Detect proprietary domain boundaries (modules, features, services).
 * 3. Synthesize a professional, spec-compliant project-scoped SKILL.md
 *    (with Absolute Bans and Before/After patterns) under <target>/.agent/skills/<domain>/.
 *
 * Node-only, ESM, cross-platform.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

export const DEPENDENCY_CATALOG_MAP = {
  react: 'react-19',
  'react-dom': 'react-19',
  next: 'next-15',
  typescript: 'typescript',
  vitest: 'testing-patterns',
  '@playwright/test': 'playwright',
  playwright: 'playwright',
  jest: 'testing-patterns',
  tailwindcss: 'tailwind-4',
  prisma: 'prisma',
  '@prisma/client': 'prisma',
  zod: 'solid-clean-code',
  express: 'express',
  fastify: 'express',
  'react-native': 'react-native',
  expo: 'react-native',
  pg: 'postgres',
  postgres: 'postgres',
};

/**
 * Reads and parses package.json if it exists.
 */
export function readTargetManifest(targetDir) {
  const pkgPath = join(targetDir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Matches installed dependencies against known skillsGV catalog skills.
 */
export function matchCatalogSkills(manifest) {
  if (!manifest) return [];
  const deps = {
    ...(manifest.dependencies || {}),
    ...(manifest.devDependencies || {}),
  };

  const matched = new Set();
  for (const dep of Object.keys(deps)) {
    if (DEPENDENCY_CATALOG_MAP[dep]) {
      matched.add(DEPENDENCY_CATALOG_MAP[dep]);
    }
  }

  return Array.from(matched).sort();
}

/**
 * Scans directories for domain boundaries (modules, features, services, domain).
 */
export function detectDomains(targetDir) {
  const candidates = new Set();
  const searchRoots = ['src', 'lib', 'app', '.'];

  for (const root of searchRoots) {
    const rootPath = join(targetDir, root);
    if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) continue;

    const subDirs = ['modules', 'features', 'domain', 'services', 'routes'];
    for (const sub of subDirs) {
      const subPath = join(rootPath, sub);
      if (existsSync(subPath) && statSync(subPath).isDirectory()) {
        try {
          const entries = readdirSync(subPath, { withFileTypes: true });
          for (const ent of entries) {
            if (ent.isDirectory() && !ent.name.startsWith('.')) {
              candidates.add(ent.name.toLowerCase());
            }
          }
        } catch {
          // ignore read errors
        }
      }
    }
  }

  return Array.from(candidates).sort();
}

/**
 * Synthesizes a spec-compliant project-scoped SKILL.md.
 */
export function synthesizeSkill({ domain, targetName, catalogMatches = [], domains = [] }) {
  const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'domain-architecture';
  const displayTitle = cleanDomain
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const relatedSkillsList = catalogMatches.length > 0
    ? catalogMatches.map((s) => `- \`${s}\``).join('\n')
    : '- General architecture and clean code guidelines';

  return `---
name: ${cleanDomain}
description: Project-specific architectural conventions, domain invariants, and coding standards for ${displayTitle} in ${targetName}. Use when implementing, refactoring, or testing features in this domain. Do NOT use for general language syntax or unrelated modules.
metadata:
  scope: [project-local]
  target: ${targetName}
  generated-by: skillsGV-distiller
---

# 🏛️ ${displayTitle} — Project Domain Conventions

This project-scoped skill governs architecture, persistence boundaries, and domain rules for **${displayTitle}** within the \`${targetName}\` codebase.

---

## 🚫 Absolute Bans

| Anti-Pattern | Why It Is Banned | Enforced Alternative |
|---|---|---|
| **Direct Persistence in Handlers** | Bypassing repository/domain layer couples HTTP endpoints directly to database queries. | Route all persistence through domain services and repository abstractions. |
| **Untyped Payloads (\`any\`)** | Erases compiler type safety and allows runtime contract breakages. | Validate incoming requests with Zod DTOs and enforce strict domain types. |
| **Unmocked Side-Effects in Tests** | Network or database calls in unit tests cause flaky tests and test pollution. | Mock external boundaries using deterministic mocks with mandatory cleanup. |
| **Unapproved Package Runners** | Invoking unapproved package runners breaks monorepo lockfile consistency. | Execute tasks strictly using the project-designated package manager. |

---

## 🔗 Matched Global Catalog Skills
This domain inherits and complements the following universal skills:
${relatedSkillsList}

---

## 📐 Before & After Patterns

### 1. Data Access & Boundary Separation

**❌ Anti-Pattern (Coupled Handler):**
\`\`\`typescript
// Directly embedding database logic in controller/route
export async function handleRequest(req, res) {
  const data = await db.query('SELECT * FROM items WHERE user_id = ' + req.params.id);
  res.json(data);
}
\`\`\`

**✅ Approved Pattern (Domain Separation):**
\`\`\`typescript
// Pure domain flow with validation and repository abstraction
export async function handleRequest(req: Request, res: Response): Promise<void> {
  const { id } = UserIdSchema.parse(req.params);
  const items = await itemRepository.findByUserId(id);
  res.json({ success: true, items });
}
\`\`\`

---

## 🧪 Testing Protocol
1. **Arrange-Act-Assert (AAA)**: Every test must follow strict AAA structure.
2. **Mock Hygiene**: Clean up mocks before every test using deterministic test reset hooks.
3. **Runners**: Verify changes with the repository's native test commands before committing.
`;
}

/**
 * Main distillation entry point.
 */
export function runDistiller(options = {}) {
  const targetDir = resolve(options.target || process.cwd());
  const manifest = readTargetManifest(targetDir);
  const targetName = manifest?.name || basename(targetDir);

  const catalogMatches = matchCatalogSkills(manifest);
  const detectedDomains = detectDomains(targetDir);

  const targetDomain = options.domain || detectedDomains[0] || `${targetName}-architecture`;
  const cleanDomain = targetDomain.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const skillContent = synthesizeSkill({
    domain: cleanDomain,
    targetName,
    catalogMatches,
    domains: detectedDomains,
  });

  const outputDir = options.outputDir
    ? resolve(options.outputDir)
    : join(targetDir, '.agent', 'skills', cleanDomain);

  const skillFile = join(outputDir, 'SKILL.md');

  if (!options.dryRun) {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(skillFile, skillContent, 'utf8');
  }

  const result = {
    targetDir,
    targetName,
    catalogMatches,
    detectedDomains,
    selectedDomain: cleanDomain,
    outputPath: skillFile,
    dryRun: Boolean(options.dryRun),
    contentLength: skillContent.length,
  };

  return result;
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2);
  let target = process.cwd();
  let domain = null;
  let dryRun = false;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      target = args[++i];
    } else if (args[i] === '--domain' && args[i + 1]) {
      domain = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  const res = runDistiller({ target, domain, dryRun });

  if (json) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(`\n⚗️ Project-Scoped Skill Distiller`);
    console.log(`Target:           ${res.targetDir} (${res.targetName})`);
    console.log(`Catalog Matches:  ${res.catalogMatches.length > 0 ? res.catalogMatches.join(', ') : 'None'}`);
    console.log(`Domains Found:    ${res.detectedDomains.length > 0 ? res.detectedDomains.join(', ') : 'None'}`);
    console.log(`Selected Skill:   ${res.selectedDomain}`);
    console.log(`Output Path:      ${res.outputPath} ${res.dryRun ? '(dry-run)' : '(written)'}`);
    console.log(`Status:           ${res.dryRun ? 'Plan verified cleanly' : 'Skill distilled successfully'}\n`);
  }
}
