# AGENTS.md – IntuneAssistant Web Interface

## Project Overview
Next.js 15 (App Router) frontend for IntuneAssistant — a multi-tenant Microsoft Intune management platform. Deployed on Netlify with `@netlify/plugin-nextjs`. Auth is handled via MSAL (Azure AD).

## Dev Commands
```bash
npm run dev       # Turbopack dev server (localhost:3000)
npm run build     # Turbopack production build
npm run lint      # ESLint
```
Local API backend runs at `https://localhost:7224/v1` (set `NEXT_PUBLIC_APP_ENV=development`).

## Architecture

### Server / Client split
- `app/layout.tsx` — Server Component (metadata, GA scripts)
- `app/client-layout.tsx` — Client boundary; wraps everything in providers

### Provider hierarchy (client-layout.tsx)
```
MsalProvider → ErrorProvider → ThemeProvider → CustomerProvider
  → ConsentProvider → TenantProvider → SidebarProvider
    → MonitorProvider → AuditEventsProvider
```
All contexts live in `contexts/`. Add new contexts here and wrap in `client-layout.tsx`.

### API layer
| File | Role |
|---|---|
| `lib/constants.ts` | All endpoint URLs; switch by `NEXT_PUBLIC_APP_ENV` (development/test/production) |
| `lib/apiRequest.ts` | Raw `fetch` wrapper; attaches `Authorization: Bearer <token>` and extracts `x-correlation-id` from responses; throws `UserConsentRequiredError` on 401 with consent URL |
| `hooks/useApiRequest.ts` | React hook; silently acquires MSAL token, injects `X-Tenant-ID` header from `TenantContext`, centralises abort-controller and error display via `ErrorContext` |

**Always use `useApiRequest().request(url, options)` inside components/pages — never call `fetch` or `apiRequest` directly.**

### Authentication
- MSAL app: `clientId = 3448bc04-cdbe-4a07-8e24-7e0e6f6980c1`
- API scope: `api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user`
- Token cache: `sessionStorage`; redirect URI: `<origin>/auth/verify`
- Config: `lib/msalConfig.ts`

### Multi-tenancy
Selected tenant is stored in `localStorage` (`selectedTenant`) and provided via `TenantContext`. Every API call must include `X-Tenant-ID: <tenantId>` — the `useApiRequest` hook does this automatically when a tenant is selected.

## Key Conventions

### Adding a new page/feature
1. Create `app/<feature>/page.tsx` (Client Component with `'use client'`).
2. Add all new endpoints to `lib/constants.ts`.
3. Fetch data using `useApiRequest` hook; handle loading/error states.
4. Use Shadcn UI components from `components/ui/`; new components go in `components/`.

### Error handling
Errors surface globally via `ErrorContext` / `GlobalErrorDisplay`. The `useApiRequest` hook calls `showError()` automatically. Pages don't need their own error UI unless they need custom retry logic.

### Consent flow
A 401 response with `message.url` triggers `UserConsentRequiredError`. `useApiRequest` intercepts this and invokes `showError` with an optional `onConsentComplete` retry callback. Pass a retry lambda as the third argument to `request()`.

### UI stack
- Shadcn UI (Radix UI primitives) + Tailwind CSS v4
- `cn()` from `lib/utils` for conditional class merging
- `lucide-react` for icons
- `DataTable.tsx` is the shared table component (with sorting/filtering)
- `ExportButton.tsx` handles PDF/CSV/ZIP exports (jsPDF, jspdf-autotable, JSZip)

## Key Files Reference
- `lib/constants.ts` — all API endpoints
- `lib/apiRequest.ts` — HTTP client
- `hooks/useApiRequest.ts` — primary data-fetching hook
- `contexts/TenantContext.tsx` — selected tenant state
- `contexts/ErrorContext.tsx` — global error state
- `app/client-layout.tsx` — provider tree & layout structure
- `components/DataTable.tsx` — reusable data table
- `components/Sidebar.tsx` — navigation

## Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` → localhost API, `test` → staging API, else production |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (optional) |

