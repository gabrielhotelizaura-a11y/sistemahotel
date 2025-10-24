import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateEnv } from "@/lib/env";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/dashboard/Rooms";
import Prices from "./pages/dashboard/Prices";
import Statistics from "./pages/dashboard/Statistics";
import Reservations from "./pages/dashboard/Reservations";
import FutureReservations from "./pages/dashboard/FutureReservations";
import Expenses from "./pages/dashboard/Expenses";
import NotFound from "./pages/NotFound";
import { CACHE_TIME } from "./lib/constants";

// Validate environment variables on app start
validateEnv();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.MEDIUM,
      gcTime: CACHE_TIME.LONG,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="rooms" element={<Rooms />} />
              <Route path="prices" element={<Prices />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="future" element={<FutureReservations />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
