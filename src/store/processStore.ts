import { getSupabaseClient } from "@/integrations/supabase/client";
import type { MindMapNode } from "@/types/process";

type ProcessNodeRow = {
  id: string;
  title: string;
  description: string;
  steps: string[] | null;
  x: number;
  y: number;
  parent_id: string | null;
  color: string | null;
  sort_order: number;
};

const toMindMapNode = (row: ProcessNodeRow): MindMapNode => ({
  id: row.id,
  title: row.title,
  description: row.description,
  steps: row.steps ?? [],
  x: row.x,
  y: row.y,
  parentId: row.parent_id ?? undefined,
  color: row.color ?? undefined,
});

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchProcessNodes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("process_nodes")
    .select("*")
    .order("sort_order")
    .order("title");

  assertNoError(error);
  return (data ?? []).map(toMindMapNode);
}

export async function createProcessNode(node: Omit<MindMapNode, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("process_nodes").insert({
    title: node.title,
    description: node.description,
    steps: node.steps,
    x: node.x,
    y: node.y,
    parent_id: node.parentId ?? null,
    color: node.color ?? null,
    sort_order: 0,
  }).select().single();

  assertNoError(error);
  return toMindMapNode(data as ProcessNodeRow);
}

export async function updateProcessNode(id: string, updates: Partial<MindMapNode>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("process_nodes").update({
    ...(updates.title !== undefined ? { title: updates.title } : {}),
    ...(updates.description !== undefined ? { description: updates.description } : {}),
    ...(updates.steps !== undefined ? { steps: updates.steps } : {}),
    ...(updates.x !== undefined ? { x: updates.x } : {}),
    ...(updates.y !== undefined ? { y: updates.y } : {}),
    ...(updates.parentId !== undefined ? { parent_id: updates.parentId ?? null } : {}),
    ...(updates.color !== undefined ? { color: updates.color ?? null } : {}),
  }).eq("id", id).select().single();

  assertNoError(error);
  return toMindMapNode(data as ProcessNodeRow);
}

export async function deleteProcessNode(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("process_nodes").delete().eq("id", id);
  assertNoError(error);
}
