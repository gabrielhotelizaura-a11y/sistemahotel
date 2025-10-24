import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Hotel, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Sistema Hoteleiro</span>
          </div>
          <Button onClick={() => navigate('/auth')}>Entrar</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Gerencie seu Hotel com Facilidade</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão hoteleira com controle de quartos, reservas e estatísticas em tempo real
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>Começar Agora</Button>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg border">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestão de Reservas</h3>
                <p className="text-muted-foreground">Controle completo de reservas atuais e futuras</p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Controle de Preços</h3>
                <p className="text-muted-foreground">Atualize preços de quartos rapidamente</p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Estatísticas</h3>
                <p className="text-muted-foreground">Análise de receitas e ocupação mensal</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
