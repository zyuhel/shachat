export type TNodeLabel =
  | 'adm-node'
  | 'eth-node'
  | 'eth-indexer'
  | 'btc-node'
  | 'btc-indexer'
  | 'doge-node'
  | 'doge-indexer'
  | 'dash-node'
  | 'ipfs-node'
  | 'kly-node'
  | 'kly-indexer'
  | 'rates-info'

type KebabToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamelCase<U>>}`
  : S

type KebabToPascalCase<S extends string> = Capitalize<KebabToCamelCase<S>>

type CamelToKebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebabCase<U>}`
  : S

type PascalToKebabCase<S extends string> = CamelToKebabCase<Uncapitalize<S>>

type NodeLabels<V extends TNodeLabel = TNodeLabel> = {
  [K in KebabToPascalCase<V>]: Extract<V, PascalToKebabCase<K>>
}

export const NODE_LABELS: NodeLabels = {
  AdmNode: 'adm-node',
  EthNode: 'eth-node',
  EthIndexer: 'eth-indexer',
  BtcNode: 'btc-node',
  BtcIndexer: 'btc-indexer',
  DogeNode: 'doge-node',
  DogeIndexer: 'doge-indexer',
  DashNode: 'dash-node',
  IpfsNode: 'ipfs-node',
  KlyNode: 'kly-node',
  KlyIndexer: 'kly-indexer',
  RatesInfo: 'rates-info'
}
