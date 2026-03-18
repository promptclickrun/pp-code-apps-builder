# Power Apps Code Apps Skill

A multi-agent orchestrator skill for building, connecting, deploying, and managing **Power Apps Code Apps** (React/TypeScript on Power Platform). Distributed as an installable package for GitHub Copilot CLI, Claude Code, and VS Code.

## What's Included

```
pp-code-apps-builder/
├── package.json                      # npm package manifest
├── skill-manifest.json               # Unified skill manifest (cross-platform)
├── copilot-extensions.json           # GitHub Copilot Extensions manifest
├── claude-skill-manifest.json        # Claude skill manifest
├── .claude-plugin/
│   ├── plugin.json                   # Claude Code plugin manifest
│   └── marketplace.json              # Claude Code marketplace catalog
├── CLAUDE.md                         # Claude Code project instructions
├── .github/copilot-instructions.md   # Copilot CLI project instructions
├── LICENSE                           # MIT license
├── bin/
│   ├── install.js                    # Cross-platform Node.js installer
│   └── validate.js                   # Pre-publish validation
├── skills/power-apps-code-apps/      # Plugin skills (Claude Code plugin system)
│   ├── SKILL.md                      # Orchestrator — routes to 6 agents
│   └── references/
│       ├── frontend.md               # Scaffolding, migration, context, embedding, UI
│       ├── backend-data.md           # Dataverse, SQL, SharePoint, Copilot Studio, metadata
│       └── infra-ops.md              # ALM, CSP, App Insights, telemetry, Azure Functions
├── .agents/skills/power-apps-code-apps/  # VS Code Copilot skill location
├── .github/
│   ├── copilot-skills.json           # GitHub Copilot skill index
│   ├── copilot-instructions.md       # Copilot CLI auto-loaded instructions
│   ├── skills/power-apps-code-apps/  # Copilot CLI skill location
│   └── agents/
│       ├── power-apps-code-apps.agent.md   # Orchestrator agent
│       ├── pa-frontend.agent.md            # React/TypeScript/Vite specialist
│       ├── pa-backend.agent.md             # Data sources & CRUD specialist
│       ├── pa-infra.agent.md               # Deployment, ALM & security specialist
│       ├── pa-business-analyst.agent.md    # Requirements & data modeling
│       ├── pa-architect.agent.md           # Solution architecture & design
│       └── pa-product-manager.agent.md     # Roadmap, planning & releases
└── .claude/skills/power-apps-code-apps/    # Claude Code standalone skill location
```

## Installation

### Claude Code — Plugin Marketplace (Recommended)

Claude Code has a full plugin marketplace system. Add this repo as a marketplace and install the skill as a plugin:

```bash
# Inside a Claude Code session:

# 1. Add the marketplace
/plugin marketplace add promptclickrun/pp-code-apps-builder

# 2. Install the plugin
/plugin install power-apps-code-apps@promptclickrun-pp-code-apps-builder

# 3. Reload to activate
/reload-plugins

# Then use it:
/power-apps-code-apps:power-apps-code-apps scaffold a new code app with Dataverse
```

You can also browse and install interactively:
```bash
/plugin          # Opens the plugin manager UI — go to Discover tab
```

### Claude Code — Standalone Skills

Copy skill files directly into your project (no plugin system required):

```bash
# Using the Node.js installer
npx pp-code-apps-builder --target claude

# Or from GitHub directly
npx github:promptclickrun/pp-code-apps-builder --target claude

# Or install to your personal skills (all projects)
npx pp-code-apps-builder --target claude --scope user
```

This copies the skill to `.claude/skills/power-apps-code-apps/` and `CLAUDE.md`.

### GitHub Copilot CLI — Skills & Agents

Copilot CLI discovers skills from `.github/skills/` and agents from `.github/agents/` automatically. Clone or install the files into your project:

```bash
# Using the Node.js installer
npx pp-code-apps-builder --target copilot

# Or from GitHub directly
npx github:promptclickrun/pp-code-apps-builder --target copilot

# Or install to your personal skills (all projects)
npx pp-code-apps-builder --target copilot --scope user
```

Once installed, Copilot CLI picks up the skill automatically:
```bash
copilot
# Then in the session:
/power-apps-code-apps scaffold a new code app with Dataverse
```

The installer also copies `.github/copilot-instructions.md` and agent files (`.github/agents/pa-*.agent.md`).

### VS Code — GitHub Copilot Chat

```bash
# Install for both Copilot and Claude
npx pp-code-apps-builder --target all

# Or from GitHub
npx github:promptclickrun/pp-code-apps-builder --target all
```

