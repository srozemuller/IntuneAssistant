# AGENTS.md – IntuneAssistant Web Interface

## Project Overview
Next.js 15 (App Router) frontend for IntuneAssistant — a multi-tenant Microsoft Intune management platform. Deployed on Netlify with `@netlify/plugin-nextjs`. Auth via MSAL (Azure AD / Entra ID).

## Dev Commands
```bash
npm run dev       # Turbopack dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```
Local API backend: `https://localhost:7224/v1` — set `NEXT_PUBLIC_APP_ENV=development`.

## Architecture

### Server / Client split
- `app/layout.tsx` — Server Component (metadata, GA scripts only)
- `app/client-layout.tsx` — Client boundary; all providers live here

### Provider hierarchy (`app/client-layout.tsx`)
```
ThemeProvider → MsalProvider → ErrorProvider → ConsentProvider
  → CustomerProvider → TenantProvider → MonitorProvider
    → AuditEventsProvider → SidebarProvider
```
All contexts in `contexts/`. Add new ones here and register in `client-layout.tsx`.

### API layer
| File | Role |
|---|---|
| `lib/constants.ts` | All endpoint URLs; base URL switches on `NEXT_PUBLIC_APP_ENV` (development/test/production) |
| `lib/apiRequest.ts` | Raw `fetch` wrapper; attaches `Authorization: Bearer <token>`, extracts `x-correlation-id`, throws `UserConsentRequiredError` on 401 with `data.message.url` |
| `hooks/useApiRequest.ts` | React hook; silently acquires MSAL token, injects `X-Tenant-ID` from `TenantContext`, manages AbortController, routes errors to `ErrorContext` |

**Always use `useApiRequest().request(url, options)` in components — never call `fetch` or `apiRequest` directly.**

### Authentication
- MSAL client ID: `3448bc04-cdbe-4a07-8e24-7e0e6f6980c1`
- API scope: `api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user`
- Token cache: `sessionStorage`; redirect URI: `<origin>/auth/verify`
- Config: `lib/msalConfig.ts`

### Multi-tenancy
Selected tenant stored in `localStorage` (`selectedTenant`) via `TenantContext`. Every API call automatically gets `X-Tenant-ID: <tenantId>` from `useApiRequest`.

## Key Conventions

### Adding a new page
1. Create `app/<feature>/page.tsx` with `'use client'` at the top.
2. Add endpoint constants to `lib/constants.ts` (derived from `API_BASE_URL`).
3. Fetch with `useApiRequest`; destructure `{ data, correlationId }` from the response.
4. Use Shadcn UI (`components/ui/`) + `DataTable` for tabular data.

### Consent flow
A 401 response where `data.message.url` is present triggers `UserConsentRequiredError` (see `lib/errors.ts`). `useApiRequest` catches it and calls `showError()` with an optional retry callback — pass it as the third argument to `request()`:
```ts
await request(url, options, () => request(url, options));
```

### Error handling
Errors surface globally via `ErrorContext` / `GlobalErrorDisplay`. No per-page error UI needed unless custom retry logic is required.

### UI stack
- Shadcn UI (Radix UI) + Tailwind CSS v4
- `cn()` from `lib/utils` for conditional classes
- `lucide-react` for icons
- `DataTable.tsx` — shared sortable/filterable table
- `ExportButton.tsx` — PDF/CSV/ZIP exports (jsPDF, JSZip)

### Typing
- Shared types in `types/` (e.g. `assignmentFilter.ts`, `auditEvents.ts`)
- API response wrapper: `ApiResponseWithCorrelation<T>` from `lib/apiRequest.ts`

## Key Files Reference
| File | Purpose |
|---|---|
| `lib/constants.ts` | All API endpoint URLs |
| `lib/apiRequest.ts` | HTTP client + error classification |
| `hooks/useApiRequest.ts` | Primary data-fetching hook |
| `contexts/TenantContext.tsx` | Selected tenant state |
| `contexts/ErrorContext.tsx` | Global error state |
| `app/client-layout.tsx` | Provider tree |
| `components/DataTable.tsx` | Reusable table |
| `components/Sidebar.tsx` | Navigation |
| `app/configuration/policies/page.tsx` | Full-featured page example |

## Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` → localhost API, `test` → staging, else production |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (optional) |

