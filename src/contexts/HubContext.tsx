import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Alert, Contract, Cost, HubData, Lead, Revenue, Service } from "@/types/hub";
import {
  createAlert,
  createContract,
  createCost,
  createLead,
  createRevenue,
  createService,
  deleteAlertRecord,
  deleteContractRecord,
  deleteCostRecord,
  deleteLeadRecord,
  deleteRevenueRecord,
  deleteServiceRecord,
  fetchHubData,
  getFallbackHubData,
  resolveAlertRecord,
  updateContractRecord,
  updateLeadRecord,
  updateServiceRecord,
} from "@/store/hubStore";

interface HubContextType {
  data: HubData;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  reloadData: () => Promise<void>;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addContract: (contract: Omit<Contract, "id">) => Promise<void>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  addCost: (cost: Omit<Cost, "id">) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  addRevenue: (revenue: Omit<Revenue, "id">) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  addAlert: (alert: Omit<Alert, "id" | "createdAt">) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

const HubContext = createContext<HubContextType | null>(null);

export function useHub() {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error("useHub must be used within HubProvider");
  return ctx;
}

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HubData>(getFallbackHubData());
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured ? null : "Supabase não configurado. O app está exibindo os dados estáticos do repositório."
  );

  const handleError = useCallback((message: string, err: unknown) => {
    const description = err instanceof Error ? err.message : message;
    setError(description);
    toast.error(message, { description });
  }, []);

  const reloadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setIsLoading(true);

    try {
      const nextData = await fetchHubData();
      setData(nextData);
      setError(null);
    } catch (err) {
      handleError("Não foi possível carregar os dados do Supabase.", err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    void reloadData();
  }, [reloadData]);

  const addLead = useCallback(async (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    try {
      const record = await createLead(lead);
      setData((prev) => ({ ...prev, leads: [record, ...prev.leads] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar o lead.", err);
    }
  }, [handleError]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const record = await updateLeadRecord(id, updates);
      setData((prev) => ({ ...prev, leads: prev.leads.map((lead) => (lead.id === id ? record : lead)) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível atualizar o lead.", err);
    }
  }, [handleError]);

  const deleteLead = useCallback(async (id: string) => {
    try {
      await deleteLeadRecord(id);
      setData((prev) => ({ ...prev, leads: prev.leads.filter((lead) => lead.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover o lead.", err);
    }
  }, [handleError]);

  const addService = useCallback(async (service: Omit<Service, "id">) => {
    try {
      const record = await createService(service);
      setData((prev) => ({ ...prev, services: [...prev.services, record] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar o serviço.", err);
    }
  }, [handleError]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      const record = await updateServiceRecord(id, updates);
      setData((prev) => ({ ...prev, services: prev.services.map((service) => (service.id === id ? record : service)) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível atualizar o serviço.", err);
    }
  }, [handleError]);

  const deleteService = useCallback(async (id: string) => {
    try {
      await deleteServiceRecord(id);
      setData((prev) => ({ ...prev, services: prev.services.filter((service) => service.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover o serviço.", err);
    }
  }, [handleError]);

  const addContract = useCallback(async (contract: Omit<Contract, "id">) => {
    try {
      const record = await createContract(contract);
      setData((prev) => ({ ...prev, contracts: [...prev.contracts, record] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar o contrato.", err);
    }
  }, [handleError]);

  const updateContract = useCallback(async (id: string, updates: Partial<Contract>) => {
    try {
      const record = await updateContractRecord(id, updates);
      setData((prev) => ({ ...prev, contracts: prev.contracts.map((contract) => (contract.id === id ? record : contract)) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível atualizar o contrato.", err);
    }
  }, [handleError]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await deleteContractRecord(id);
      setData((prev) => ({ ...prev, contracts: prev.contracts.filter((contract) => contract.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover o contrato.", err);
    }
  }, [handleError]);

  const addCost = useCallback(async (cost: Omit<Cost, "id">) => {
    try {
      const record = await createCost(cost);
      setData((prev) => ({ ...prev, costs: [record, ...prev.costs] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar o custo.", err);
    }
  }, [handleError]);

  const deleteCost = useCallback(async (id: string) => {
    try {
      await deleteCostRecord(id);
      setData((prev) => ({ ...prev, costs: prev.costs.filter((cost) => cost.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover o custo.", err);
    }
  }, [handleError]);

  const addRevenue = useCallback(async (revenue: Omit<Revenue, "id">) => {
    try {
      const record = await createRevenue(revenue);
      setData((prev) => ({ ...prev, revenues: [record, ...prev.revenues] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar a receita.", err);
    }
  }, [handleError]);

  const deleteRevenue = useCallback(async (id: string) => {
    try {
      await deleteRevenueRecord(id);
      setData((prev) => ({ ...prev, revenues: prev.revenues.filter((revenue) => revenue.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover a receita.", err);
    }
  }, [handleError]);

  const addAlert = useCallback(async (alert: Omit<Alert, "id" | "createdAt">) => {
    try {
      const record = await createAlert(alert);
      setData((prev) => ({ ...prev, alerts: [record, ...prev.alerts] }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível criar o alerta.", err);
    }
  }, [handleError]);

  const resolveAlert = useCallback(async (id: string) => {
    try {
      const record = await resolveAlertRecord(id);
      setData((prev) => ({ ...prev, alerts: prev.alerts.map((alert) => (alert.id === id ? record : alert)) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível resolver o alerta.", err);
    }
  }, [handleError]);

  const deleteAlert = useCallback(async (id: string) => {
    try {
      await deleteAlertRecord(id);
      setData((prev) => ({ ...prev, alerts: prev.alerts.filter((alert) => alert.id !== id) }));
      setError(null);
    } catch (err) {
      handleError("Não foi possível remover o alerta.", err);
    }
  }, [handleError]);

  const value = {
    data,
    isLoading,
    error,
    isConfigured: isSupabaseConfigured,
    reloadData,
    addLead,
    updateLead,
    deleteLead,
    addService,
    updateService,
    deleteService,
    addContract,
    updateContract,
    deleteContract,
    addCost,
    deleteCost,
    addRevenue,
    deleteRevenue,
    addAlert,
    resolveAlert,
    deleteAlert,
  };

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}
