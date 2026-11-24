/** Shared types for the Zolai knowledge-graph / mind-map feature. */

export interface GraphNode {
  id: string;
  group: number;
  val: number;
  color: string;
  desc: string;
  fx?: number;
  fy?: number;
  fz?: number;
  lat?: number; // degrees
  lon?: number; // degrees
}

export interface GraphLink {
  source: string;
  target: string;
  color: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
