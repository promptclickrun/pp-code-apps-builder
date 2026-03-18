# Power Apps Code Apps Skill

A multi-agent orchestrator skill for building, connecting, deploying, and managing **Power Apps Code Apps** (React/TypeScript on Power Platform). Distributed as an installable package for GitHub Copilot, Claude Code, and VS Code.

## What's Included

```
pp-code-apps-builder/
├── package.json                      # npm package manifest (publish to registry)
├── skill-manifest.json               # Unified skill manifest (cross-platform)
├── copilot-extensions.json           # GitHub Copilot Extensions manifest
├── claude-skill-manifest.json        # Claude skill manifest
├── CLAUDE.md                         # Claude Code project instructions
├── LICENSE                           # MIT license
├── bin/
│   ├── install.js                    # Cross-platform Node.js installer
│   └── validate.js                   # Pre-publish validation
├── .agents/skills/power-apps-code-apps/
│   ├── SKILL.md                      # Orchestrator — routes to 6 agents
│   ├── README.md                     # This file
│   ├── references/
│   │   ├── frontend.md               # Scaffolding, migration, context, embedding, UI
│   │   ├── backend-data.md           # Dataverse, SQL, SharePoint, Copilot Studio, metadata
│   │   └── infra-ops.md              # ALM, CSP, App Insights, telemetry, Azure Functions
│   └── scripts/
│       ├── install.ps1               # Windows installer (PowerShell)
│       └── install.sh                # macOS/Linux installer (Bash)
├── .github/
│   ├── copilot-skills.json           # GitHub Copilot skill index
│   ├── workflows/publish.yml         # CI/CD for npm + GitHub Packages
│   ├── skills/power-apps-code-apps/  # Mirror for .github discovery
│   └── agents/
│       ├── power-apps-code-apps.agent.md   # Orchestrator agent
│       ├── pa-frontend.agent.md            # React/TypeScript/Vite specialist
│       ├── pa-backend.agent.md             # Data sources & CRUD specialist
│       ├── pa-infra.agent.md               # Deployment, ALM & security specialist
│       ├── pa-business-analyst.agent.md    # Requirements & data modeling
│       ├── pa-architect.agent.md           # Solution architecture & design
│       └── pa-product-manager.agent.md     # Roadmap, planning & releases
└── .claude/skills/power-apps-code-apps/    # Mirror for Claude Code discovery
```

## Manifests

| File | Purpose | Platform |
|------|---------|----------|
| `package.json` | npm registry distribution, `npx` installer | npm / GitHub Packages |
| `skill-manifest.json` | Unified skill descriptor (cross-platform) | All |
| `copilot-extensions.json` | Copilot Extensions marketplace registration | GitHub Copilot |
| `.github/copilot-skills.json` | Skill index for GitHub repo discovery | GitHub Copilot |
| `claude-skill-manifest.json` | Claude skill registration | Claude Code / CLI |
| `CLAUDE.md` | Project-level instructions for Claude | Claude Code / CLI |

## Installation

### Option 1: npm (Recommended)

Install into any project with a single command:

```bash
# Install for both Copilot and Claude
npx @anthropic-power-apps/code-apps-skill --target all

# Copilot only
npx @anthropic-power-apps/code-apps-skill --target copilot

# Claude only
npx @anthropic-power-apps/code-apps-skill --target claude

# User-level (personal, all workspaces)
npx @anthropic-power-apps/code-apps-skill --target all --scope user

# Preview changes without writing
npx @anthropic-power-apps/code-apps-skill --target all --dry-run
```

### Option 2: Clone This Repo

If you cloned this repo, everything is already in place. Open VS Code and type `/power-apps-code-apps` in Copilot Chat.

### Option 3: Platform-Specific Scripts

#### Windows (PowerShell)

```powershell
.\\.agents\skills\power-apps-code-apps\scripts\install.ps1 -Target all -Scope workspace
```

#### macOS / Linux (Bash)

```bash
bash .agents/skills/power-apps-code-apps/scripts/install.sh --target all --scope workspace
```

### Option 4: Manual Copy

| Platform | Skill Location | Agent Location |
|----------|---------------|----------------|
| **Copilot (workspace)** | `.agents/skills/power-apps-code-apps/` or `.github/skills/power-apps-code-apps/` | `.github/agents/` |
| **Copilot (user)** | `~/.copilot/skills/power-apps-code-apps/` | VS Code user prompts folder |
| **Claude (workspace)** | `.claude/skills/power-apps-code-apps/` + `CLAUDE.md` | N/A |
| **Claude (user)** | `~/.claude/skills/power-apps-code-apps/` | N/A |

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
