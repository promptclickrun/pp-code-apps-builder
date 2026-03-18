---
name: power-apps-code-apps
description: "Orchestrate Power Apps Code Apps development across frontend, backend, infrastructure, business analysis, architecture, and product management. Use when: create code app, connect data source, Dataverse CRUD, Azure SQL, SharePoint, Copilot Studio, PAC CLI, npm CLI, ALM pipelines, CSP, App Insights, iframe embed, metadata, migrate v1, deploy code app, code app architecture, code app requirements, code app roadmap."
argument-hint: "Describe what you need help with — e.g. 'scaffold a new code app with Dataverse' or 'plan ALM strategy for production'"
---

# Power Apps Code Apps — Multi-Agent Skill

An orchestrator skill for building, connecting, deploying, and managing Power Apps Code Apps (React/TypeScript on Power Platform). Delegates to 6 specialized agents based on the task domain.

## When to Use

- Building or scaffolding a new code app from scratch
- Connecting to data sources (Dataverse, Azure SQL, SharePoint, Copilot Studio, custom APIs)
- Deploying via PAC CLI or npm CLI, setting up ALM pipelines
- Configuring security (CSP), telemetry (App Insights), or embedding (iframe)
- Planning architecture, writing requirements, or managing a code app product roadmap
- Migrating from v0.x to v1.0 of the client library

## Agent Routing

Analyze the user request and delegate to the most appropriate agent. If the request spans multiple domains, invoke agents sequentially.

| Domain | Agent | Trigger Keywords |
|--------|-------|-----------------|
| **Frontend** | `pa-frontend` | React, TypeScript, Vite, scaffold, UI, component, Fluent UI, template, npm run dev, local play, migrate v1, getContext, embed iframe |
| **Backend/Data** | `pa-backend` | data source, Dataverse, Azure SQL, SharePoint, Copilot Studio, CRUD, OData, filter, stored procedure, connector, getAll, create, update, delete, metadata, getMetadata |
| **Infrastructure** | `pa-infra` | deploy, push, ALM, solution, pipeline, CSP, content security policy, App Insights, telemetry, Azure Functions, API Management, custom connector, connection reference |
| **Business Analysis** | `pa-business-analyst` | requirements, user story, acceptance criteria, data model, schema, validation rules, field mapping, entity relationship |
| **Architecture** | `pa-architect` | architecture, design, topology, integration pattern, solution structure, multi-environment, data flow, security model, scalability |
| **Product Management** | `pa-product-manager` | roadmap, feature plan, migration plan, sprint, backlog, release, MVP, prioritization, stakeholder |

## Procedure

1. **Parse the request**: Identify which domain(s) the user's question falls into using the routing table above.
2. **Load reference knowledge**: Read the relevant reference doc(s) from [./references/](./references/) to ground the agent's response:
   - [Frontend Reference](./references/frontend.md) — scaffolding, CLI, migration, context, embedding
   - [Backend/Data Reference](./references/backend-data.md) — all data source connections, CRUD patterns, metadata
   - [Infrastructure Reference](./references/infra-ops.md) — ALM, CSP, telemetry, Azure Functions, deployment
3. **Delegate to the agent**: Invoke the appropriate `pa-*` agent with the user's request plus relevant context from the reference docs.
4. **Synthesize**: If multiple agents were consulted, combine their outputs into a unified answer.

## Cross-Domain Examples

**"Build a code app that reads from Dataverse and displays in a Fluent UI table"**
→ `pa-backend` (Dataverse connection + CRUD) then `pa-frontend` (Fluent UI DataGrid component)

**"Set up CI/CD for my code app with connection references"**
→ `pa-infra` (ALM pipelines + connection references)

**"I need requirements for an asset management code app with Azure SQL backend"**
→ `pa-business-analyst` (requirements) then `pa-architect` (data source topology) then `pa-backend` (Azure SQL setup)

**"Plan migration from v0.3 to v1 and deploy to production"**
→ `pa-frontend` (v1 migration steps) then `pa-infra` (deployment workflow)

## Platform Compatibility

This skill works across:
- **Copilot VS Code Chat**: Agents in `.github/agents/`, skill in `.agents/skills/`
- **Copilot CLI**: Same file structure, agents discovered by description
- **Claude Code / Claude Code CLI**: Copy to `.claude/skills/` using the install script

See [README.md](./README.md) for installation instructions.
