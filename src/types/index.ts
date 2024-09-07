export interface LinkData {
  from: string;
  to: string;
  sourceVariable: string;
  mark: number;
  order: number;
}

export interface NodeData {
  id: string;
  name: string;
  text: string;
  alias: string;
  type: string;
  x: number;
  y: number;
  inputs: Object[];
  outputs: Object[];
}

// 资源-模型
export interface ResourceModel {
  name: string;
  description: string;
  params: any;
  registerTime: Date;
  updateTime: Date;
  id: string;
  alias: string;
  label: string;
  labelId: string;
  sampleCode?: string;
  type: string;
  [key: string]: any;
}

// 资源-数据
export interface ResourceDataset {
  type: string;
  id: string;
  label: string;
  name: string;
  alias: string;
  imageAmount: string;
  description: string;
  source: string;
  sourceType: number;
  param: string;
  sensorName: string;
  sensorKey: string;
  sensorDescription: string;
  sampleCode?: string;
  platformName: string;
  productType: string;
  owner: string;
  registerTime: Date;
  updateTime: Date;
  subject: string;
  [key: string]: any;
}

export interface NodeResult {
  privateNodes: TreeNodeData[];
  collectNodes: TreeNodeData[];
  publicNodes: TreeNodeData[];
}

export enum ResourceType {
  DATASET = "dataset",
  MODEL = "model",
}

export interface ResourceCode {
  id: string;
  codeData: string;
}

export type IconType = React.ReactNode;

export interface BasicDataNode {
  checkable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  isLeaf?: boolean;
  selectable?: boolean;
  switcherIcon?: IconType;
  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string;
  style?: React.CSSProperties;
}

export type FieldDataNode<
  T,
  ChildFieldName extends string = "children"
> = BasicDataNode &
  T &
  Partial<Record<ChildFieldName, Array<FieldDataNode<T, ChildFieldName>>>>;

export type TreeNodeData = FieldDataNode<{
  key: string | number;
  title?: React.ReactNode | ((data: TreeNodeData) => React.ReactNode);
  data?: any;
}>;
