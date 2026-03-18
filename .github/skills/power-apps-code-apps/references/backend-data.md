# Backend & Data Reference — Power Apps Code Apps

## Data Source Framework

All connectors are supported **except** Excel Online (Business) and Excel Online (OneDrive).

### Adding Data Sources

#### List Connections

```powershell
pac connection list
# Returns: Connection ID, API Name (used as -a flag)
```

#### Nontabular Data Source

```powershell
pac code add-data-source -a <apiName> -c <connectionId>
# Example:
pac code add-data-source -a "shared_office365users" -c "aaaa0000bb11222233cc444444dddddd"
```

#### Tabular Data Source

```powershell
pac code add-data-source -a <apiName> -c <connectionId> -t <tableId> -d <datasetName>
# Example (SQL):
pac code add-data-source -a "shared_sql" -c "aaaa0000bb11222233cc444444dddddd" `
  -t "[dbo].[Projects]" -d "sql-server.database.windows.net,mydb"
```

#### Discover Datasets and Tables

```powershell
pac code list-datasets -a <apiId> -c <connectionId>
pac code list-tables -a <apiId> -c <connectionId> -d <datasetName>
pac code list-sql-stored-procedures -c <connectionId> -d <datasetName>
```

#### SQL Stored Procedures

```powershell
pac code add-data-source -a <apiId> -c <connectionId> -d <dataSourceName> -sp <storedProcedureName>
```

#### Delete Data Sources

```powershell
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

> **Schema changes**: No refresh command exists. Delete and re-add the data source.

### Connection References (v1.51.1+, Dec 2025)

Solution-aware data sources for ALM:

```powershell
# Get solution ID
pac solution list --json | ConvertFrom-Json | Format-Table

# List connection references
pac code list-connection-references -env <environmentURL> -s <solutionID>

# Add data source via connection reference
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

### Auto-Generated Code

Running `add-data-source` generates typed files in `/generated/services/`:
- `<Name>Service.ts` — CRUD methods
- `<Name>Model.ts` — TypeScript interfaces

```typescript
import { AccountsService } from './generated/services/AccountsService';
import type { Accounts } from './generated/models/AccountsModel';
```

---

## Dataverse CRUD

### Prerequisites

- PAC CLI v1.46+
- Dataverse-enabled environment

### Add Dataverse Table

```powershell
pac code add-data-source -a dataverse -t <table-logical-name>
```

### Create

```typescript
const newAccount = { name: "New Account", statecode: 0, accountnumber: "ACC001" };
const result = await AccountsService.create(newAccount as Omit<Accounts, 'accountid'>);
```

### Read Single

```typescript
const result = await AccountsService.get("<guid>");
```

### Read Multiple (with OData)

```typescript
interface IGetAllOptions {
  maxPageSize?: number;
  select?: string[];       // ALWAYS limit columns
  filter?: string;         // OData filter
  orderBy?: string[];
  top?: number;
  skip?: number;
  skipToken?: string;      // Pagination token
}

const result = await AccountsService.getAll({
  select: ['name', 'accountnumber', 'address1_city'],
  filter: "address1_country eq 'USA'",
  orderBy: ['name asc'],
  top: 50
});
```

> **IMPORTANT**: Always use `select` to limit columns. Only include changed properties in `update` calls.

### Update

```typescript
await AccountsService.update(accountId, { name: "Updated Name", telephone1: "555-0123" });
```

### Delete

```typescript
await AccountsService.delete(accountId);
```

### Supported Delegation

Filter, Sort, Top queries are delegated to the server.

### Unsupported

Polymorphic lookups, Dataverse actions/functions, FetchXML, alternate keys, schema CRUD.

---

## Azure SQL Integration

### Setup Flow

1. Create Azure SQL Database (Serverless, Entra-only auth)
2. Allow Azure services + client IP in firewall
3. Deploy schema via VS Code mssql extension
4. Create SQL Server connection in Power Platform (Entra ID Integrated)
5. Add stored procedures via `pac code add-data-source -sp`

### Example: Add SQL Stored Procedure

```powershell
pac code add-data-source -a "shared_sql" -c "<connectionId>" `
  -d "sql-server.database.windows.net,mydb" -sp "dbo.GetAllProjects"
```

### Fluent UI DataGrid Pattern

```bash
npm install react@^18.0.0 react-dom@^18.0.0 @types/react@^18.0.0 @types/react-dom@^18.0.0
npm install @fluentui/react-components
```

### Troubleshooting

