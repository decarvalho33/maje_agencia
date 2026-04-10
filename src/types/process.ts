export interface MindMapNode {
  id: string;
  title: string;
  description: string;
  steps: string[];
  x: number;
  y: number;
  parentId?: string;
  color?: string;
}
