# HueDora Connect — Frontend

React + Vite single-page application for healthcare camp operations: dashboard, camp workflow, client master, Excel import, and user management.

## Tech stack

- **React 18** with React Router 7
- **Vite 6** for dev server and builds
- **Axios** for API calls with JWT refresh interceptor
- **Recharts** for dashboard charts (toggle via eye icon in header)

## Prerequisites

- Node.js 18+
- API server running (default `http://localhost:5000`)

## Quick start

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

The dev server proxies `/api` to the backend when configured in `vite.config.js`, or set `VITE_API_URL` explicitly.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

## Environment variables

Optional `.env` in `frontend/`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | API base URL |
| `VITE_EMAIL_DOMAIN` | `huedoraconnect.com` | Domain for demo login buttons |
| `VITE_DEMO_SERVER` | `true` | Show quick-login demo buttons on login page |

## Project structure

```
frontend/src/
├── App.jsx                  # Routes + permission guards
├── layouts/
│   └── AppLayout.jsx        # Sidebar, topbar, page title
├── pages/                   # Route screens
├── components/              # Reusable UI (filters, modals, tables)
├── context/
│   └── AuthContext.jsx      # Auth state, login, permissions
├── services/
│   ├── api.js               # Axios instance + token refresh
│   └── endpoints.js         # API method wrappers
├── constants/               # Roles, camp names, pagination
├── hooks/                   # useAutoDismiss, keyboard dropdown
└── utils/                   # Dates, validation, bulk actions
```

## Routes & access

| Path | Page | Who can access |
|------|------|----------------|
| `/login` | Login | Public |
| `/signup` | Request account | Public |
| `/forgot-password` | Password reset | Public |
| `/` | Dashboard | Authenticated |
| `/camps` | Camps list | `camps:read` |
| `/camps/new` | Create camp | `camps:create` or `camps:update` |
| `/camps/:id/edit` | Edit camp | `camps:update`, `camps:approve`, or `camps:edit-pending` |
| `/client-masters` | Client Master | `client-masters:read` |
| `/client-masters/new` | New program | `client-masters:create` |
| `/client-masters/:id/edit` | Edit program | `client-masters:update` |
| `/import` | Excel import | Admin / super admin |
| `/users` | User management | Strict `admin` role only |

Route guards live in `App.jsx` (`PermissionRoute`, `AdminRoute`, `StrictAdminRoute`).

## Main features

### Dashboard
- Date range filters with quick presets
- Camp status widgets, reaction alerts (off-hours, weekend, overdue)
- Brand / campaign hierarchy cards
- Optional charts panel (toggle from topbar eye icon)

### Camps
- Search, status/alert filters, date range, active filter chips
- Bulk select: approve, reject, execute, delete (permission + eligibility checks on frontend)
- Row actions: edit, approve, reject, execute
- Info modal: camp details, overdue delay, cancel info, actions
- Confirm modals for all destructive/workflow actions

### Client Master
- Tabs: **Program Configuration** and **Clients**
- Program search, PDF view, create/edit with validation
- Clients tab: search, create/edit/archive companies (admin only for new companies)

### Users (admin)
- Search + status pill filters
- Create/edit users, approve signups, activate/deactivate
- Optional **Roles & Permissions** side panel (toggle from toolbar)

### Import (admin)
- Upload Excel, map columns, preview, save templates, confirm import

## Roles (UI behaviour)

Defined in `src/constants/roles.js` and enforced via `AuthContext.hasPermission()`:

| Role | UI highlights |
|------|----------------|
| **Admin** | Full camps workflow, import, users, client master |
| **Operations Executive** | Create/edit/execute camps; client master programs; no approve/reject/users |
| **Reviewer** | Edit pending camps, approve only; no reject/delete/cancel |
| **Read Only** | View dashboard, camps, client master — no edits |

Demo quick-logins on the login page use `@huedoraconnect.com` (configurable via `VITE_EMAIL_DOMAIN`).

## Key components

| Component | Purpose |
|-----------|---------|
| `CampsFilters` | Camps search + date/status filters |
| `UsersFilters` | Users search bar + status pills |
| `SelectDropdown` | Custom dropdown (replaces native `<select>` where needed) |
| `CampActionConfirmModal` | Approve/reject/cancel/delete/execute confirmations |
| `CampRowInfoMenu` | Camp details modal from row **i** icon |
| `RolesPermissionsPanel` | Role permission preview on Users page |
| `Pagination` | Shared table pagination |

## API integration

- Base client: `src/services/api.js`
- Endpoint helpers: `src/services/endpoints.js`
- Access token in `localStorage`; automatic refresh on 401
- Unauthorized → redirect to `/login`

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@huedoraconnect.com | admin123 |
| Operations | ops@huedoraconnect.com | admin123 |
| Reviewer | reviewer@huedoraconnect.com | admin123 |
| Read Only | viewer@huedoraconnect.com | admin123 |

Requires seeded backend (`npm run seed` in `server/`).

## Related docs

- [../README.md](../README.md) — full platform overview
- [../server/README.md](../server/README.md) — API reference