- **Can't connect**: Check firewall "Allow Azure services" = Yes, use Entra ID MFA auth
- **Permission errors**: Ensure your account is set as Microsoft Entra admin
- **Port 3000 in use**: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- **Runtime errors**: Verify connection in Power Platform, give consent on first load

---

## SharePoint Operations

### Prerequisites

PAC CLI v1.50+, connected environment.

### Add SharePoint Data Source

Follow `connect-to-data.md` flow with SharePoint connector.

### CRUD Operations

```typescript
import { MyListService } from './generated/services/MyListService';
import type { MyList } from './generated/models/MyListModel';

// Read all
const result = await MyListService.getAll();

// Read one
const record = await MyListService.get(id);

// Create — use expanded objects for referenced columns
const payload = {
  Title: "New Item",
  Choices1: choices1Obj,       // expanded object, not ID
  person: personObj,
  lookup: lookupObj,
  "{ContentType}": {
    "@odata.type": "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedContentType",
    Id: contentTypeId, Name: "Item"
  }
} as Partial<Omit<MyList, "ID">>;
await MyListService.create(payload as Omit<MyList, "ID">);

// Update
await MyListService.update(recordId, updatePayload);

// Delete
await MyListService.delete(recordId);
```

### Referenced Entities (Choices/Lookup/Person)

```typescript
const res = await MyListService.getReferencedEntity("", "Choices1");
const options = ((res.data as { value?: any[] })?.value || res.data);
```

> **NOTE**: Generated models may include `#` properties (e.g., `Choices1#Id`). Do NOT include these in create/update payloads.

### Unsupported

Document Processing APIs, item sync, permission changes.

---

## Copilot Studio Integration

### Setup

```bash
pac connection list
# Look for: /providers/Microsoft.PowerApps/apis/shared_microsoftcopilotstudio
pac code add-data-source -a "shared_microsoftcopilotstudio" -c <connectionId>
```

### Get Agent Name

In Copilot Studio → Channels → Web app → connection string URL:
```
https://{id}.environment.api.powerplatform.com/.../bots/{agentName}/conversations?...
```

Agent names are **case-sensitive**.

### Invoke Agent

```typescript
import { CopilotStudioService } from './generated/services/CopilotStudioService';

const response = await CopilotStudioService.ExecuteCopilotAsyncV2({
  message: "What is the status of my order?",
  notificationUrl: "https://notificationurlplaceholder",  // Required placeholder
  agentName: "cr3e1_customerSupportAgent"
});

if (response.data.completed) {
  console.log(response.data.lastResponse);
}
```

### Response Shape

| Property | Type | Description |
|----------|------|-------------|
| `responses` | `string[]` | Array of response strings |
| `conversationId` | `string` | Conversation tracking ID |
| `lastResponse` | `string` | Most recent response |
| `completed` | `boolean` | Whether agent finished |

### JSON Response Parsing

```typescript
const parsed = JSON.parse(response.data.responses[0]);
```

### Troubleshooting

- Use `ExecuteCopilotAsyncV2` only — `ExecuteCopilot` returns only conversationId, `ExecuteCopilotAsync` may 502
- Property casing may vary: check `conversationId`, `ConversationId`, `conversationID`
- Ensure agent is published and name matches exactly

---

## Table Metadata (Dataverse)

Retrieve entity metadata at runtime for dynamic forms, localization, and validation.

```typescript
const { data } = await AccountsService.getMetadata({
  metadata: ['DisplayName', 'Privileges'],  // entity-level properties
  schema: {
    columns: 'all',      // or array of logical names
    manyToOne: true       // include lookup relationships
  }
});
```

### Common Patterns

```typescript
// Localized column labels
for (const attr of data.Attributes) {
  labels[attr.LogicalName] = attr.DisplayName?.UserLocalizedLabel?.Label;
}

// Required fields
const required = data.Attributes.filter(a => a.IsRequiredForForm);

// Column types
const types = data.Attributes.map(a => ({ name: a.LogicalName, type: a.AttributeTypeName?.Value }));

// Lookup relationships
const lookups = data.ManyToOneRelationships.map(r => ({
  field: r.ReferencingAttribute, table: r.ReferencedEntity
}));
```

> **Best practices**: Cache metadata at app start. Use specific column lists over `"all"`. Defensive access with `?.` chains.

---

## Network Debugging

Filter DevTools network requests:

| Data Source | Filter |
|-------------|--------|
| Connectors | `apihub.net` |
| Dataverse | `dynamics.com` |

Open DevTools: <kbd>F12</kbd> / <kbd>Ctrl+Shift+I</kbd> → Network tab → filter bar.
