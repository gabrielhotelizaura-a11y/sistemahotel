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

function EnvErrorScreen({ message }: { message: string }) {
  const checks = [
    ["VITE_SUPABASE_URL", !!import.meta.env.VITE_SUPABASE_URL],
    ["VITE_SUPABASE_PUBLISHABLE_KEY", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY],
    ["VITE_SUPABASE_PROJECT_ID", !!import.meta.env.VITE_SUPABASE_PROJECT_ID],
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl rounded-lg border p-6 space-y-4 bg-card text-card-foreground">
        <h1 className="text-xl font-semibold">Erro de configuração do ambiente</h1>
        <p className="text-sm text-muted-foreground break-words">{message}</p>
        <div className="text-sm">
          <p className="font-medium mb-2">Variáveis obrigatórias:</p>
          <ul className="space-y-1">
            {checks.map(([name, ok]) => (
              <li key={name}>
                {ok ? "✅" : "❌"} {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  try {
    validateEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao validar ambiente";
    return <EnvErrorScreen message={message} />;
  }

  return (
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
};

export default App;
