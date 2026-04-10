import { useState } from "react";
import { useHub } from "@/contexts/HubContext";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Target, Edit2 } from "lucide-react";

export default function ServicosPage() {
  const { data, addService, deleteService } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "Web", basePrice: "", estimatedHours: "", includes: "" });

  const services = data.services.filter(s => s.active);
  const avgTicket = services.length > 0 ? Math.round(services.reduce((s, sv) => s + sv.basePrice, 0) / services.length) : 0;

  // Most sold service (by contracts)
  const serviceCounts = data.contracts.reduce((acc, c) => {
    acc[c.serviceName] = (acc[c.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostSold = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const handleAdd = async () => {
    await addService({
      ...form,
      basePrice: Number(form.basePrice),
      estimatedHours: Number(form.estimatedHours),
      includes: form.includes.split(",").map(s => s.trim()).filter(Boolean),
      active: true,
    });
    setForm({ name: "", description: "", category: "Web", basePrice: "", estimatedHours: "", includes: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" /> Serviços & Precificação
          </h1>
          <p className="text-sm text-muted-foreground font-body">Catálogo e valores</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Novo Serviço</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard title="Serviços Ativos" value={services.length} />
        <MetricCard title="Ticket Médio" value={`R$ ${avgTicket.toLocaleString("pt-BR")}`} />
        <MetricCard title="Mais Vendido" value={mostSold ? mostSold[0] : "—"} subtitle={mostSold ? `${mostSold[1]} contratos` : ""} />
      </div>

      {/* Service Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id} className="glass-panel p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{service.name}</h3>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => void deleteService(service.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-heading font-bold text-primary">R$ {service.basePrice.toLocaleString("pt-BR")}</span>
              <span className="text-muted-foreground">~{service.estimatedHours}h</span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{service.category}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {service.includes.map((item, i) => (
                <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Serviço</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preço Base (R$)</Label><Input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} /></div>
              <div><Label>Horas Estimadas</Label><Input type="number" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} /></div>
            </div>
            <div><Label>Inclui (separar por vírgula)</Label><Input value={form.includes} onChange={e => setForm(f => ({ ...f, includes: e.target.value }))} placeholder="Design, SEO, Blog..." /></div>
          </div>
          <DialogFooter><Button onClick={() => void handleAdd()} disabled={!form.name || !form.basePrice}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
