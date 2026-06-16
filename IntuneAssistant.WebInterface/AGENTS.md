# AGENTS.md – IntuneAssistant Web Interface

## Project Overview
Next.js 15 (App Router) + Turbopack frontend for IntuneAssistant — a multi-tenant Microsoft Intune management platform. Deployed on Netlify with `@netlify/plugin-nextjs`. Auth via MSAL (Azure AD / Entra ID). React 19, Tailwind CSS v4, Shadcn UI.

## Dev Commands
```bash
npm run dev       # Turbopack dev server (localhost:3000)
npm run build     # Production build (Turbopack)
npm run lint      # ESLint
```
Local API backend: `https://localhost:7224/v1` — set `NEXT_PUBLIC_APP_ENV=development`.

---

## Architecture

### Server / Client split
- `app/layout.tsx` — Server Component (metadata + GA scripts only, no hooks)
- `app/client-layout.tsx` — Client boundary (`'use client'`); all providers live here

### Provider hierarchy (`app/client-layout.tsx`)
```
ThemeProvider → Toaster (sonner) → MsalProvider → ErrorProvider → ConsentProvider
  → CustomerProvider → TenantProvider → MonitorProvider
    → AuditEventsProvider → MessageCenterProvider → SidebarProvider
      → MainContent (VerifyConsentOnMount, ConsentBanner, Sidebar, TenantIndicator, GlobalErrorDisplay)
```
All contexts in `contexts/`. Register new ones here **in dependency order** (inner providers may consume outer ones).

### Context roles
| Context | What it owns |
|---|---|
| `ErrorContext` | Global error banner state; `showError(msg, retryFn?)` |
| `ConsentContext` | Consent banner state (URL + minimized); cleared after verification |
| `CustomerContext` | Customer record, license info, tenant list — fetched once on login |
| `TenantContext` | **Currently selected tenant** (`localStorage: selectedTenant`) |
| `MonitorContext` | Cache store for monitors/drifts/results (pages fetch and push in) |
| `AuditEventsContext` | Paginated audit events + statistics with filter support |
| `MessageCenterContext` | Messages + localStorage read-state (`ia_message_center_read_ids`) |
| `SidebarContext` | Collapsed/expanded sidebar flag |

### API layer
| File | Role |
|---|---|
| `lib/constants.ts` | All endpoint URLs; base URL switches on `NEXT_PUBLIC_APP_ENV` (development/test/production) |
| `lib/apiRequest.ts` | Raw `fetch` wrapper; attaches `Authorization: Bearer <token>`, extracts `x-correlation-id`, throws `UserConsentRequiredError` on 401 with `data.message.url` |
| `hooks/useApiRequest.ts` | React hook; silently acquires MSAL token, injects `X-Tenant-ID` from `TenantContext`, manages AbortController, routes errors to `ErrorContext` |

**Always use `useApiRequest().request()` in components — never call `fetch` or `apiRequest` directly.**

Full `request` signature:
```ts
request<T>(
  url: string,
  options?: RequestInit,
  onConsentComplete?: () => Promise<ApiResponseWithCorrelation<T>>,
  forceTokenRefresh?: boolean   // pass true after consent to pick up new scopes
): Promise<ApiResponseWithCorrelation<T> | undefined>
```
Response type: `{ data: T, correlationId: string | null }` — or `undefined` on error (already handled globally).

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
3. Guard data fetches with `if (accounts.length === 0) return;` (MSAL not ready yet).
4. Fetch with `useApiRequest`; destructure `{ data, correlationId }` from the response.
5. Use `NoTenantSelected` when `selectedTenant` is null and the feature requires a tenant.
6. Use Shadcn UI (`components/ui/`) + `DataTable` for tabular data.

### MSAL guard + fetchedRef pattern (every context provider and data-fetching page)
```ts
const fetchedRef = useRef(false);
useEffect(() => {
    if (accounts.length === 0) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
}, [accounts.length, fetchData]);
```
Reset `fetchedRef.current = false` inside a `refetch()` callback when forced re-fetch is needed.

### Stable requestRef pattern (contexts only)
Context providers can't use `request` directly in a `useCallback` without causing stale closure issues. Store it in a ref instead:
```ts
const { request } = useApiRequest();
const requestRef = useRef(request);
useEffect(() => { requestRef.current = request; }, [request]);
// Call requestRef.current(...) inside stable useCallback
```

### Endpoint constants
- Static: `export const POLICIES_ENDPOINT = \`${API_BASE_URL}/policies\`;`
- Parameterized: `export const MONITOR_SNAPSHOT_BY_ID = (id: string) => \`${API_BASE_URL}/monitor/snapshots/${id}\`;`

