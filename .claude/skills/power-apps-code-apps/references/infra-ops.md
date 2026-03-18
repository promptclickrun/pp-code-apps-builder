# Infrastructure & Operations Reference — Power Apps Code Apps

## Application Lifecycle Management (ALM)

### Solution-Based Deployment

Code apps follow Power Platform ALM: solutions → connection references → pipelines.

#### Save to Preferred Solution (Default)

If a preferred solution is configured, `pac code push` saves there automatically.

#### Target a Specific Solution

```shell
pac code push --solutionName <solutionName>
```

#### Add Existing App to Solution (UI)

Power Apps → Solutions → Select solution → Add existing → App → Code app.

### Pipeline Deployment

Once in a solution, use Power Platform Pipelines for staged deployment:
```
Dev → Test → Prod
```
Pipelines run preflight checks for dependencies, connection references, etc.

### Connection References for ALM

Connection references are solution components that point to a specific connection for a connector. They allow environment-specific bindings without code changes.

```powershell
# Get solution ID
pac solution list --json | ConvertFrom-Json | Format-Table

# List connection references in solution
pac code list-connection-references -env <environmentURL> -s <solutionID>

# Add data source via connection reference
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

### ALM Limitations

- Code apps don't support solution packager
- Code apps don't support source code integration

---

## Content Security Policy (CSP)

Environment-level settings applied to all code apps.

### Default Directives

| Directive | Default |
|-----------|---------|
| `frame-ancestors` | `'self' https://*.powerapps.com` |
| `script-src` | `'self' <platform>` |
| `img-src` | `'self' data: <platform>` |
| `style-src` | `'self' 'unsafe-inline'` |
| `font-src` | `'self'` |
| `connect-src` | `'none'` |
| `frame-src` | `'self'` |
| `form-action` | `'none'` |
| `default-src` | `'self'` |
| `worker-src` | `'none'` |

Custom values are **appended** to defaults (except `'none'` defaults, which are replaced).

### Configure via Admin Center

Power Platform admin center → Manage → Environments → Select env → Settings → Product → Privacy + Security → Content security policy → App tab.

### Configure via REST API

Endpoint: `https://api.powerplatform.com/environmentmanagement/environments/{environmentId}/settings`

Settings:
- `PowerApps_CSPEnabledCodeApps` — enforce CSP (boolean)
- `PowerApps_CSPReportingEndpoint` — violation report endpoint (string or null)
- `PowerApps_CSPConfigCodeApps` — directive config (stringified JSON)

```json
{
  "default-src": { "sources": [{ "source": "'self'" }] },
  "style-src": { "sources": [{ "source": "'self'" }, { "source": "https://contoso.com" }] }
}
```

### PowerShell Helpers

```powershell
# Authenticate
$tenantId = "<your-tenant-id>"
$clientId = "9cee029c-6210-4654-90bb-17e6e9d36617"
$token = azureauth aad --resource "https://api.powerplatform.com/" --tenant $tenantId --client $clientId --output token | ConvertTo-SecureString -AsPlainText -Force

# Get current CSP
Get-CodeAppContentSecurityPolicy -Token $token -Env "<env-id>"

# Enable/disable enforcement
Set-CodeAppContentSecurityPolicy -Token $token -Env "<env-id>" -Enabled $true

# Set reporting endpoint
Set-CodeAppContentSecurityPolicy -Token $token -Env "<env-id>" -ReportingEndpoint "https://contoso.com/report"

# Disable reporting
Set-CodeAppContentSecurityPolicy -Token $token -Env "<env-id>" -ReportingEndpoint $null

# Update directives
$directives = (Get-CodeAppContentSecurityPolicy -Token $token -Env $env).Directives
Set-CodeAppContentSecurityPolicy -Token $token -Env $env -Directives $directives
```

### Iframe Embedding CSP

To embed outside `*.powerapps.com`, add host origin to `frame-ancestors`:
- Dynamics 365: `https://<your-org>.crm.dynamics.com`
- Custom: `https://contoso.com`

---

## Azure Application Insights

### Setup Steps

1. Create App Insights resource in Azure portal → copy Connection String
2. Install SDK:
   ```bash
   npm install @microsoft/applicationinsights-web
   ```