Then use `/power-apps-code-apps` in Copilot Chat.

### All Platforms at Once

```bash
npx pp-code-apps-builder --target all
```

### Manual Copy

| Platform | Skill Location | Agent Location | Instructions File |
|----------|---------------|----------------|-------------------|
| **Copilot CLI** | `.github/skills/power-apps-code-apps/` | `.github/agents/` | `.github/copilot-instructions.md` |
| **Copilot CLI (personal)** | `~/.copilot/skills/power-apps-code-apps/` | — | `~/.copilot/copilot-instructions.md` |
| **VS Code Copilot** | `.agents/skills/power-apps-code-apps/` | `.github/agents/` | `.github/copilot-instructions.md` |
| **Claude Code** | `.claude/skills/power-apps-code-apps/` | — | `CLAUDE.md` |
| **Claude Code (personal)** | `~/.claude/skills/power-apps-code-apps/` | — | — |
| **Claude Code (plugin)** | Via `/plugin marketplace add` | — | — |

## Manifests

| File | Purpose | Platform |
|------|---------|----------|
| `package.json` | npm registry distribution, `npx` installer | npm / GitHub Packages |
| `skill-manifest.json` | Unified skill descriptor (cross-platform) | All |
| `copilot-extensions.json` | Copilot Extensions registration | GitHub Copilot |
| `.github/copilot-skills.json` | Skill index for GitHub repo discovery | GitHub Copilot |
| `.github/copilot-instructions.md` | Auto-loaded Copilot CLI instructions | GitHub Copilot CLI |
| `claude-skill-manifest.json` | Claude skill registration | Claude Code / CLI |
| `.claude-plugin/plugin.json` | Claude Code plugin manifest | Claude Code plugin system |
| `.claude-plugin/marketplace.json` | Claude Code marketplace catalog | Claude Code plugin marketplace |
| `CLAUDE.md` | Project-level instructions for Claude | Claude Code / CLI |

## Publishing

### npm Registry

```bash
# Validate all files
node bin/validate.js

# Publish to npm
npm publish --access public

# Or use CI/CD — create a GitHub Release to trigger .github/workflows/publish.yml
```

### GitHub Packages

The publish workflow automatically publishes to GitHub Packages on release. Ensure `NPM_TOKEN` secret is set for npm registry.

## Usage

### Copilot VS Code Chat

Type `/` in the chat input and select **power-apps-code-apps**, then describe your task:

```
/power-apps-code-apps scaffold a new code app with Dataverse
/power-apps-code-apps connect to Azure SQL with stored procedures
/power-apps-code-apps plan ALM strategy for production deployment
```

Or invoke a specific agent directly from the agent picker:

- `@pa-frontend` — UI, scaffolding, migration
- `@pa-backend` — Data connections, CRUD
- `@pa-infra` — Deployment, CSP, telemetry
- `@pa-business-analyst` — Requirements, data modeling
- `@pa-architect` — Solution design, integration patterns
- `@pa-product-manager` — Roadmap, sprint planning

### Copilot CLI

```bash
gh copilot suggest "scaffold a new Power Apps code app with Dataverse"
```

The skill is discovered by description keywords in the agent files.

### Claude Code / Claude Code CLI

After installing to `.claude/skills/`, Claude Code discovers the skill automatically:

```bash
claude "help me build a code app that connects to SharePoint"
```

## Example Prompts by Domain

| Domain | Example Prompt |
|--------|---------------|
| Frontend | "Migrate my code app from v0.3 to v1.0" |
| Frontend | "How do I embed my code app in a model-driven app?" |
| Backend | "Connect to Dataverse Accounts table with OData filtering" |
| Backend | "Add a SQL stored procedure as a data source" |
| Backend | "Invoke a Copilot Studio agent from my code app" |
| Infra | "Set up App Insights telemetry with KQL dashboards" |
| Infra | "Configure CSP to allow iframe embedding from contoso.com" |
| Business | "Write requirements for an asset management app" |
| Architecture | "Design the data source topology for a multi-environment app" |
| Product | "Create a go-live checklist for production deployment" |

## Knowledge Sources

This skill is trained on 17 how-to documentation files covering the full Power Apps Code Apps platform:

| Category | Topics |
|----------|--------|
| **Frontend** | Scaffolding (PAC + npm CLI), v1 migration, Context API, iframe embedding, Fluent UI |
| **Backend** | Dataverse CRUD, Azure SQL, SharePoint, Copilot Studio, table metadata, connectors |
| **Infrastructure** | ALM/solutions, CSP configuration, App Insights, CLI telemetry, Azure Functions + APIM |
