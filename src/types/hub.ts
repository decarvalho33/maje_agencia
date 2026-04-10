export type LeadStatus = "prospect" | "contato" | "proposta" | "fechado" | "perdido";
export type ProjectStatus = "em_andamento" | "revisao" | "entregue" | "cancelado";
export type CostType = "fixo" | "variavel";
export type AlertUrgency = "alta" | "media" | "baixa";
export type AlertModule = "captacao" | "servicos" | "contratos" | "custos";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  value?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedHours: number;
  includes: string[];
  active: boolean;
}

export interface Contract {
  id: string;
  clientName: string;
  serviceName: string;
  status: ProjectStatus;
  value: number;
  startDate: string;
  deadline: string;
  deliveredDate?: string;
  notes?: string;
}

export interface Cost {
  id: string;
  description: string;
  type: CostType;
  amount: number;
  category: string;
  date: string;
  recurring: boolean;
}

export interface Revenue {
  id: string;
  description: string;
  amount: number;
  contractId?: string;
  date: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  module: AlertModule;
  urgency: AlertUrgency;
  resolved: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface HubData {
  leads: Lead[];
  services: Service[];
  contracts: Contract[];
  costs: Cost[];
  revenues: Revenue[];
  alerts: Alert[];
}
