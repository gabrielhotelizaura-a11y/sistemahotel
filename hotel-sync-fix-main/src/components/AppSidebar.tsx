import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Hotel, DoorOpen, Calendar, TrendingUp, DollarSign, LogOut, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const { isAdmin, userRole, signOut } = useAuth();
  const collapsed = state === 'collapsed';

  // Função para fechar sidebar no mobile após clicar
  const handleMobileNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // 🔍 DEBUG: Ver se isAdmin está correto
  console.log('═══════════════════════════════════════');
  console.log('🎯 AppSidebar RENDERIZOU');
  console.log('🎯 userRole recebido:', userRole);
  console.log('🎯 Tipo de userRole:', typeof userRole);
  console.log('🎯 isAdmin recebido:', isAdmin);
  console.log('🎯 Tipo de isAdmin:', typeof isAdmin);
  console.log('🎯 userRole === "admin"?', userRole === 'admin');
  console.log('🎯 isAdmin === true?', isAdmin === true);

  const adminItems = [
    { title: 'Quartos', url: '/dashboard/rooms', icon: DoorOpen },
    { title: 'Reservas', url: '/dashboard/reservations', icon: Calendar },
    { title: 'Futuras', url: '/dashboard/future', icon: Calendar },
    { title: 'Preços', url: '/dashboard/prices', icon: DollarSign },
    { title: 'Estatísticas', url: '/dashboard/statistics', icon: TrendingUp },
    { title: 'Despesas', url: '/dashboard/expenses', icon: Receipt },
  ];

  const funcionarioItems = [
    { title: 'Quartos', url: '/dashboard/rooms', icon: DoorOpen },
    { title: 'Reservas', url: '/dashboard/reservations', icon: Calendar },
    { title: 'Futuras', url: '/dashboard/future', icon: Calendar },
  ];

  console.log('📋 adminItems tem', adminItems.length, 'itens:', adminItems.map(i => i.title));
  console.log('📋 funcionarioItems tem', funcionarioItems.length, 'itens:', funcionarioItems.map(i => i.title));

  const items = isAdmin ? adminItems : funcionarioItems;

  console.log('✨ ESCOLHIDO:', isAdmin ? 'adminItems' : 'funcionarioItems');
  console.log('📋 Items FINAIS sendo mostrados:', items.map(i => i.title));
  console.log('═══════════════════════════════════════');
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="p-4 border-b flex items-center gap-2">
        <Hotel className="h-6 w-6 text-primary" />
        {!collapsed && <span className="font-semibold">Sistema Hotel</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? 'Admin' : 'Funcionário'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={handleMobileNavClick}
                      className={isActive(item.url) ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            handleMobileNavClick();
            signOut();
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
