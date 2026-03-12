# CommodityGH — Ghana Commodity Price Monitoring

Real-time commodity price intelligence across Ghana's major markets. Track Maize, Rice, Tomato, Yam, Plantain, and Groundnut prices.

## Technologies

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Data Fetching**: React Query, Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd commoditygh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Ensure the backend is running at `http://localhost:8080`. API configurations are located in `src/api/`.

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

## Project Structure

- `src/api`: API client and service modules.
- `src/components`: Reusable UI components and charts.
- `src/hooks`: Custom React hooks (auth, etc).
- `src/pages`: Main application views and routing logic.
- `src/utils`: Formatting and constant utilities.

---
© 2026 CommodityGH. Developed for Ghana's agricultural data transparency.
