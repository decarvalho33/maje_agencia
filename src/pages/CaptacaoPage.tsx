import { useState } from "react";
import { useHub } from "@/contexts/HubContext";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Radar } from "lucide-react";
import { LeadStatus } from "@/types/hub";

const funnelStages: { status: LeadStatus; label: string }[] = [
  { status: "prospect", label: "Prospect" },
  { status: "contato", label: "Contato" },
  { status: "proposta", label: "Proposta" },
  { status: "fechado", label: "Fechado" },
];

export default function CaptacaoPage() {
  const { data, addLead, updateLead, deleteLead } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", source: "", status: "prospect" as LeadStatus, value: "" });

  const leads = data.leads;
  const closed = leads.filter(l => l.status === "fechado").length;
  const convRate = leads.length > 0 ? Math.round((closed / leads.length) * 100) : 0;
  const totalPipeline = leads.filter(l => l.status !== "perdido").reduce((s, l) => s + (l.value || 0), 0);

  const handleAdd = async () => {
    await addLead({ ...form, value: form.value ? Number(form.value) : undefined });
    setForm({ name: "", email: "", source: "", status: "prospect", value: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" /> Captação & Pipeline
          </h1>
          <p className="text-sm text-muted-foreground font-body">Funil de leads e conversão</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Novo Lead</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Leads" value={leads.length} />
        <MetricCard title="Conversão" value={`${convRate}%`} trend={convRate > 40 ? "up" : "down"} />
        <MetricCard title="Pipeline" value={`R$ ${totalPipeline.toLocaleString("pt-BR")}`} />
        <MetricCard title="Fechados" value={closed} trend="up" />
      </div>

      {/* Funnel */}
      <div className="glass-panel p-4">
        <h2 className="font-heading text-sm font-semibold mb-4">Funil</h2>
        <div className="flex gap-2 items-end h-32">
          {funnelStages.map((stage) => {
            const count = leads.filter(l => l.status === stage.status).length;
            const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
            return (
              <div key={stage.status} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-heading font-bold">{count}</span>
                <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: `${Math.max(pct, 10)}%` }}>
                  <div className="absolute inset-0 rounded-t-md bg-primary/60 animate-pulse-glow" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead List */}
      <div className="glass-panel p-4">
        <h2 className="font-heading text-sm font-semibold mb-3">Leads</h2>
        <div className="space-y-2">
          {leads.map(lead => (
            <div key={lead.id} className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusBadge status={lead.status} />
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.source} · {lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lead.value && <span className="text-sm font-heading text-foreground">R$ {lead.value.toLocaleString("pt-BR")}</span>}
                <Select value={lead.status} onValueChange={(v) => void updateLead(lead.id, { status: v as LeadStatus })}>
                  <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="contato">Contato</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => void deleteLead(lead.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Fonte</Label><Input placeholder="Instagram, Google, Indicação..." value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></div>
            <div><Label>Valor estimado</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={() => void handleAdd()} disabled={!form.name || !form.email}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