### Consent flow
1. On mount, `VerifyConsentOnMount` calls `GET /v1/consent/intuneassistant-verify`.
2. Missing permissions → `ConsentContext.setConsentNeeded(url, perms)` → `ConsentBanner` appears.
3. After the user grants consent in a popup, pass `true` as the 4th arg to `request()` to force token refresh and pick up new scopes.
4. A 401 during any API call where `data.message.url` is set also triggers `UserConsentRequiredError` — pass a retry callback as the 3rd arg:
```ts
await request(url, options, () => request(url, options));
```
5. Consent check is suppressed on `/auth/verify` and `/onboarding/*` paths.

### localStorage / sessionStorage keys
| Key | Storage | Purpose |
|---|---|---|
| `selectedTenant` | localStorage | Active tenant (JSON `Tenant` object) |
| `ia_message_center_read_ids` | localStorage | JSON array of read message UUIDs |
| `ia_consent_verified` | sessionStorage | Consent check done flag (cleared to force re-check) |
| `ia_consent_minimized` | sessionStorage | Consent banner minimized state |
| `assignmentMigrationBuilderData` | sessionStorage | Migration builder draft |
| `assignmentMigrationDeploymentCSV` | sessionStorage | Migration deployment CSV |

### Error handling
Errors surface globally via `ErrorContext` / `GlobalErrorDisplay`. No per-page error UI needed unless custom retry logic is required.

### UI stack
- Shadcn UI (Radix UI) + Tailwind CSS v4
- `cn()` from `lib/utils` for conditional classes
- `lucide-react` for icons
- `DataTable.tsx` — shared sortable/filterable/paginated table
- `ExportButton.tsx` — PDF/CSV/HTML exports (jsPDF, JSZip)
- Errors → `ErrorContext`; success/info → `sonner` Toaster (`toast.success(...)`)

### DataTable columns
```ts
interface Column {
    key: string; label: string;
    sortable?: boolean; searchable?: boolean;
    defaultHidden?: boolean;       // hidden by default, user can toggle via columns button
    sortValue?: (row) => number | string;
    render?: (value, row) => React.ReactNode;
    width?: number;
}
```
External pagination: `currentPage`, `totalPages`, `onPageChange`.
Row selection: `selectedRows` (string IDs) + `onSelectionChange`.
Expandable rows: `expandedRowRender`.

### Guard components
- `NoTenantSelected` — empty state card when no tenant is selected; `feature` prop for context-aware copy.
- `PlanProtection` — wraps features requiring `'support'` or `'extensions'` license; `hasValidPlan` is currently hardcoded `true` (stub for future billing integration).

### Typing
- Shared types in `types/` (e.g. `assignmentFilter.ts`, `auditEvents.ts`, `worker.ts`)
- API response wrapper: `ApiResponseWithCorrelation<T>` from `lib/apiRequest.ts`

## Key Files Reference
| File | Purpose |
|---|---|
| `lib/constants.ts` | All API endpoint URLs + session/localStorage key constants |
| `lib/apiRequest.ts` | HTTP client + error classification (`ApiError`, `UserConsentRequiredError`) |
| `lib/errors.ts` | `UserConsentRequiredError` definition |
| `lib/msalConfig.ts` | MSAL config, `msalInstance`, `loginRequest`, `apiScope` |
| `hooks/useApiRequest.ts` | Primary data-fetching hook (`request`, `cancel`) |
| `contexts/TenantContext.tsx` | Selected tenant state |
| `contexts/CustomerContext.tsx` | Customer record, license info, tenant list |
| `contexts/ErrorContext.tsx` | Global error state |
| `contexts/ConsentContext.tsx` | Consent banner state |
| `contexts/MessageCenterContext.tsx` | Message Center state + read tracking |
| `contexts/MonitorContext.tsx` | Monitor/drift/result cache store |
| `app/client-layout.tsx` | Provider tree |
| `components/DataTable.tsx` | Reusable sortable/filterable/paginated table |
| `components/ExportButton.tsx` | PDF/CSV/HTML exports |
| `components/Sidebar.tsx` | Navigation (reads `useMessageCenter` for unread badge) |
| `components/NoTenantSelected.tsx` | Empty state for tenant-required pages |
| `components/ConsentBanner.tsx` | Consent requirement UI |
| `components/VerifyConsentOnMount.tsx` | On-load consent verification |
| `components/PlanProtection.tsx` | License gate wrapper (stub) |
| `components/ui/tenant-indicator.tsx` | Sticky active-tenant badge bar |
| `app/configuration/policies/page.tsx` | Full-featured page example (DataTable + export + filters) |
| `app/audit-events/page.tsx` | Context-consuming page example (recharts + AuditEventsContext) |
| `app/message-center/page.tsx` | Message Center page |

## Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` → localhost API, `test` → staging, else production |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (optional) |

---

## Feature: Message Center

### Overview
The Message Center allows the platform to broadcast messages (maintenance windows, feature announcements, warnings) to authenticated users. Messages are **license-filtered server-side** — the API only returns messages the current tenant is entitled to see. Read/unread state is tracked **entirely client-side** in `localStorage`; there is no backend endpoint for it.

