
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
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
  ShoppingCart
} from 'lucide-react';

export function SidebarNav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isAdmin = user?.email === 'admin@admin.com';

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Membros",
      icon: Users,
      href: "/membros",
    },
    {
      title: "Eventos",
      icon: CalendarDays,
      href: "/eventos",
    },
    {
      title: "Bar",
      icon: Beer,
      href: "/bar-management",
    },
    {
      title: "Produtos",
      icon: ShoppingCart,
      href: "/produtos",
    },
    {
      title: "Caixa",
      icon: CreditCard, 
      href: "/caixa",
    },
    {
      title: "Histórico",
      icon: History,
      href: "/historico",
    },
    {
      title: "Escala",
      icon: Calendar,
      href: "/escala",
    },
    {
      title: "Garagem",
      icon: Bike,
      href: "/garagem",
    },
    {
      title: "Inventário",
      icon: Package,
      href: "/inventario",
    },
    ...(isAdmin
      ? [
          {
            title: "Administração",
            icon: Users,
            href: "/administracao",
          },
        ]
      : []),
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-bold text-mouro-red">Os Mouros MC</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.title}
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  location.pathname === item.href ? "bg-mouro-red/10 text-mouro-red" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Link to={item.href} className="w-full">
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors",
                    location.pathname === item.href ? "text-mouro-red" : ""
                  )} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sair"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