3. Initialize:
   ```typescript
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';

   const appInsights = new ApplicationInsights({
     config: { connectionString: 'InstrumentationKey=<KEY>;IngestionEndpoint=<ENDPOINT>' }
   });
   appInsights.loadAppInsights();
   appInsights.trackPageView();
   ```
4. Configure the logger:
   ```typescript
   import { setConfig } from '@microsoft/power-apps/app';

   setConfig({
     logger: {
       logMetric: (value: Metric) => {
         appInsights.trackEvent({ name: value.type }, value.data);
       }
     }
   });
   ```
5. Update CSP — add App Insights endpoints to `connect-src`

> Environment variables aren't supported. Store per-env keys in Dataverse or detect via `getContext()`.

### Built-In Metric Types

```typescript
type SessionLoadSummaryMetricData = {
  successfulAppLaunch: boolean;
  appLoadResult: 'optimal' | 'other';
  appLoadNonOptimalReason: 'interactionRequired' | 'throttled' | 'screenNavigatedAway' | 'other';
  timeToAppInteractive: number;
};

type NetworkRequestMetricData = {
  url: string;
  method: string;
  duration: number;
  statusCode: number;
  responseSize: number;
};
```

### Sample KQL Queries

**App open performance by day:**
```kusto
customEvents
| where name == "sessionLoadSummary"
| extend cd = parse_json(customDimensions)
| extend cm = parse_json(customMeasurements)
| extend timeToAppInteractive = todouble(cm["timeToAppInteractive"])
| extend successfulAppLaunch = tobool(cd.successfulAppLaunch)
| where successfulAppLaunch == true
| summarize percentile(timeToAppInteractive, 75) by bin(timestamp, 1d)
| render timechart
```

**Network request performance by URL:**
```kusto
customEvents
| where name == "networkRequest"
| extend cd = parse_json(customDimensions)
| extend url = tostring(cd.url)
| extend cm = parse_json(customMeasurements)
| extend duration = todouble(cm.duration)
| summarize count(), percentile(duration, 75) by url, bin(timestamp, 1d)
| render timechart
```

> App Insights only captures telemetry after load. Startup failures won't appear — use Power Platform Monitor for those.

---

## CLI Telemetry Configuration

PAC CLI `code` commands collect limited telemetry. Configure in `~/.powerapps-cli/userSettings.json`:

```json
{
  "enabled": true,
  "consoleOnly": false,
  "outputToConsole": false
}
```

| Property | Description |
|----------|-------------|
| `enabled` | Remote telemetry on/off |
| `consoleOnly` | Log to console only, no remote |
| `outputToConsole` | Mirror to console in addition to remote |

### Common Configs

| Scenario | enabled | consoleOnly | outputToConsole |
|----------|---------|-------------|-----------------|
| Default (remote only) | true | false | false |
| Fully disabled | false | false | false |
| Remote + console | true | false | true |
| Console only | false | true | false |

### Pipe to file

```powershell
pac code add-data-source .... | Out-File -FilePath telemetry.log -Encoding utf8
```

> Global PAC telemetry disable overrides this setting.

---

## Azure Functions + Custom Connector

### Create Mock API (Portal)

1. Create Function App (Consumption, Node.js)
2. Add HTTP trigger `GetAssets` (Anonymous auth)
3. Return mock JSON data

### Expose via API Management

1. Create APIM instance (Developer tier for dev/test)
2. Import Function App as API
3. Disable subscription required (for dev)

### Create Custom Connector (from APIM)

APIM → Power Platform → Create a connector → select API → select environment → Create.

The custom connector appears in Power Apps → Custom connectors, ready for `pac code add-data-source`.

---

## Deployment Quick Reference

### PAC CLI Flow

```bash
pac auth create
pac env select --environment <envId>
pac code init --displayname "My App"
# ... develop ...
npm run build | pac code push
# OR: pac code push --solutionName <name>
```

### npm CLI Flow (v1.0.4+)

```bash
npx power-apps init --displayName "My App" --environmentId <envId>
# ... develop ...
npm run build
npx power-apps push
```
