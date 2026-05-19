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
    → AuditEventsProvider → MessageCenterProvider → SidebarProvider
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
| `contexts/MessageCenterContext.tsx` | Message Center state + read tracking |
| `app/client-layout.tsx` | Provider tree |
| `components/DataTable.tsx` | Reusable table |
| `components/Sidebar.tsx` | Navigation |
| `app/configuration/policies/page.tsx` | Full-featured page example |
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


