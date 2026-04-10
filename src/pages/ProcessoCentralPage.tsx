import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { createProcessNode, deleteProcessNode as deleteProcessNodeRecord, fetchProcessNodes, updateProcessNode } from "@/store/processStore";
import { MindMapNode } from "@/types/process";
import { Plus, Trash2, GripVertical, ChevronRight, Edit2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const defaultNodes: MindMapNode[] = [
  { id: "root", title: "MAJE", description: "Processo central da agência", steps: ["Definir serviços", "Montar portfólio", "Criar presença digital"], x: 500, y: 300, color: "primary" },
  { id: "captacao", title: "Captação de Clientes", description: "Como atrair e converter leads", steps: ["Definir canais (Instagram, Google, Indicação)", "Criar conteúdo de atração", "Configurar funil de vendas", "Follow-up com leads"], x: 200, y: 120, parentId: "root", color: "primary" },
  { id: "proposta", title: "Proposta & Briefing", description: "Do primeiro contato ao fechamento", steps: ["Reunião de briefing", "Análise de necessidades", "Elaborar proposta comercial", "Negociação e ajustes", "Assinatura do contrato"], x: 800, y: 120, parentId: "root", color: "primary" },
  { id: "producao", title: "Produção", description: "Execução do projeto", steps: ["Wireframe e prototipagem", "Aprovação do layout", "Desenvolvimento front-end", "Integração de conteúdo", "Testes e QA"], x: 200, y: 480, parentId: "root", color: "primary" },
  { id: "entrega", title: "Entrega & Pós-venda", description: "Finalização e relacionamento", steps: ["Apresentação final ao cliente", "Ajustes pós-aprovação", "Deploy e go-live", "Treinamento do cliente", "Suporte pós-entrega"], x: 800, y: 480, parentId: "root", color: "primary" },
];

export default function ProcessoCentralPage() {
  const [nodes, setNodes] = useState<MindMapNode[]>(defaultNodes);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [addForm, setAddForm] = useState({ title: "", description: "", steps: "", parentId: "" });
  const [editForm, setEditForm] = useState({ title: "", description: "", steps: "" });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const remoteNodes = await fetchProcessNodes();
        if (isMounted) {
          setNodes(remoteNodes.length > 0 ? remoteNodes : []);
        }
      } catch (err) {
        const description = err instanceof Error ? err.message : "Falha ao buscar os processos.";
        toast.error("Não foi possível carregar o Processo Central.", { description });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging(nodeId);
    setDragOffset({
      x: e.clientX / zoom - node.x - pan.x / zoom,
      y: e.clientY / zoom - node.y - pan.y / zoom,
    });
  }, [nodes, zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const newX = e.clientX / zoom - dragOffset.x - pan.x / zoom;
      const newY = e.clientY / zoom - dragOffset.y - pan.y / zoom;
      setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [dragging, dragOffset, zoom, pan, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    const draggedNode = dragging ? nodes.find((node) => node.id === dragging) : null;
    setDragging(null);
    setIsPanning(false);

    if (draggedNode && isSupabaseConfigured) {
      void updateProcessNode(draggedNode.id, { x: draggedNode.x, y: draggedNode.y }).catch((err) => {
        const description = err instanceof Error ? err.message : "Falha ao salvar a posição do nó.";
        toast.error("Não foi possível atualizar a posição do processo.", { description });
      });
    }
  }, [dragging, nodes]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(2, prev - e.deltaY * 0.001)));
  }, []);

  const addNode = async () => {
    const newNodePayload: Omit<MindMapNode, "id"> = {
      title: addForm.title,
      description: addForm.description,
      steps: addForm.steps.split("\n").filter(Boolean),
      x: 400 + Math.random() * 200,
      y: 250 + Math.random() * 100,
      parentId: addForm.parentId || undefined,
      color: "primary",
    };

    try {
      const newNode = isSupabaseConfigured ? await createProcessNode(newNodePayload) : { ...newNodePayload, id: crypto.randomUUID() };
      setNodes(prev => [...prev, newNode]);
      setAddForm({ title: "", description: "", steps: "", parentId: "" });
      setShowAdd(false);
    } catch (err) {
      const description = err instanceof Error ? err.message : "Falha ao criar o processo.";
      toast.error("Não foi possível criar o processo.", { description });
    }
  };

  const updateNode = async () => {
    if (!selectedNode) return;

    const updates = {
      title: editForm.title,
      description: editForm.description,
      steps: editForm.steps.split("\n").filter(Boolean),
    };

    try {
      const nextNode = isSupabaseConfigured
        ? await updateProcessNode(selectedNode.id, updates)
        : { ...selectedNode, ...updates };

      setNodes(prev => prev.map(n => n.id === selectedNode.id ? nextNode : n));
      setShowEdit(false);
    } catch (err) {
      const description = err instanceof Error ? err.message : "Falha ao salvar o processo.";
      toast.error("Não foi possível atualizar o processo.", { description });
    }
  };

  const deleteNode = async (id: string) => {
    try {
      if (isSupabaseConfigured) {
        await deleteProcessNodeRecord(id);
      }

      setNodes(prev => prev.filter(n => n.id !== id && n.parentId !== id));
      setSelectedNode(null);
    } catch (err) {
      const description = err instanceof Error ? err.message : "Falha ao remover o processo.";
      toast.error("Não foi possível remover o processo.", { description });
    }
  };

  const openEdit = (node: MindMapNode) => {
    setSelectedNode(node);
    setEditForm({ title: node.title, description: node.description, steps: node.steps.join("\n") });
    setShowEdit(true);
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 shrink-0">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Processo Central</h1>
          <p className="text-sm text-muted-foreground font-body">
            {isLoading ? "Carregando processos..." : "Manual operacional da agência MAJE"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(2, z + 0.15))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={resetView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo Nó
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        data-canvas="true"
        className="flex-1 relative overflow-hidden rounded-lg border border-border/30 cursor-grab active:cursor-grabbing"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(232 45% 6%), hsl(230 50% 4%))" }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid dots */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, hsl(239 84% 67%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} data-canvas="true" />

        {/* Transform layer */}
        <div
          data-canvas="true"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            position: "absolute",
            inset: 0,
          }}
        >
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {nodes.filter(n => n.parentId).map(node => {
              const parent = nodes.find(p => p.id === node.parentId);
              if (!parent) return null;
              const x1 = parent.x + 100;
              const y1 = parent.y + 40;
              const x2 = node.x + 100;
              const y2 = node.y + 40;
              const mx = (x1 + x2) / 2;
              return (
                <g key={node.id}>
                  <path
                    d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    className="stroke-primary/30"
                    strokeWidth={2}
                  />
                  {/* Animated pulse dot */}
                  <circle r="3" className="fill-primary/60">
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute select-none group ${dragging === node.id ? "z-50" : "z-10"}`}
              style={{ left: node.x, top: node.y, width: 200 }}
            >
              <div
                className={`rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm p-4 shadow-lg hover:neural-glow transition-all duration-200 ${
                  node.id === "root" ? "border-primary/50 neural-glow" : ""
                }`}
              >
                {/* Drag handle */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>

                {/* Title */}
                <h3 className="font-heading font-semibold text-sm text-foreground mb-1 pr-6">{node.title}</h3>
                <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">{node.description}</p>

                {/* Steps */}
                {node.steps.length > 0 && (
                  <div className="space-y-1 border-t border-border/30 pt-2">
                    {node.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-muted-foreground leading-tight">{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(node)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  {node.id !== "root" && (
                    <button onClick={() => deleteNode(node.id)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-danger">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Node Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Processo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Onboarding do Cliente" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição do processo" />
            </div>
            <div>
              <Label>Conectar a</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={addForm.parentId}
                onChange={e => setAddForm(f => ({ ...f, parentId: e.target.value }))}
              >
                <option value="">Nenhum (nó raiz)</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
              </select>
            </div>
            <div>
              <Label>Passos (um por linha)</Label>
              <Textarea
                value={addForm.steps}
                onChange={e => setAddForm(f => ({ ...f, steps: e.target.value }))}
                placeholder={"Passo 1\nPasso 2\nPasso 3"}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addNode} disabled={!addForm.title}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Processo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Passos (um por linha)</Label>
              <Textarea value={editForm.steps} onChange={e => setEditForm(f => ({ ...f, steps: e.target.value }))} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateNode}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
