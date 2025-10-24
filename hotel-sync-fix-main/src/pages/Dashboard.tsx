import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LoadingPage } from '@/components/LoadingSpinner';
import { AlertMessage } from '@/components/AlertMessage';

export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.error;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (location.pathname === '/dashboard' && !loading) {
      if (isAdmin) {
        navigate('/dashboard/rooms');
      } else {
        navigate('/dashboard/reservations');
      }
    }
  }, [location.pathname, isAdmin, loading, navigate]);

  if (loading) {
    return <LoadingPage text="Carregando dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {errorMessage && (
              <div className="mb-4">
                <AlertMessage
                  type="error"
                  title="Acesso Negado"
                  message={errorMessage}
                  onClose={() => navigate(location.pathname, { replace: true, state: {} })}
                />
              </div>
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
