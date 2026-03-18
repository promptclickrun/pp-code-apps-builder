# Frontend Reference — Power Apps Code Apps

## Scaffolding a New App

### Using PAC CLI (Traditional)

```bash
npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app
cd my-app
npm install
pac auth create
pac env select --environment <Your environment ID>
pac code init --displayname "My App"
npm run dev        # Open the "Local Play" URL in your tenant browser profile
npm run build | pac code push
```

### Using npm CLI (v1.0.4+, Preview)

Reduces prerequisites — no PAC CLI needed for core workflow.

```bash
npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app
cd my-app
npm install
npx power-apps init                             # Interactive mode
# OR: npx power-apps init --displayName "My App" --environmentId <ID>
npm run dev
npm run build
npx power-apps push
```

| npm CLI Command | Description |
|-----------------|-------------|
| `init` | Initialize code app |
| `run` | Start local dev server |
| `push` | Publish to environment |

### Local Network Access (Dec 2025+)

Chrome/Edge block public→local requests by default. Options:
- Grant browser permission when prompted
- Configure enterprise policies
- For iframes: add `allow="local-network-access"` attribute

## Migration to v1.0

### Remove `initialize()`

v1.0 removes the `initialize` function. Delete all imports and calls:

```typescript
// DELETE these:
import { initialize } from '@microsoft/power-apps'

await initialize();
setIsInitialized(true);

// DELETE state flags:
if (!isInitialized) return;
```

Apps can now call data, context, and platform APIs immediately — no initialization gate.

### Add `setConfig()` (Optional)

New API for opting into telemetry and observability:

```typescript
import { setConfig } from '@microsoft/power-apps/app';
import type { IConfig } from '@microsoft/power-apps/app';

setConfig({
  logger: {
    logMetric: (value: Metric) => {
      appInsights.trackEvent({ name: value.type }, value.data);
    }
  }
});
```

## Context API

Retrieve app, user, and session metadata at runtime:

```typescript
import { getContext } from '@microsoft/power-apps/app';

const ctx = await getContext();
```

### IContext Shape

| Property | Type | Fields |
|----------|------|--------|
| `ctx.app` | `IAppContext` | `appId`, `environmentId`, `queryParams` |
| `ctx.user` | `IUserContext` | `fullName`, `objectId`, `tenantId`, `userPrincipalName` |
| `ctx.host` | `IHostContext` | `sessionId` (changes each app open) |

### Use Cases

- **Telemetry**: Correlate `sessionId` with platform telemetry
- **Personalization**: Display `fullName`, adapt by `tenantId`
- **Feature flags**: Branch logic on `queryParams` or `environmentId`
- **Environment detection**: Select config (e.g., App Insights key) based on `environmentId`

## Embedding in Iframes

### Get the Code App URL

```
https://apps.powerapps.com/play/e/{environmentId}/app/{appId}?tenantid={tenantId}
```

### Embed HTML

```html
<iframe
  width="1200" height="800"
  src="https://apps.powerapps.com/play/e/{environmentId}/{appId}"
  title="My code app">
</iframe>
```

For device APIs:
```html
<iframe ... allow="geolocation; microphone; camera; fullscreen; clipboard-write"></iframe>
```

### CSP Requirement

Default `frame-ancestors` is `'self' https://*.powerapps.com`. To embed outside Power Apps, add your host origin:
- Dynamics 365: `https://<your-org>.crm.dynamics.com`
- Custom domain: `https://contoso.com`

See [infra-ops.md](./infra-ops.md) for CSP configuration steps.

### Limitations

- Only same-tenant Power Apps users can access embedded apps
- Cannot share iframe URL with external users
- No native desktop embedding (Android/iOS)

## UI Patterns

### Fluent UI with React 18

For components like DataGrid, downgrade to React 18:

```bash
npm install react@^18.0.0 react-dom@^18.0.0 @types/react@^18.0.0 @types/react-dom@^18.0.0
npm install @fluentui/react-components
```

Wrap app with FluentProvider:

```typescript
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PowerProvider>
      <FluentProvider theme={webLightTheme}>
        <App />
      </FluentProvider>
    </PowerProvider>
  </StrictMode>,
);
```
