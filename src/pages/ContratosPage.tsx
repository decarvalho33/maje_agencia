import { useState } from "react";
import { useHub } from "@/contexts/HubContext";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileText } from "lucide-react";
import { ProjectStatus } from "@/types/hub";

export default function ContratosPage() {
  const { data, addContract, updateContract, deleteContract } = useHub();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clientName: "", serviceName: "", value: "", startDate: "", deadline: "" });

  const contracts = data.contracts;
  const active = contracts.filter(c => c.status === "em_andamento" || c.status === "revisao");
  const onTime = contracts.filter(c => {
    if (c.status !== "entregue") return false;
    return !c.deliveredDate || c.deliveredDate <= c.deadline;
  }).length;
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);

  const handleAdd = async () => {
    await addContract({ ...form, value: Number(form.value), status: "em_andamento" as ProjectStatus });
    setForm({ clientName: "", serviceName: "", value: "", startDate: "", deadline: "" });
    setShowAdd(false);
  };

  const daysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Contratos & Projetos
          </h1>
          <p className="text-sm text-muted-foreground font-body">Gestão de projetos ativos</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Novo Projeto</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Projetos Ativos" value={active.length} />
        <MetricCard title="Total Contratos" value={contracts.length} />
        <MetricCard title="Valor Total" value={`R$ ${totalValue.toLocaleString("pt-BR")}`} />
        <MetricCard title="Entregues no Prazo" value={`${onTime}`} trend="up" />
      </div>

      {/* Timeline */}
      <div className="glass-panel p-4 space-y-3">
        <h2 className="font-heading text-sm font-semibold">Projetos</h2>
        {contracts.map(contract => {
          const days = daysLeft(contract.deadline);
          return (
            <div key={contract.id} className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusBadge status={contract.status} />
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{contract.clientName}</p>
                  <p className="text-xs text-muted-foreground">{contract.serviceName} · R$ {contract.value.toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${days < 0 ? "text-danger" : days < 7 ? "text-warning" : "text-muted-foreground"}`}>
                  {days < 0 ? `${Math.abs(days)}d atrasado` : `${days}d restantes`}
                </span>
                <Select value={contract.status} onValueChange={(v) => void updateContract(contract.id, { status: v as ProjectStatus })}>
                  <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="revisao">Revisão</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => void deleteContract(contract.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Cliente</Label><Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} /></div>
            <div><Label>Serviço</Label><Input value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => void handleAdd()} disabled={!form.clientName || !form.serviceName}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
