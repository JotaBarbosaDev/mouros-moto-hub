
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  CalendarDays, 
  Package, 
  Settings, 
  LogOut, 
  Bike, 
  Beer,
  CreditCard,
  History,
  LayoutDashboard,
  ShoppingCart,
  Shield,
  User
} from 'lucide-react';

export function SidebarNav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isAdmin = user?.email === 'admin@admin.com';
  
  // Definição dos itens do menu
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      category: "principal"
    },
    {
      title: "Membros",
      icon: Users,
      href: "/membros",
      category: "principal"
    },
    {
      title: "Eventos",
      icon: CalendarDays,
      href: "/eventos",
      category: "principal"
    },
    {
      title: "Calendário",
      icon: Calendar,
      href: "/calendario",
      category: "principal"
    },
    {
      title: "Bar",
      icon: Beer,
      href: "/bar-management",
      category: "gestao"
    },
    {
      title: "Produtos",
      icon: ShoppingCart,
      href: "/produtos",
      category: "gestao"
    },
    {
      title: "Tesouraria",
      icon: CreditCard, 
      href: "/tesouraria",
      category: "gestao"
    },
    {
      title: "Escala",
      icon: Calendar,
      href: "/escala",
      category: "gestao"
    },
    {
      title: "Inventário",
      icon: Package,
      href: "/inventario",
      category: "gestao"
    },
    {
      title: "Garagem",
      icon: Bike,
      href: "/garagem",
      category: "outros"
    },
    {
      title: "Histórico",
      icon: History,
      href: "/historico",
      category: "outros"
    },
    ...(isAdmin
      ? [
          {
            title: "Administração",
            icon: Shield,
            href: "/administracao",
            category: "outros"
          },
        ]
      : []),
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      category: "outros"
    },
  ];

  // Separar itens por categoria
  const principalItems = menuItems.filter(item => item.category === "principal");
  const gestaoItems = menuItems.filter(item => item.category === "gestao");
  const outrosItems = menuItems.filter(item => item.category === "outros");

  const renderMenuItem = (item) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={location.pathname === item.href}
        tooltip={item.title}
        className={cn(
          "relative overflow-hidden",
          location.pathname === item.href 
            ? "bg-gray-100 border-l-2 border-mouro-red font-medium" 
            : "hover:bg-gray-50"
        )}
      >
        <Link to={item.href} className="w-full">
          <div className="flex items-center">
            <item.icon className={cn(
              "h-4 w-4 mr-3 ml-1",
              location.pathname === item.href
                ? "text-mouro-red"
                : "text-gray-500"
            )} />
            <span>{item.title}</span>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo e Cabeçalho */}
      <div className="flex flex-col items-center py-5 px-2 mb-2 border-b border-gray-200">
        <div className="flex flex-col items-center">
          {/* Logo simplificado */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-mouro-red text-white">
            <span className="font-display text-xl">MC</span>
          </div>
          
          {/* Título simplificado */}
          <h3 className="font-display text-mouro-red text-lg mt-2">OS MOUROS</h3>
          
          {/* Área de Membros */}
          <div className="text-xs text-gray-500 mt-1">
            Área de Membros
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-3 py-2 text-xs uppercase font-medium text-gray-500">
            Principal
          </div>
          <SidebarMenu>
            {principalItems.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Menu Gestão */}
      <SidebarGroup className="mt-2">
        <SidebarGroupContent>
          <div className="px-3 py-2 text-xs uppercase font-medium text-gray-500">
            Gestão
          </div>
          <SidebarMenu>
            {gestaoItems.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Menu Outros */}
      <SidebarGroup className="mt-2">
        <SidebarGroupContent>
          <div className="px-3 py-2 text-xs uppercase font-medium text-gray-500">
            Outros
          </div>
          <SidebarMenu>
            {outrosItems.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Perfil do Usuário e Botão de Sair */}
      <div className="mt-auto">
        {/* Perfil do Usuário */}
        <div className="mb-2 px-4 pt-4 pb-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium truncate">
                {user?.email?.split('@')[0] || 'Usuário'}
              </div>
              <div className="text-xs text-gray-500 truncate flex items-center">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  isAdmin ? "bg-mouro-red" : "bg-green-400"
                )}></span>
                {isAdmin ? 'Administrador' : 'Membro'}
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Sair */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  tooltip="Sair da aplicação"
                  className="w-full hover:bg-red-50 hover:text-red-600"
                >
                  <div className="flex items-center">
                    <LogOut className="h-4 w-4 mr-3 ml-1 text-gray-500" />
                    <span>Sair</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      
      {/* Footer com versão */}
      <div className="text-center pb-2 pt-1 text-[10px] text-gray-400">
        <span>Mouros Moto Hub v1.0</span>
      </div>
    </div>
  );
}
