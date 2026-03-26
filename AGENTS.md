# AGENTS.md - IntuneAssistant Coding Guide

## Project Overview

**IntuneAssistant** is a multi-platform tool for managing Microsoft Intune environments with three main components:
1. **CLI** (.NET 8.0 C#) - Distributed via NuGet as `IntuneCLI`
2. **Web Interface** (Next.js 15 + React 19 + TypeScript) - SaaS web application
3. **Documentation** (Fumadocs/Next.js) - User-facing documentation site

The system acts as an aggregation layer over Microsoft Graph API, combining multiple endpoints to deliver streamlined Intune management insights.

## Architecture Fundamentals

### Three-Layer Auth Flow (Web Interface)
The web interface uses a **three-tier authentication** pattern:
```
Frontend (Next.js) → IntuneAssistant API → Microsoft Graph API
   ↓ MSAL auth         ↓ OBO flow          ↓ Delegated perms
ClientID: 3448bc...    API: afe66dd...     Graph endpoints
```

- **Frontend auth**: MSAL browser (`@azure/msal-browser`) with session storage
- **API scope**: `api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user`
- **Auth config**: `/IntuneAssistant.WebInterface/lib/msalConfig.ts`
- **Custom hook**: `useApiRequest()` handles token acquisition and request cancellation

### Multi-Tenant Architecture (GDAP/MSP Support)
Supports MSP partners managing multiple customer tenants via GDAP:
- **TenantContext** (`contexts/TenantContext.tsx`): Tracks selected tenant in localStorage
- **CustomerContext** (`contexts/CustomerContext.tsx`): Manages customer/license data
- **X-Tenant-ID header**: Sent on all API requests when tenant selected
- Use `useGdapContext()` hook for GDAP-aware API calls with proper headers

### Dependency Injection Pattern (CLI)
Custom middleware in `IntuneAssistant.Cli/Middleware/DependencyInjectionMiddleware.cs` bridges System.CommandLine with Microsoft DI:
```csharp
// Program.cs registers services
builder.UseDependencyInjection(services => {
    services.AddScoped<IDeviceService, DeviceService>();
    // ...
});

// Command handlers receive injected dependencies
public class MyCommandHandler : ICommandOptionsHandler<MyOptions> {
    private readonly IDeviceService _deviceService;
    public MyCommandHandler(IDeviceService deviceService) { ... }
}
```

All CLI command handlers follow the `Command<TOptions, THandler>` pattern in `Commands/Command.cs`.

## Key Workflows

### Adding a CLI Command
1. Create command file in `IntuneAssistant.Cli/Commands/{Area}/`
2. Inherit from `Command<TOptions, THandler>` where:
   - `TOptions : ICommandOptions` defines arguments/options
   - `THandler : ICommandOptionsHandler<TOptions>` implements business logic
3. Register command in parent command (e.g., `ShowCmd.New()`)
4. Inject required services via constructor (uses DI middleware)
5. Use **Spectre.Console** for output: `AnsiConsole.MarkupLine()`, `Table`, `Status`

Example command structure:
```csharp
public class MyCommand : Command<MyOptions, MyHandler> {
    public MyCommand() : base("mycommand", "Description") {
        var option = new Option<string>("--name");
        AddOption(option);
    }
}
```

### Web Interface API Integration
All backend API calls should use `useApiRequest()` hook:
```typescript
const { request } = useApiRequest();
const result = await request<ResponseType>(
    ENDPOINT_FROM_CONSTANTS,
    { method: 'POST', body: JSON.stringify(data) }
);
```

- **Constants**: Define all API endpoints in `/lib/constants.ts`
- **API base URL**: `https://api.intune-assistant.cloud/v1`
- **Correlation tracking**: Backend sends `x-correlation-id` header (requires CORS expose)
- **Error handling**: Use `ErrorContext` for global error display with retry capability

### Web Interface State Management
- **React Context** for global state (auth, tenant, customer, errors)
- **Local state** with `useState` for component-specific data
- **No Redux/Zustand** - contexts are sufficient for current scale
- **Data fetching**: Client-side only (no Next.js Server Components for data)

## Critical Patterns

### Correlation ID Tracking
Backend returns `x-correlation-id` for debugging. Frontend extracts via:
```typescript
const correlationId = response.headers.get('x-correlation-id');
```
**Note**: Backend must expose header via CORS `Access-Control-Expose-Headers`. See `CORRELATION_ID_BACKEND_FIX.md` for details.

### Error Boundaries
- **Global errors**: Use `ErrorContext` with `showError()` - displays persistent banner with retry
- **Local errors**: Component-level state for transient issues
- **User consent errors**: Special handling via `UserConsentRequiredError` class triggers consent flow

### Spectre.Console Tables (CLI)
Standard pattern for tabular data:
```csharp
var table = new Table();
table.Collapse();
table.AddColumn("Header1");
table.AddColumn("Header2");
foreach (var item in items) {
    table.AddRow(item.Value1.EscapeMarkup(), item.Value2.EscapeMarkup());
}
AnsiConsole.Write(table);
```
Always call `.EscapeMarkup()` on user-provided strings to prevent markup injection.

### Pagination (CLI)
Commands support `--paginate` flag via shared `CommandConfiguration.PaginationFlag`. Implement using console key detection for page navigation (see `AssignmentsGroupCmd.cs` for reference).

## Project Structure

```
IntuneAssistant/
├── IntuneAssistant.Cli/           # .NET CLI tool
│   ├── Commands/                   # Command hierarchy by feature area
│   │   ├── Command.cs             # Base command pattern
│   │   ├── RootCmd.cs             # Entry point command
│   │   └── {Auth,Show,Apps,...}/  # Feature-specific commands
│   ├── Middleware/                 # DI bridge for System.CommandLine
│   └── Program.cs                  # Service registration & startup
│
├── IntuneAssistant.WebInterface/   # Next.js frontend (App Router)
│   ├── app/                        # Routes & pages
│   ├── components/                 # Reusable React components
│   ├── contexts/                   # React contexts (auth, tenant, error)
│   ├── hooks/                      # Custom hooks (useApiRequest, useAuth)
│   ├── lib/                        # Utilities (apiRequest, msalConfig, constants)
│   └── types/                      # TypeScript type definitions
│
└── IntuneAssistant.Docs/           # Fumadocs documentation site
    ├── content/docs/               # MDX documentation pages
    └── lib/source.ts               # Content adapter config
```

### Missing Projects from Solution
The `.sln` file references `IntuneAssistant` and `IntuneAssistant.Infrastructure` projects but they're not in the workspace. These likely contain:
- Core business logic/models
- Infrastructure services (Graph API integration)

When working with CLI commands, reference service interfaces in these projects (e.g., `IDeviceService`, `IAssignmentsService`).

## Build & Development

### CLI Development
```bash
# Build solution
dotnet build

# Run CLI locally (from Cli project)
dotnet run -- auth login

# Pack for NuGet
dotnet pack -c Release

# Install globally from local package
dotnet tool install --global --add-source ./nupkg IntuneCLI
```

### Web Interface Development
```bash
cd IntuneAssistant.WebInterface

# Install dependencies
npm install

# Dev server with Turbopack
npm run dev

# Production build
npm run build && npm run start
```

### Documentation Site
```bash
cd IntuneAssistant.Docs
npm run dev  # Runs on localhost:3000
```

## Testing Strategy
- **Web**: Test scenarios documented in `/IntuneAssistant.Docs/components/TestScenarios.tsx`
- **CLI**: No automated tests currently - manual testing workflow
- **Test focus**: Assignment workflows, multi-tenant operations, consent flows
- Refer to `/IntuneAssistant.Docs/app/tests/page.tsx` for covered scenarios

## Common Gotchas

1. **CORS Headers**: Backend must expose custom headers like `x-correlation-id` via `Access-Control-Expose-Headers`
2. **Tenant Context**: Always check if `selectedTenant` exists before making API calls in multi-tenant scenarios
3. **MSAL Token Expiry**: `useApiRequest()` handles silent token refresh, but watch for `InteractionRequiredAuthError`
4. **CLI Service Lifetime**: Services are `Scoped` in CLI - one instance per command execution
5. **Markup Escaping**: Always use `.EscapeMarkup()` on user strings in Spectre.Console to prevent rendering issues
6. **Next.js Turbopack**: Both web and docs use `--turbopack` flag for dev/build

## External Dependencies

### CLI
- **System.CommandLine** (0.4.0-alpha): Command-line parsing
- **Spectre.Console** (0.48.0): Rich console UI
- **Azure.Identity** + **Microsoft.Identity.Client**: Authentication
- **Microsoft.ApplicationInsights**: Telemetry

### Web Interface
- **@azure/msal-browser** + **@azure/msal-react**: Authentication
- **Radix UI**: Headless component primitives
- **shadcn/ui**: Component library (via Radix UI)
- **Recharts**: Data visualization
- **Lucide React**: Icon library

## Documentation Updates
When adding features:
1. Update relevant `.mdx` files in `IntuneAssistant.Docs/content/docs/`
2. For CLI: Add command reference to `/content/docs/cli/`
3. For MSP features: Update `/content/docs/msp/`
4. Test scenarios: Add to `TestScenarios.tsx` if workflow-related

---

*Generated for AI coding assistants. Keep concise, actionable, and focused on this project's unique patterns.*

