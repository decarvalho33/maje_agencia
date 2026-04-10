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
        <div className={`px-3 mb-6 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "" : "px-1"}`}>
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/20 via-background to-primary/10 shadow-[0_10px_30px_-18px_hsl(var(--primary))]">
              <span className="absolute left-[9px] top-[4px] text-[1.45rem] font-black italic leading-none tracking-[-0.12em] text-primary">
                M
              </span>
              <span className="absolute left-[20px] top-[13px] text-[1.5rem] font-black leading-none tracking-[-0.08em] text-foreground">
                J
              </span>
              <span className="absolute inset-x-2 bottom-2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-heading text-sm font-semibold uppercase tracking-[0.28em] text-foreground">
                  MAJE
                </h1>
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Administração
                </span>
              </div>
            )}
          </div>
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
