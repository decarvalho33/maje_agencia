import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Radar, Target, FileText, DollarSign, AlertTriangle, Network,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const modules = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Processo Central", url: "/processo", icon: Network, highlight: true },
  { title: "Captação", url: "/captacao", icon: Radar },
  { title: "Serviços", url: "/servicos", icon: Target },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Atenção", url: "/atencao", icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="pt-4">
        {/* Logo */}
        <div className={`px-4 mb-6 ${collapsed ? "text-center" : ""}`}>
          <h1 className="font-heading font-bold text-primary text-xl tracking-wider">
            {collapsed ? "M" : "MAJE"}
          </h1>
          {!collapsed && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Hub
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => {
                const active = location.pathname === item.url;
                const isHighlight = (item as any).highlight;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`cursor-pointer transition-all duration-200 ${
                        isHighlight && !active
                          ? "bg-foreground/90 text-background hover:bg-foreground hover:text-background font-semibold"
                          : active
                            ? "bg-primary/15 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="font-body text-sm">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
