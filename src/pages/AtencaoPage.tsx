import { useHub } from "@/contexts/HubContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { AlertModule } from "@/types/hub";

const moduleLabels: Record<AlertModule, string> = {
  captacao: "Captação",
  servicos: "Serviços",
  contratos: "Contratos",
  custos: "Financeiro",
};

export default function AtencaoPage() {
  const { data, resolveAlert, deleteAlert } = useHub();
  const [filter, setFilter] = useState<"all" | AlertModule>("all");

  const alerts = data.alerts.filter(a => {
    if (filter !== "all" && a.module !== filter) return false;
    return true;
  });
  const openAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  // Health by module
  const moduleHealth = (["captacao", "servicos", "contratos", "custos"] as AlertModule[]).map(mod => {
    const modAlerts = data.alerts.filter(a => a.module === mod && !a.resolved);
    const high = modAlerts.filter(a => a.urgency === "alta").length;
    const health = high > 0 ? "danger" : modAlerts.length > 0 ? "warning" : "success";
    return { module: mod, label: moduleLabels[mod], health, count: modAlerts.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" /> Pontos de Atenção
        </h1>
        <p className="text-sm text-muted-foreground font-body">Alertas e saúde dos módulos</p>
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moduleHealth.map(mh => (
          <div key={mh.module} className="glass-panel p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              mh.health === "success" ? "bg-success" : mh.health === "warning" ? "bg-warning" : "bg-danger"
            } ${mh.health !== "success" ? "animate-pulse-glow" : ""}`} />
            <div>
              <p className="text-sm font-heading font-medium text-foreground">{mh.label}</p>
              <p className="text-xs text-muted-foreground">{mh.count} alerta{mh.count !== 1 ? "s" : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "captacao", "servicos", "contratos", "custos"] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="text-xs"
          >
            {f === "all" ? "Todos" : moduleLabels[f]}
          </Button>
        ))}
      </div>

      {/* Open Alerts */}
      <div className="glass-panel p-4">
        <h2 className="font-heading text-sm font-semibold mb-3">Pendentes ({openAlerts.length})</h2>
        <div className="space-y-2">
          {openAlerts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta pendente 🎉</p>}
          {openAlerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusBadge status={alert.urgency} />
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{moduleLabels[alert.module]}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" onClick={() => void resolveAlert(alert.id)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => void deleteAlert(alert.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <div className="glass-panel p-4 opacity-60">
          <h2 className="font-heading text-sm font-semibold mb-3">Resolvidos ({resolvedAlerts.length})</h2>
          <div className="space-y-2">
            {resolvedAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-md bg-muted/10">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success" />
                  <p className="text-sm font-body text-muted-foreground line-through">{alert.title}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={() => void deleteAlert(alert.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
