# Power Apps Code Apps

This project contains a multi-agent AI skill for Power Apps Code Apps development.

## Skill Location

Read the skill at `.github/skills/power-apps-code-apps/SKILL.md` for the orchestration workflow.

## Reference Documentation

When answering questions about Power Apps Code Apps, consult:

- **Frontend** (React, TypeScript, Vite, migration, embedding): `.github/skills/power-apps-code-apps/references/frontend.md`
- **Backend/Data** (Dataverse, Azure SQL, SharePoint, Copilot Studio, CRUD): `.github/skills/power-apps-code-apps/references/backend-data.md`
- **Infrastructure** (ALM, CSP, App Insights, telemetry, deployment): `.github/skills/power-apps-code-apps/references/infra-ops.md`

## Agent Roles

Route requests to the appropriate specialist domain using the agents in `.github/agents/`:

| Domain | Agent | When |
|--------|-------|------|
| Frontend | pa-frontend | React, scaffold, Fluent UI, migrate v1, getContext, iframe |
| Backend | pa-backend | Dataverse, Azure SQL, SharePoint, Copilot Studio, CRUD, OData |
| Infrastructure | pa-infra | deploy, ALM, CSP, App Insights, Azure Functions, pipelines |
| Business Analysis | pa-business-analyst | requirements, user stories, data model, validation rules |
| Architecture | pa-architect | solution design, topology, integration, multi-environment |
| Product Management | pa-product-manager | roadmap, sprint, release, go-live checklist |
