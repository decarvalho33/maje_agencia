import { useHub } from "@/contexts/HubContext";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { Radar, Target, FileText, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";

const moduleNodes = [
  { id: "captacao", label: "Captação", icon: Radar, x: 20, y: 15, url: "/captacao" },
  { id: "servicos", label: "Serviços", icon: Target, x: 70, y: 15, url: "/servicos" },
  { id: "contratos", label: "Contratos", icon: FileText, x: 20, y: 55, url: "/contratos" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, x: 70, y: 55, url: "/financeiro" },
  { id: "atencao", label: "Atenção", icon: AlertTriangle, x: 45, y: 85, url: "/atencao" },
];

const connections = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4], [0, 4], [1, 4],
];

export default function Overview() {
  const { data } = useHub();
  const navigate = useNavigate();

  const totalRevenue = data.revenues.reduce((s, r) => s + r.amount, 0);
  const totalCosts = data.costs.reduce((s, c) => s + c.amount, 0);
  const activeProjects = data.contracts.filter(c => c.status === "em_andamento" || c.status === "revisao").length;
  const openAlerts = data.alerts.filter(a => !a.resolved).length;
  const closedLeads = data.leads.filter(l => l.status === "fechado").length;
  const conversionRate = data.leads.length > 0 ? Math.round((closedLeads / data.leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground font-body">Central de operações MAJE</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Faturamento" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`} trend="up" trendValue="este mês" />
        <MetricCard title="Projetos Ativos" value={activeProjects} subtitle="em andamento" />
        <MetricCard title="Conversão" value={`${conversionRate}%`} trend={conversionRate > 50 ? "up" : "down"} trendValue="leads → clientes" />
        <MetricCard title="Alertas" value={openAlerts} trend={openAlerts > 2 ? "down" : "up"} trendValue="pendentes" />
      </div>

      {/* Neural Network Map */}
      <div className="glass-panel p-6">
        <h2 className="font-heading text-sm font-semibold text-foreground mb-4">Mapa Neural — Módulos</h2>
        <div className="relative w-full" style={{ height: 320 }}>
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {connections.map(([a, b], i) => {
              const na = moduleNodes[a];
              const nb = moduleNodes[b];
              return (
                <line
                  key={i}
                  x1={`${na.x}%`} y1={`${na.y + 5}%`}
                  x2={`${nb.x}%`} y2={`${nb.y + 5}%`}
                  className="stroke-primary/20"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                />
              );
            })}
          </svg>
          {/* Nodes */}
          {moduleNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => navigate(node.url)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
              style={{ left: `${node.x}%`, top: `${node.y + 5}%`, zIndex: 1 }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary border border-border/50 flex items-center justify-center group-hover:neural-glow group-hover:border-primary/50 transition-all duration-300">
                <node.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors">
                {node.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pontos de Atenção Preview */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Pontos de Atenção
          </h2>
          <button onClick={() => navigate("/atencao")} className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {data.alerts.filter(a => !a.resolved).slice(0, 3).map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-3">
                <StatusBadge status={alert.urgency} />
                <div>
                  <p className="text-sm font-body text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
