import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CommoditiesPage from "@/pages/CommoditiesPage";
import CommodityDetailPage from "@/pages/CommodityDetailPage";
import MarketsPage from "@/pages/MarketsPage";
import MarketDetailPage from "@/pages/MarketDetailPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SeasonalPage from "@/pages/SeasonalPage";
import ExportPage from "@/pages/ExportPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import PendingSubmissionsPage from "@/pages/PendingSubmissionsPage";
import SubmitPricePage from "@/pages/SubmitPricePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* App routes with sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/commodities" element={<CommoditiesPage />} />
              <Route path="/commodities/:id" element={<CommodityDetailPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/markets/:id" element={<MarketDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/seasonal" element={<SeasonalPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/pending" element={<PendingSubmissionsPage />} />
              <Route path="/submit-price" element={<SubmitPricePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
