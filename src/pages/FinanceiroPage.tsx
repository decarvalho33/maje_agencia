import { useState } from "react";
import { useHub } from "@/contexts/HubContext";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { CostType } from "@/types/hub";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function FinanceiroPage() {
  const { data, addCost, deleteCost, addRevenue, deleteRevenue } = useHub();
  const [showAddCost, setShowAddCost] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [costForm, setCostForm] = useState({ description: "", type: "fixo" as CostType, amount: "", category: "", date: "", recurring: false });
  const [revForm, setRevForm] = useState({ description: "", amount: "", date: "" });

  const totalRevenue = data.revenues.reduce((s, r) => s + r.amount, 0);
  const totalCosts = data.costs.reduce((s, c) => s + c.amount, 0);
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  // Chart data
  const chartData = [
    { name: "Receitas", value: totalRevenue },
    { name: "Custos", value: totalCosts },
    { name: "Lucro", value: profit },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" /> Custos & Financeiro
          </h1>
          <p className="text-sm text-muted-foreground font-body">Receitas, despesas e margem</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddCost(true)}><Plus className="h-4 w-4 mr-1" /> Custo</Button>
          <Button size="sm" onClick={() => setShowAddRevenue(true)}><Plus className="h-4 w-4 mr-1" /> Receita</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`} trend="up" />
        <MetricCard title="Custos Totais" value={`R$ ${totalCosts.toLocaleString("pt-BR")}`} />
        <MetricCard title="Lucro" value={`R$ ${profit.toLocaleString("pt-BR")}`} trend={profit > 0 ? "up" : "down"} />
        <MetricCard title="Margem" value={`${margin}%`} trend={margin > 30 ? "up" : "down"} />
      </div>

      {/* Chart */}
      <div className="glass-panel p-4">
        <h2 className="font-heading text-sm font-semibold mb-4">Resumo Financeiro</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(232 30% 16%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(232 45% 8%)", border: "1px solid hsl(232 30% 16%)", borderRadius: 8, color: "hsl(220 20% 90%)" }} />
              <Bar dataKey="value" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lists side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenues */}
        <div className="glass-panel p-4">
          <h2 className="font-heading text-sm font-semibold mb-3">Receitas</h2>
          <div className="space-y-2">
            {data.revenues.map(rev => (
              <div key={rev.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                <div>
                  <p className="text-sm font-body text-foreground">{rev.description}</p>
                  <p className="text-xs text-muted-foreground">{rev.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading text-success">+ R$ {rev.amount.toLocaleString("pt-BR")}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={() => void deleteRevenue(rev.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Costs */}
        <div className="glass-panel p-4">
          <h2 className="font-heading text-sm font-semibold mb-3">Custos</h2>
          <div className="space-y-2">
            {data.costs.map(cost => (
              <div key={cost.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                <div>
                  <p className="text-sm font-body text-foreground">{cost.description}</p>
                  <p className="text-xs text-muted-foreground">{cost.category} · {cost.type === "fixo" ? "Fixo" : "Variável"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading text-danger">- R$ {cost.amount.toLocaleString("pt-BR")}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={() => void deleteCost(cost.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Cost Dialog */}
      <Dialog open={showAddCost} onOpenChange={setShowAddCost}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Custo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição</Label><Input value={costForm.description} onChange={e => setCostForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor (R$)</Label><Input type="number" value={costForm.amount} onChange={e => setCostForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Tipo</Label>
                <Select value={costForm.type} onValueChange={v => setCostForm(f => ({ ...f, type: v as CostType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixo">Fixo</SelectItem>
                    <SelectItem value="variavel">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Categoria</Label><Input value={costForm.category} onChange={e => setCostForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Data</Label><Input type="date" value={costForm.date} onChange={e => setCostForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={async () => { await addCost({ ...costForm, amount: Number(costForm.amount), recurring: costForm.recurring }); setShowAddCost(false); }} disabled={!costForm.description || !costForm.amount}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Revenue Dialog */}
      <Dialog open={showAddRevenue} onOpenChange={setShowAddRevenue}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Receita</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição</Label><Input value={revForm.description} onChange={e => setRevForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" value={revForm.amount} onChange={e => setRevForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div><Label>Data</Label><Input type="date" value={revForm.date} onChange={e => setRevForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={async () => { await addRevenue({ ...revForm, amount: Number(revForm.amount) }); setShowAddRevenue(false); }} disabled={!revForm.description || !revForm.amount}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
