# CommodityGH — API Integration Prompt for Antigravity
### Connect the React frontend to the Spring Boot backend

---

## CONTEXT

You have access to two folders:
- **Backend** — Spring Boot 3.3 REST API running at `http://localhost:8080/api/v1`
- **Frontend** — React 18 + Vite app with Axios, React Query, and Framer Motion

The frontend was generated from a Lovable prompt. It has all pages, components, and routing built. The API module files (`src/api/`) may have placeholder functions or be empty. Your job is to wire every page to its real backend endpoint.

The backend is fully built. All endpoints are live. Do not modify the backend.

---

## STEP 1 — SET UP THE AXIOS INSTANCE

Create or replace `src/api/axios.js` with this exact implementation:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request
api.interceptors.request.use(config => {
  const token = window.__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — clear token and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.__authToken = null;
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## STEP 2 — WIRE UP AUTH (`src/api/auth.js`)

```js
import api from './axios';

export const login    = (username, password) =>
  api.post('/auth/login', { username, password });

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });
```

**In `AuthContext.jsx`:**
- On `login()` success: store `response.data.data.token` in both `window.__authToken` and React state. Also store `response.data.data.role` and `response.data.data.username`.
- On `logout()`: clear `window.__authToken`, clear state, redirect to `/`.
- On app load: if token exists in state, re-set `window.__authToken = token` so the interceptor picks it up after a hot reload.
- The register endpoint is public — no auth needed. After successful registration, auto-login using the same credentials.

---

## STEP 3 — WIRE UP ALL API MODULE FILES

### `src/api/commodities.js`
```js
import api from './axios';

export const getAllCommodities       = ()   => api.get('/commodities');
export const getCommodityById        = (id) => api.get(`/commodities/${id}`);
export const getCommoditiesByCategory= (cat)=> api.get(`/commodities/category/${cat}`);
```

### `src/api/cities.js`
```js
import api from './axios';

export const getAllCities     = ()      => api.get('/cities');
export const getCityById      = (id)   => api.get(`/cities/${id}`);
export const getCitiesByRegion= (region)=> api.get(`/cities/region/${region}`);
```

### `src/api/markets.js`
```js
import api from './axios';

export const getAllMarkets      = ()       => api.get('/markets');
export const getMarketById      = (id)    => api.get(`/markets/${id}`);
export const getMarketsByCity   = (cityId)=> api.get(`/markets/city/${cityId}`);
```

### `src/api/priceRecords.js`
```js
import api from './axios';

export const getAllPriceRecords       = (page=0, size=20) =>
  api.get('/price-records', { params: { page, size } });

export const getPriceRecordById      = (id)          => api.get(`/price-records/${id}`);
export const getPriceRecordsByCommodity = (commodityId) => api.get(`/price-records/commodity/${commodityId}`);
export const getPriceRecordsByMarket = (marketId)    => api.get(`/price-records/market/${marketId}`);
export const createPriceRecord       = (data)        => api.post('/price-records', data);
export const updatePriceRecord       = (id, data)    => api.put(`/price-records/${id}`, data);
export const deletePriceRecord       = (id)          => api.delete(`/price-records/${id}`);

// Field Agent / Admin
export const approvePriceRecord  = (id, data) => api.post(`/price-records/${id}/approve`, data);
export const getPendingRecords   = ()          => api.get('/price-records/pending');
export const getMySubmissions    = ()          => api.get('/price-records/my-submissions');
```

### `src/api/analytics.js`
```js
import api from './axios';

export const getMonthlyTrend     = (commodityId, months=12) =>
  api.get(`/analytics/trends/${commodityId}`, { params: { months } });

export const getCityComparison   = (commodityId) =>
  api.get(`/analytics/city-comparison/${commodityId}`);

export const getPriceVolatility  = () => api.get('/analytics/volatility');

export const getInflationTrend   = (commodityId) =>
  api.get(`/analytics/inflation/${commodityId}`);

export const getForecast         = (commodityId) =>
  api.get(`/analytics/forecast/${commodityId}`);

export const getDataQualityReport= () => api.get('/analytics/data-quality');
```

### `src/api/health.js`
```js
import api from './axios';

export const getAllHealthScores        = ()      => api.get('/health');
export const getHealthScoreForMarket   = (id)   => api.get(`/health/${id}`);
export const getTopMarkets             = (n=5)  => api.get('/health/top', { params: { limit: n } });
export const getUnderperformingMarkets = ()     => api.get('/health/underperforming');
export const recomputeHealthScores     = ()     => api.post('/health/recompute');
```

### `src/api/seasonal.js`
```js
import api from './axios';

export const getSeasonalPatterns   = (commodityId) =>
  api.get(`/seasonal/${commodityId}`);

export const getBestMonthToBuy     = (commodityId) =>
  api.get(`/seasonal/${commodityId}/best-month`);

export const getWorstMonthToBuy    = (commodityId) =>
  api.get(`/seasonal/${commodityId}/worst-month`);

export const getCurrentOutlook     = (commodityId) =>
  api.get(`/seasonal/${commodityId}/outlook`);

export const recomputeAllPatterns  = ()           => api.post('/seasonal/recompute');
export const recomputeForCommodity = (commodityId)=> api.post(`/seasonal/recompute/${commodityId}`);
```

### `src/api/public.js`
```js
import api from './axios';

export const getDashboardSummary   = ()             => api.get('/public/dashboard-summary');
export const getLatestPrices       = (params={})    => api.get('/public/latest-prices', { params });
export const getPriceRange         = (commodityId, cityId) =>
  api.get(`/public/price-range/${commodityId}`, { params: { cityId } });
export const getCommoditySpotlight = (commodityId)  => api.get(`/public/commodity-spotlight/${commodityId}`);
```

### `src/api/exports.js`
```js
import api from './axios';

// Returns a blob — handle with URL.createObjectURL in the component
export const exportPriceRecords = (filters) =>
  api.post('/export/price-records', filters, { responseType: 'blob' });

export const getMyExportHistory  = ()       => api.get('/export/my-exports');
export const getAllExportHistory  = (page=0)=> api.get('/export/all-exports', { params: { page } });
```

---

## STEP 4 — CONNECT EACH PAGE

Connect every page using **React Query** (`useQuery` / `useMutation`). Use `staleTime: 5 * 60 * 1000` (5 minutes) on all read queries. Show skeleton loaders while loading. Show an error message on failure — never a blank screen.

---

### `LandingPage.jsx`
- Call `getDashboardSummary()` to populate the live price ticker strip and the stat counters.
- The 6 commodity preview cards each pull their name/unit from the dashboard summary response.
- Guest gate: show a frosted overlay on charts with "Sign in to see full data" — do NOT hide the cards entirely.

---

### `DashboardPage.jsx`
- Call `getDashboardSummary()` on mount.
- **If guest** (`principal === null`): render the 7-day national averages only. Hide city breakdown and movement arrows. Show `<GatePrompt />` over the charts section.
- **If authenticated**: render full dashboard — price movements (up/down/stable), volatility summary, market health table (A–F grades), and if `role === 'ADMIN'` show the pending submissions count badge.
- Use `useQuery(['dashboard'], getDashboardSummary)`.

---

### `CommoditiesPage.jsx`
- Call `getAllCommodities()` to render the 6 commodity cards.
- Each card shows: name, unit, current average price (from `getLatestPrices({ limit: 6 })`), and a seasonal badge from `getCurrentOutlook(commodity.id)`.
- For the sparkline on each card: call `getMonthlyTrend(commodity.id, 3)` (last 3 months).

---

### `CommodityDetailPage.jsx` — `useParams()` for `:id`
Wire up all 4 tabs independently using React Query:

| Tab | API call |
|-----|----------|
| **Overview** | `getLatestPrices({ commodityId: id })` + `getPriceRange(id)` |
| **Trends** | `getMonthlyTrend(id, months)` — months selector: 3 / 6 / 12 |
| **City Comparison** | `getCityComparison(id)` |
| **Seasonal** | `getSeasonalPatterns(id)` — gate to 3 months for guests |
| **Analytics** | `getInflationTrend(id)` + `getForecast(id)` |

- If guest hits the Seasonal tab: call `getCurrentOutlook(id)` and show only the current month card. Render `<GatePrompt />` over the 12-month grid.
- If guest hits the Analytics tab: show `<GatePrompt />` — do not call the endpoint.

---

### `MarketsPage.jsx`
- Call `getAllHealthScores()`.
- Each market card shows: market name, city, health grade badge (A–F), and score.
- **If guest**: show only the grade letter. Hide the sub-score progress bars and show `<GatePrompt />` inline.
- **If authenticated**: show full score breakdown.
- Top 5 markets: call `getTopMarkets(5)` and highlight them.

---

### `MarketDetailPage.jsx` — `useParams()` for `:id`
- Call `getHealthScoreForMarket(id)` for the radial score chart.
- Call `getMarketById(id)` for market metadata.
- Call `getLatestPrices({ marketId: id })` for the latest prices table.
- Auth required for this page — redirect guests to `/login` with `returnUrl`.

---

### `AnalyticsPage.jsx`
- Auth required — redirect guests.
- Call `getPriceVolatility()` → render the volatility ranking list.
- For each commodity in the inflation section: call `getInflationTrend(commodityId)`.
- Call `getForecast(commodityId)` for the moving average forecast table.
- If `role === 'ADMIN' || role === 'ANALYST'`: also call `getDataQualityReport()` and render the data quality panel at the bottom.

---

### `SeasonalPage.jsx`
- Load all commodities: `getAllCommodities()`.
- For each commodity, call `getCurrentOutlook(commodity.id)` to render the outlook cards (visible to guests).
- **If authenticated**: call `getSeasonalPatterns(commodity.id)` to render the full 12-month heatmap grid.
- **If guest**: render the current month outlook cards only. Show `<GatePrompt />` over the 12×6 heatmap grid.

---

### `ExportPage.jsx`
- Auth required: `ANALYST`, `FIELD_AGENT`, or `ADMIN` only.
- On form submit: call `exportPriceRecords(filters)` where filters = `{ commodityId, marketId, cityId, fromDate, toDate, exportType, includeAnalyticsSummary }`.
- Handle the blob response with:
  ```js
  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `commoditygh-export.${filters.exportType === 'EXCEL' ? 'xlsx' : 'csv'}`;
  a.click();
  URL.revokeObjectURL(url);
  ```
- Call `getMyExportHistory()` to populate the export history table below the form.
- If `role === 'ADMIN'`: also call `getAllExportHistory()` and show a second "All Exports" tab.

---

### `SubmitPricePage.jsx`
- Auth required: `FIELD_AGENT` or `ADMIN` only.
- Load commodity dropdown: `getAllCommodities()`.
- Load market dropdown: `getAllMarkets()`. When a market is selected, auto-fill city by calling `getMarketById(marketId)` and reading `market.cityId`.
- On form submit: `createPriceRecord({ commodityId, marketId, price, recordedDate, source })`.
- On success: show a green toast — "Submitted for review. An admin will approve within 24 hours."
- Below the form: call `getMySubmissions()` and render a table showing each submission with its status badge (PENDING = amber, APPROVED = green, REJECTED = red).

---

### `PendingSubmissionsPage.jsx`
- Auth required: `ADMIN` only.
- Call `getPendingRecords()` to load the queue.
- Each row shows: commodity, market, price, submitted by (username), submitted at, days pending.
- Days pending > 24hrs: highlight the row in amber.
- Days pending > 48hrs: highlight in red.
- **Approve button**: call `approvePriceRecord(id, {})` → on success, remove row from queue and show green toast.
- **Reject button**: open a modal with a `rejectionReason` text field → call `approvePriceRecord(id, { approved: false, rejectionReason })`.
- Use `useMutation` with `onSuccess: () => queryClient.invalidateQueries(['pending'])` to refresh the list after each action.

---

### `AdminDashboardPage.jsx`
- Auth required: `ADMIN` only.
- Call `getDashboardSummary()` for the overview stat cards.
- Call `getAllHealthScores()` for the market health donut chart.
- Call `getDataQualityReport()` for the data quality panel (completeness %, duplicate alerts, outlier count).
- Call `getPendingRecords()` to show the pending count badge and a preview of the top 5 oldest pending items.
- Quick action buttons:
  - "Recompute Health Scores" → `recomputeHealthScores()` → toast on success
  - "Recompute Seasonal Patterns" → `recomputeAllPatterns()` → toast on success

---

## STEP 5 — RESPONSE SHAPE

All backend responses follow this wrapper:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

Always access `response.data.data` for the actual payload.

For **paginated** responses (price records, export history), the shape is:
```json
{
  "data": {
    "content": [...],
    "totalElements": 120,
    "totalPages": 6,
    "number": 0
  }
}
```

For **blob** responses (export), do NOT unwrap — use `response.data` directly.

---

## STEP 6 — GUEST vs AUTHENTICATED LOGIC

Use this helper in `AuthContext.jsx` and consume it everywhere via `useAuth()`:

```js
const isGuest      = () => !token;
const isAdmin      = () => role === 'ADMIN';
const isFieldAgent = () => role === 'FIELD_AGENT';
const isAnalyst    = () => role === 'ANALYST' || role === 'ADMIN';
const canExport    = () => ['ANALYST','FIELD_AGENT','ADMIN'].includes(role);
const canSubmit    = () => ['FIELD_AGENT','ADMIN'].includes(role);
```

The `<GatePrompt />` component should:
- Render a frosted glass overlay (backdrop-filter: blur(6px)) over the gated content
- Show: "Sign in for full access" with a green "Create Free Account" button and a smaller "Sign In" link
- Never fully hide the content behind it — use `pointer-events: none` on the blurred content so the user can see it is there

---

## STEP 7 — ERROR HANDLING

For every `useQuery`, handle error states:
```jsx
if (isError) return (
  <div className="error-state">
    <p>Could not load data. Please try again.</p>
    <button onClick={() => refetch()}>Retry</button>
  </div>
);
```

For every `useMutation`, show a toast on error:
```js
onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong')
```

---

## STEP 8 — REACT QUERY SETUP

In `main.jsx` or `App.jsx`, wrap the app with:
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## STEP 9 — QUERY KEY CONVENTIONS

Use these consistent query keys across all components:

| Data | Query Key |
|------|-----------|
| Dashboard summary | `['dashboard']` |
| All commodities | `['commodities']` |
| Single commodity | `['commodity', id]` |
| Monthly trend | `['trend', commodityId, months]` |
| City comparison | `['cityComparison', commodityId]` |
| Volatility | `['volatility']` |
| Inflation | `['inflation', commodityId]` |
| Forecast | `['forecast', commodityId]` |
| All markets | `['markets']` |
| Single market | `['market', id]` |
| Health scores | `['health']` |
| Market health | `['health', marketId]` |
| Seasonal patterns | `['seasonal', commodityId]` |
| Seasonal outlook | `['outlook', commodityId]` |
| Pending records | `['pending']` |
| My submissions | `['mySubmissions']` |
| My export history | `['myExports']` |
| Data quality | `['dataQuality']` |

---

## WHAT NOT TO CHANGE

- Do not modify any backend files
- Do not change the routing structure — all routes are already defined
- Do not change the design system, colors, or component styling
- Do not change the layout components (`AppLayout`, `Sidebar`, `Topbar`)
- Only touch files inside `src/api/`, `src/context/AuthContext.jsx`, and the `src/pages/` data-fetching logic

---

## DONE WHEN

- Every page renders real data from the backend with no hardcoded mock values
- Loading states show skeleton components (already built)
- Error states show a retry UI
- Guest users see preview data + `<GatePrompt />` on gated sections
- Authenticated users see full data based on their role
- The export download produces a real file
- Approve/reject on pending submissions updates the queue in real time
- Admin dashboard shows live data quality stats and pending count
