import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useHub } from "@/contexts/HubContext";

export function HubLayout({ children }: { children: ReactNode }) {
  const { error, isConfigured } = useHub();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="min-h-12 flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2 shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {(!isConfigured || error) && (
              <p className="text-xs text-warning text-right max-w-xl">
                {error ?? "Configure o Supabase para usar persistência remota."}
              </p>
            )}
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
