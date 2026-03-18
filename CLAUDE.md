# Power Apps Code Apps

This project contains a multi-agent AI skill for Power Apps Code Apps development.

## Skill Location

Read the skill at `.claude/skills/power-apps-code-apps/SKILL.md` for the orchestration workflow.

## Reference Documentation

When answering questions about Power Apps Code Apps, consult:

- **Frontend** (React, TypeScript, Vite, migration, embedding): `.claude/skills/power-apps-code-apps/references/frontend.md`
- **Backend/Data** (Dataverse, Azure SQL, SharePoint, Copilot Studio, CRUD): `.claude/skills/power-apps-code-apps/references/backend-data.md`
- **Infrastructure** (ALM, CSP, App Insights, telemetry, deployment): `.claude/skills/power-apps-code-apps/references/infra-ops.md`

## Agent Roles

Route requests to the appropriate specialist domain:

| Domain | When |
|--------|------|
| Frontend | React, scaffold, Fluent UI, migrate v1, getContext, iframe |
| Backend | Dataverse, Azure SQL, SharePoint, Copilot Studio, CRUD, OData |
| Infrastructure | deploy, ALM, CSP, App Insights, Azure Functions, pipelines |
| Business Analysis | requirements, user stories, data model, validation rules |
| Architecture | solution design, topology, integration, multi-environment |
| Product Management | roadmap, sprint, release, go-live checklist |

## Source Documentation

The 17 how-to docs at the project root contain the full domain knowledge:
`alm.md`, `connect-to-data.md`, `connect-to-dataverse.md`, `connect-to-azure-sql.md`,
`sharepoint-operations.md`, `connect-to-copilot-studio.md`, `content-security-policy.md`,
`create-an-app-from-scratch.md`, `npm-quickstart.md`, `migrate-to-v1.md`, `retrieve-context.md`,
`embed-iframe.md`, `get-table-metadata.md`, `set-up-azure-app-insights.md`, `telemetry.md`,
`analyze-data-request-response.md`, `create-basic-asset-management-api-azure-functions.md`
