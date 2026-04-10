import { getSupabaseClient } from "@/integrations/supabase/client";
import { defaultHubData } from "@/lib/hub-defaults";
import { Alert, Contract, Cost, HubData, Lead, Revenue, Service } from "@/types/hub";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  status: Lead["status"];
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  estimated_hours: number;
  includes: string[] | null;
  active: boolean;
};

type ContractRow = {
  id: string;
  client_name: string;
  service_name: string;
  status: Contract["status"];
  value: number;
  start_date: string;
  deadline: string;
  delivered_date: string | null;
  notes: string | null;
};

type CostRow = {
  id: string;
  description: string;
  type: Cost["type"];
  amount: number;
  category: string;
  date: string;
  recurring: boolean;
};

type RevenueRow = {
  id: string;
  description: string;
  amount: number;
  contract_id: string | null;
  date: string;
};

type AlertRow = {
  id: string;
  title: string;
  description: string;
  module: Alert["module"];
  urgency: Alert["urgency"];
  resolved: boolean;
  created_at: string;
  due_date: string | null;
};

const toLead = (row: LeadRow): Lead => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? undefined,
  source: row.source,
  status: row.status,
  value: row.value ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toService = (row: ServiceRow): Service => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  basePrice: row.base_price,
  estimatedHours: row.estimated_hours,
  includes: row.includes ?? [],
  active: row.active,
});

const toContract = (row: ContractRow): Contract => ({
  id: row.id,
  clientName: row.client_name,
  serviceName: row.service_name,
  status: row.status,
  value: row.value,
  startDate: row.start_date,
  deadline: row.deadline,
  deliveredDate: row.delivered_date ?? undefined,
  notes: row.notes ?? undefined,
});

const toCost = (row: CostRow): Cost => ({
  id: row.id,
  description: row.description,
  type: row.type,
  amount: row.amount,
  category: row.category,
  date: row.date,
  recurring: row.recurring,
});

const toRevenue = (row: RevenueRow): Revenue => ({
  id: row.id,
  description: row.description,
  amount: row.amount,
  contractId: row.contract_id ?? undefined,
  date: row.date,
});

const toAlert = (row: AlertRow): Alert => ({
  id: row.id,
  title: row.title,
  description: row.description,
  module: row.module,
  urgency: row.urgency,
  resolved: row.resolved,
  createdAt: row.created_at,
  dueDate: row.due_date ?? undefined,
});

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchHubData(): Promise<HubData> {
  const supabase = getSupabaseClient();

  const [
    leadsResult,
    servicesResult,
    contractsResult,
    costsResult,
    revenuesResult,
    alertsResult,
  ] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("services").select("*").order("name"),
    supabase.from("contracts").select("*").order("deadline"),
    supabase.from("costs").select("*").order("date", { ascending: false }),
    supabase.from("revenues").select("*").order("date", { ascending: false }),
    supabase.from("alerts").select("*").order("created_at", { ascending: false }),
  ]);

  assertNoError(leadsResult.error);
  assertNoError(servicesResult.error);
  assertNoError(contractsResult.error);
  assertNoError(costsResult.error);
  assertNoError(revenuesResult.error);
  assertNoError(alertsResult.error);

  return {
    leads: (leadsResult.data ?? []).map(toLead),
    services: (servicesResult.data ?? []).map(toService),
    contracts: (contractsResult.data ?? []).map(toContract),
    costs: (costsResult.data ?? []).map(toCost),
    revenues: (revenuesResult.data ?? []).map(toRevenue),
    alerts: (alertsResult.data ?? []).map(toAlert),
  };
}

export async function createLead(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString().slice(0, 10);
  const payload = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    source: lead.source,
    status: lead.status,
    value: lead.value ?? null,
    notes: lead.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("leads").insert(payload).select().single();
  assertNoError(error);
  return toLead(data as LeadRow);
}

export async function updateLeadRecord(id: string, updates: Partial<Lead>) {
  const supabase = getSupabaseClient();
  const payload = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.email !== undefined ? { email: updates.email } : {}),
    ...(updates.phone !== undefined ? { phone: updates.phone ?? null } : {}),
    ...(updates.source !== undefined ? { source: updates.source } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.value !== undefined ? { value: updates.value ?? null } : {}),
    ...(updates.notes !== undefined ? { notes: updates.notes ?? null } : {}),
    updated_at: new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase.from("leads").update(payload).eq("id", id).select().single();
  assertNoError(error);
  return toLead(data as LeadRow);
}

