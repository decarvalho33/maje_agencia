import { Badge } from "@/components/ui/badge";

type Status = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  prospect: { label: "Prospect", className: "bg-muted text-muted-foreground" },
  contato: { label: "Contato", className: "bg-primary/20 text-primary" },
  proposta: { label: "Proposta", className: "bg-warning/20 text-warning" },
  fechado: { label: "Fechado", className: "bg-success/20 text-success" },
  perdido: { label: "Perdido", className: "bg-danger/20 text-danger" },
  em_andamento: { label: "Em andamento", className: "bg-primary/20 text-primary" },
  revisao: { label: "Revisão", className: "bg-warning/20 text-warning" },
  entregue: { label: "Entregue", className: "bg-success/20 text-success" },
  cancelado: { label: "Cancelado", className: "bg-danger/20 text-danger" },
  alta: { label: "Alta", className: "bg-danger/20 text-danger" },
  media: { label: "Média", className: "bg-warning/20 text-warning" },
  baixa: { label: "Baixa", className: "bg-success/20 text-success" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={`border-0 text-[10px] font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
