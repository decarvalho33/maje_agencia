import { HubData } from "@/types/hub";

export const defaultHubData: HubData = {
  leads: [
    { id: "1", name: "João Silva", email: "joao@email.com", source: "Instagram", status: "proposta", value: 3500, createdAt: "2026-03-15", updatedAt: "2026-04-01", notes: "Interessado em landing page" },
    { id: "2", name: "Maria Santos", email: "maria@empresa.com", source: "Indicação", status: "contato", value: 8000, createdAt: "2026-04-02", updatedAt: "2026-04-05" },
    { id: "3", name: "Tech Corp", email: "contato@tech.com", source: "Google", status: "fechado", value: 12000, createdAt: "2026-02-20", updatedAt: "2026-03-10" },
    { id: "4", name: "Ana Costa", email: "ana@startup.io", source: "LinkedIn", status: "prospect", createdAt: "2026-04-08", updatedAt: "2026-04-08" },
  ],
  services: [
    { id: "1", name: "Landing Page", description: "Página única de conversão", category: "Web", basePrice: 2500, estimatedHours: 20, includes: ["Design responsivo", "SEO básico", "Formulário de contato"], active: true },
    { id: "2", name: "Site Institucional", description: "Site completo com múltiplas páginas", category: "Web", basePrice: 5000, estimatedHours: 40, includes: ["Até 5 páginas", "Blog", "Painel admin", "SEO"], active: true },
    { id: "3", name: "E-commerce", description: "Loja virtual completa", category: "Web", basePrice: 12000, estimatedHours: 80, includes: ["Catálogo", "Carrinho", "Pagamento", "Painel admin"], active: true },
    { id: "4", name: "Redesign", description: "Reformulação visual de site existente", category: "Design", basePrice: 3500, estimatedHours: 30, includes: ["Análise UX", "Novo layout", "Migração"], active: true },
  ],
  contracts: [
    { id: "1", clientName: "Tech Corp", serviceName: "Site Institucional", status: "em_andamento", value: 12000, startDate: "2026-03-15", deadline: "2026-04-30" },
    { id: "2", clientName: "Café Aurora", serviceName: "Landing Page", status: "revisao", value: 2500, startDate: "2026-03-01", deadline: "2026-04-10" },
    { id: "3", clientName: "Loja Bella", serviceName: "E-commerce", status: "em_andamento", value: 15000, startDate: "2026-04-01", deadline: "2026-06-15" },
  ],
  costs: [
    { id: "1", description: "Hosting e Domínios", type: "fixo", amount: 150, category: "Infraestrutura", date: "2026-04-01", recurring: true },
    { id: "2", description: "Ferramentas de Design (Figma)", type: "fixo", amount: 75, category: "Ferramentas", date: "2026-04-01", recurring: true },
    { id: "3", description: "Freela - Dev Frontend", type: "variavel", amount: 2000, category: "Equipe", date: "2026-03-20", recurring: false },
  ],
  revenues: [
    { id: "1", description: "Tech Corp - Entrada 50%", amount: 6000, contractId: "1", date: "2026-03-15" },
    { id: "2", description: "Café Aurora - Pagamento total", amount: 2500, contractId: "2", date: "2026-03-01" },
    { id: "3", description: "Loja Bella - Entrada 30%", amount: 4500, contractId: "3", date: "2026-04-01" },
  ],
  alerts: [
    { id: "1", title: "Prazo próximo: Café Aurora", description: "Deadline em 2 dias - projeto em revisão", module: "contratos", urgency: "alta", resolved: false, createdAt: "2026-04-08", dueDate: "2026-04-10" },
    { id: "2", title: "Lead sem resposta: Maria Santos", description: "Sem contato há 5 dias", module: "captacao", urgency: "media", resolved: false, createdAt: "2026-04-05" },
    { id: "3", title: "Pagamento pendente: Tech Corp", description: "50% restante após entrega", module: "custos", urgency: "baixa", resolved: false, createdAt: "2026-04-01" },
  ],
};