### Files
| File | Role |
|---|---|
| `types/messageCenter.ts` | `MessageCenterItem`, `MessageCenterResponse`, `MessageType` type definitions |
| `contexts/MessageCenterContext.tsx` | Provider + `useMessageCenter` hook — single fetch, shared across all consumers |
| `app/message-center/page.tsx` | Full message center UI |
| `components/ui/skeleton.tsx` | Generic skeleton component (created for this feature) |
| `lib/constants.ts` | `MESSAGE_CENTER_ENDPOINT = /v1/message-center` |

### API
```
GET /v1/message-center
Headers: Authorization: Bearer {token}, X-Tenant-ID: {tenantId}
```
Response envelope:
```ts
{ status: "Success" | "Error", message: string, data: MessageCenterItem[] }
```

### Types (`types/messageCenter.ts`)
```ts
type MessageType = 0 | 1 | 2 | 3;  // Information | Warning | Maintenance | Feature

interface MessageCenterItem {
  id: string;
  title: string;
  description: string;
  messageType: MessageType;
  messageTypeName: 'Information' | 'Warning' | 'Maintenance' | 'Feature';
  expirationDate: string | null;
  createdAt: string;
}
```

### `MessageCenterContext` — key design decisions

**Single fetch, shared state.** `MessageCenterProvider` is registered once in `client-layout.tsx`. Both the page and `Sidebar.tsx` consume `useMessageCenter()` — no duplicate API calls.

**MSAL guard.** Fetch only fires once `accounts.length > 0` — the same pattern used on every other data-fetching page:
```ts
useEffect(() => {
    if (accounts.length === 0) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMessages();
}, [accounts.length, fetchMessages]);
```

**Stable `request` ref.** `useApiRequest().request` is stored in a `useRef` and updated on every render so `fetchMessages` (stable `useCallback`) always uses a fresh token without being recreated:
```ts
const requestRef = useRef(request);
useEffect(() => { requestRef.current = request; }, [request]);
```

**localStorage schema.** Key: `ia_message_center_read_ids`. Value: JSON array of UUID strings. Helpers exported from the context file:
```ts
export function getReadIds(): string[] { ... }   // read
// markRead / markUnread / markAllRead mutate the same key via setReadIds + persistReadIds
```

**`refetch()`** resets `fetchedRef.current = false` then calls `fetchMessages()` — used by the page Refresh button and by `Sidebar.tsx` when the user dropdown opens.

### `useMessageCenter` — returned surface
```ts
{
  messages: MessageCenterItem[];   // raw API data
  unreadCount: number;             // messages.length minus readIds intersection
  isLoading: boolean;
  error: string | null;
  readIds: string[];               // current localStorage snapshot
  markRead(ids: string[]): void;   // adds to readIds → removes orange dot
  markUnread(ids: string[]): void; // removes from readIds → restores orange dot
  markAllRead(): void;             // marks every loaded message as read
  refetch(): void;                 // force re-fetch
}
```

### Page (`app/message-center/page.tsx`)

#### Message type colours
| `messageType` | Border | Background | Icon |
|---|---|---|---|
| `0` Information | `border-l-blue-500` | `bg-blue-50` | `Info` |
| `1` Warning | `border-l-amber-500` | `bg-amber-50` | `AlertCircle` |
| `2` Maintenance | `border-l-purple-500` | `bg-purple-50` | `Wrench` |
| `3` Feature | `border-l-green-500` | `bg-green-50` | `Zap` |

#### Filter tabs
`All` · `Unread` · `Maintenance` · `Feature` · `Warning` · `Information`  
Each tab shows a live count badge; Unread count renders in orange.

#### Card interaction
- **Click anywhere on a card** to toggle selection (no separate checkbox).
- Selected state: `ring-2 ring-primary/60` + animated `✓` circle at top-left.
- Unread state: small `bg-orange-500` dot at top-right — disappears once marked read (dot only, card appearance is otherwise identical for read/unread messages).

#### Toolbar actions (shown only when messages are visible)
| Button | Enabled when |
|---|---|
| **Mark as read** | ≥1 selected message is currently *unread* |
| **Mark as unread** | ≥1 selected message is currently *read* |
| **Mark all as read** | `unreadCount > 0` |

Both mark-selected actions clear the selection after executing.

#### States
- **Loading** — 4 `MessageSkeleton` rows (pulsing `animate-pulse` cards).
- **Error** — inline red banner with message text + Retry button.
- **Empty** — `Megaphone` illustration, context-aware text ("All caught up!" for Unread tab), "View all" link back to All tab.

### Sidebar integration (`components/Sidebar.tsx`)
Three places `unreadCount > 0` triggers a visual indicator:

1. **Avatar trigger (collapsed or expanded)** — pulsing double-ring `bg-orange-500` dot at top-right of the avatar (`animate-ping` outer + static inner).
2. **Display name row (expanded sidebar)** — small `bg-orange-500` pill with the count next to the user's name.
3. **"Message Center" dropdown item** — `Bell` icon + inline orange pill count.

The dropdown calls `refetch()` on open so count is always fresh after visiting the page.