export async function deleteLeadRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  assertNoError(error);
}

export async function createService(service: Omit<Service, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("services").insert({
    name: service.name,
    description: service.description,
    category: service.category,
    base_price: service.basePrice,
    estimated_hours: service.estimatedHours,
    includes: service.includes,
    active: service.active,
  }).select().single();
  assertNoError(error);
  return toService(data as ServiceRow);
}

export async function updateServiceRecord(id: string, updates: Partial<Service>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("services").update({
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.description !== undefined ? { description: updates.description } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.basePrice !== undefined ? { base_price: updates.basePrice } : {}),
    ...(updates.estimatedHours !== undefined ? { estimated_hours: updates.estimatedHours } : {}),
    ...(updates.includes !== undefined ? { includes: updates.includes } : {}),
    ...(updates.active !== undefined ? { active: updates.active } : {}),
  }).eq("id", id).select().single();
  assertNoError(error);
  return toService(data as ServiceRow);
}

export async function deleteServiceRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  assertNoError(error);
}

export async function createContract(contract: Omit<Contract, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("contracts").insert({
    client_name: contract.clientName,
    service_name: contract.serviceName,
    status: contract.status,
    value: contract.value,
    start_date: contract.startDate,
    deadline: contract.deadline,
    delivered_date: contract.deliveredDate ?? null,
    notes: contract.notes ?? null,
  }).select().single();
  assertNoError(error);
  return toContract(data as ContractRow);
}

export async function updateContractRecord(id: string, updates: Partial<Contract>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("contracts").update({
    ...(updates.clientName !== undefined ? { client_name: updates.clientName } : {}),
    ...(updates.serviceName !== undefined ? { service_name: updates.serviceName } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.value !== undefined ? { value: updates.value } : {}),
    ...(updates.startDate !== undefined ? { start_date: updates.startDate } : {}),
    ...(updates.deadline !== undefined ? { deadline: updates.deadline } : {}),
    ...(updates.deliveredDate !== undefined ? { delivered_date: updates.deliveredDate ?? null } : {}),
    ...(updates.notes !== undefined ? { notes: updates.notes ?? null } : {}),
  }).eq("id", id).select().single();
  assertNoError(error);
  return toContract(data as ContractRow);
}

export async function deleteContractRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  assertNoError(error);
}

export async function createCost(cost: Omit<Cost, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("costs").insert({
    description: cost.description,
    type: cost.type,
    amount: cost.amount,
    category: cost.category,
    date: cost.date,
    recurring: cost.recurring,
  }).select().single();
  assertNoError(error);
  return toCost(data as CostRow);
}

export async function deleteCostRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("costs").delete().eq("id", id);
  assertNoError(error);
}

export async function createRevenue(revenue: Omit<Revenue, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("revenues").insert({
    description: revenue.description,
    amount: revenue.amount,
    contract_id: revenue.contractId ?? null,
    date: revenue.date,
  }).select().single();
  assertNoError(error);
  return toRevenue(data as RevenueRow);
}

export async function deleteRevenueRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("revenues").delete().eq("id", id);
  assertNoError(error);
}

export async function createAlert(alert: Omit<Alert, "id" | "createdAt">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("alerts").insert({
    title: alert.title,
    description: alert.description,
    module: alert.module,
    urgency: alert.urgency,
    resolved: alert.resolved,
    created_at: new Date().toISOString().slice(0, 10),
    due_date: alert.dueDate ?? null,
  }).select().single();
  assertNoError(error);
  return toAlert(data as AlertRow);
}

export async function resolveAlertRecord(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("alerts").update({ resolved: true }).eq("id", id).select().single();
  assertNoError(error);
  return toAlert(data as AlertRow);
}

export async function deleteAlertRecord(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("alerts").delete().eq("id", id);
  assertNoError(error);
}

export function getFallbackHubData(): HubData {
  return defaultHubData;
}
