interface ComponentStatusType {
  name: string;
  status: 'danger' | 'warning' | 'info' | 'custom' | 'success';
}

interface CacheManager {
  name: string;
  physical_addresses: string[];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: ComponentStatusType;
  cluster_size: number;
  defined_caches: DefinedCache[];
  cache_configuration_names: string[];
  cluster_members: ClusterMember[];
  health: ComponentStatusType;
  local_site?: string;
  rebalancing_enabled?: boolean;
  backups_enabled: boolean;
  sites_view: string[];
  tracing_enabled: boolean;
}

interface ClusterMember {
  name: string;
  physical_address: string;
}

interface CacheManagerStats {
  statistics_enabled: boolean;
  time_since_start?: number;
  time_since_reset?: number;
  number_of_entries?: number;
  current_number_of_entries_in_memory?: number;
  total_number_of_entries?: number;
  off_heap_memory_used?: number;
  data_memory_used?: number;
  required_minimum_number_of_nodes?: number;
  average_read_time?: number;
  average_read_time_nanos?: number;
  average_write_time?: number;
  average_write_time_nanos?: number;
  average_remove_time?: number;
  average_remove_time_nanos?: number;
  hit_ratio?: number;
  read_write_ratio?: number;
  hits: number;
  stores: number;
  evictions: number;
  retrievals: number;
  misses: number;
  remove_hits: number;
  remove_misses: number;
}

interface DefinedCache {
  name: string;
  started: boolean;
}

interface CacheConfig {
  name: string;
  config: string;
}

interface FormattedCacheConfig {
  json: string;
  xml: string;
  yaml: string;
}

interface Features {
  transactional: boolean;
  persistent: boolean;
  bounded: boolean;
  secured: boolean;
  indexed: boolean;
  hasRemoteBackup: boolean;
}

interface CacheInfo {
  status: string;
  name: string;
  type: string;
  simpleCache: boolean;
  health: ComponentStatusType;
  features: Features;
  rebalancing_enabled?: boolean;
  tracing: boolean;
  aliases: string[];
}

interface CacheEntry {
  key: string;
  keyDisplay: string;
  keyContentType?: string;
  value: string;
  valueContentType?: string;
  timeToLive?: string;
  maxIdle?: string;
  created?: string;
  lastUsed?: string;
  lastModified?: string;
  expires?: string;
  cacheControl?: string;
  eTag?: string;
}

interface CacheKey {
  key: string;
  keyContentType: string;
}

interface CacheEncoding {
  key: string;
  value: string;
}

interface DetailedInfinispanCache {
  name: string;
  configuration?: CacheConfig;
  encoding?: CacheEncoding;
  type?: string;
  started: boolean;
  health?: ComponentStatusType;
  size?: number;
  rehash_in_progress?: boolean;
  indexing_in_progress?: boolean;
  rebalancing_enabled?: boolean;
  editable?: boolean;
  updateEntry?: boolean;
  deleteEntry?: boolean;
  queryable?: boolean;
  features?: Features;
  backupSites?: [XSite];
  stats?: CacheStats;
  mode?: string;
  memory?: CacheMemory;
  async?: boolean;
  tracing?: boolean;
  aliases?: string[];
}

interface CacheMemory {
  storage_type: string;
  max_size: string;
  max_size_bytes: number;
}

interface CacheStats {
  enabled: boolean;
  time_since_start: number;
  time_since_reset: number;
  approximate_entries: number;
  approximate_entries_in_memory: number;
  approximate_entries_unique: number;
  current_number_of_entries: number; // usually -1
  current_number_of_entries_in_memory: number; // usually -1
  total_number_of_entries: number; // deprecated
  off_heap_memory_used: number; // Memory
  data_memory_used: number; // Memory
  stores: number; // Stats for pie chart
  retrievals: number;
  hits: number;
  misses: number;
  remove_hits: number;
  remove_misses: number;
  evictions: number;
  average_read_time: number;
  average_read_time_nanos: number;
  average_write_time: number;
  average_write_time_nanos: number;
  average_remove_time: number;
  average_remove_time_nanos: number;
  required_minimum_number_of_nodes: number;
}

interface StateTransferStatus {
  site: string;
  status: ComponentStatusType;
}

interface SiteNode {
  name: string;
  status: string;
}

interface XSite {
  name: string;
  status: string;
  relay_node: boolean;
}

interface CacheAcl {
  name: string;
  acl: string[];
}

interface Acl {
  user: string;
  global: string[];
  caches: Map<string, CacheAcl>;
}

interface ConnectedUser {
  name: string;
  acl?: Acl;
}

interface Task {
  parameters: [string];
  task_context_name: string;
  task_operation_name: string;
  name: string;
  type: string;
  execution_mode: string;
  allowed_role: string;
}

interface Counter {
  name: string;
  value: string;
  config: CounterConfig;
}

interface CounterConfig {
  name: string;
  type: string;
  initialValue: number;
  storage: string;
  lowerBound?: number;
  upperBound?: number;
  concurrencyLevel?: number;
}

interface ActionResponse {
  message: string;
  success: boolean;
  data?: string;
}

interface SearchResult {
  total: number;
  values: string[];
  error: boolean;
  cause: string;
  executed: boolean;
}

interface ProtoError {
  message: string;
  cause: string;
}

interface ProtoSchema {
  name: string;
  error?: ProtoError;
}

interface AuthInfo {
  mode: string;
  ready: boolean;
  digest: boolean;
  keycloakConfig?: Keycloak.KeycloakConfig;
}

interface IndexStat {
  name: string;
  count: string;
  size: string;
}
interface QueryStat {
  name: string;
  count: string;
  average: string;
  max: string;
  slowest?: string;
}

interface SearchStats {
  index: IndexStat[];
  query: QueryStat[];
  reindexing: boolean;
}

interface ServiceCall {
  url: string;
  successMessage: string;
  errorMessage: string;
  customHeaders?: Headers;
  body?: string;
}

interface TemplateOptionSelect {
  value: string;
  disabled?: boolean;
  isPlaceholder?: boolean;
}

interface GettingStartedState {
  cacheName: '';
  createType: 'configure' | 'edit';
  valid: boolean;
}

interface CacheEditorStep {
  editorConfig: string;
  configs: TemplateOptionSelect[];
  validConfig: 'success' | 'error' | 'default';
  errorConfig: string;
  selectedConfig: string;
  configExpanded: boolean;
  editorExpanded: boolean;
}

interface BasicCacheConfig {
  topology: string;
  mode: string;
  numberOfOwners?: number;
  encoding: string;
  statistics: boolean;
  expiration: boolean;
  lifeSpanNumber: number;
  lifeSpanUnit: string;
  maxIdleNumber: number;
  maxIdleUnit: string;
  valid: boolean;
}

interface BoundedCache {
  evictionType: 'size' | 'count';
  maxSize: number;
  maxSizeUnit: string;
  maxCount: number;
  evictionStrategy: string;
  valid: boolean;
}

interface IndexReader {
  refreshInterval?: number;
  refreshIntervalUnit?: string;
}

interface IndexWriter {
  commitInterval?: number;
  commitIntervalUnit?: string;
  lowLevelTrace?: boolean;
  maxBufferedEntries?: number;
  queueCount?: number;
  queueSize?: number;
  ramBufferSize?: number;
  threadPoolSize?: number;
}
interface IndexMerge {
  calibrateByDeletes?: boolean;
  factor?: number;
  maxEntries?: number;
  minSize?: number;
  maxSize?: number;
  maxForcedSize?: number;
}
interface IndexedCache {
  indexingMode?: 'AUTO' | 'MANUAL';
  indexedSharding?: number;
  indexedStorage: 'filesystem' | 'local-heap';
  indexedStartupMode?: string;
  indexedEntities: string[];
  valid: boolean;
}

interface SecuredCache {
  roles: string[];
  valid: boolean;
}

interface TracingCache {
  globalEnabled: boolean;
  enabled: boolean;
  categories: string[];
}

interface BackupTakeOffline {
  afterFailures?: number;
  minWait?: number;
  minWaitUnit?: string;
}

interface BackupStateTransfer {
  chunckSize?: number;
  timeout?: number;
  timeoutUnit?: string;
  maxRetries?: number;
  waitTime?: number;
  waitTimeUnit?: string;
  mode?: 'MANUAL' | 'AUTO';
}
interface BackupSite {
  site?: string;
  failurePolicy?: 'IGNORE' | 'WARN' | 'FAIL' | 'CUSTOM';
  timeout?: number;
  timeoutUnit?: string;
  twoPhaseCommit?: boolean;
  failurePolicyClass?: string;
  takeOffline?: BackupTakeOffline;
  stateTransfer?: BackupStateTransfer;
}

interface BackupFor {
  enabled: boolean;
  remoteCache: string;
  remoteSite: string;
}

interface BackupSiteBasic {
  siteName?: string;
  siteStrategy?: string;
}

interface BackupSetting {
  mergePolicy?: string;
  maxCleanupDelay?: number;
  maxCleanupDelayUnit?: string;
  tombstoneMapSize?: number;
}

interface BackupsCache {
  sites: BackupSiteBasic[];
  backupFor: BackupFor;
  valid: boolean;
}

interface TransactionalCache {
  mode?: string;
  locking?: string;
  valid: boolean;
}

interface TransactionalCacheAdvance {
  stopTimeout?: number;
  stopTimeoutUnit?: string;
  completeTimeout?: number;
  completeTimeoutUnit?: string;
  reaperInterval?: number;
  reaperIntervalUnit?: string;
  isolationLevel?: string;
}

interface PersistentCache {
  storage: string;
  config: string;
  valid: boolean;
  passivation: boolean;
  connectionAttempts?: number;
  connectionInterval?: number;
  connectionIntervalUnit?: string;
  availabilityInterval?: number;
  availabilityIntervalUnit?: string;
}

interface CacheFeatureStep {
  cacheFeatureSelected: string[];
  boundedCache: BoundedCache;
  indexedCache: IndexedCache;
  securedCache: SecuredCache;
  backupsCache: BackupsCache;
  transactionalCache: TransactionalCache;
  persistentCache: PersistentCache;
}

interface AdvancedConfigurationStep {
  storage?: string;
  concurrencyLevel?: number;
  lockAcquisitionTimeout?: number;
  lockAcquisitionTimeoutUnit?: string;
  striping?: boolean;
  indexReader: IndexReader;
  indexWriter: IndexWriter;
  indexMerge: IndexMerge;
  backupSetting?: BackupSetting;
  backupSiteData?: BackupSite[];
  transactionalAdvance?: TransactionalCacheAdvance;
  tracing: TracingCache;
  aliases: string[];
  valid: boolean;
}

interface CacheConfiguration {
  start: GettingStartedState;
  basic: BasicCacheConfig;
  feature: CacheFeatureStep;
  advanced: AdvancedConfigurationStep;
}

interface DataDistribution {
  node_name: string;
  node_addresses: string[];
  memory_entries: number;
  total_entries: number;
  memory_used: number;
}

interface ClusterDistribution {
  node_name: string;
  node_addresses: string[];
  memory_available: number;
  memory_used: number;
}

interface PaginationType {
  page: number;
  perPage: number;
}

interface ConnectedClients {
  id: number;
  'server-node-name': string;
  name?: string;
  created: string;
  principal: string;
  'local-address': string;
  'remote-address': string;
  'protocol-version': string;
  'client-library': string;
  'client-version'?: string | null;
  'ssl-application-protocol'?: string;
  'ssl-cipher-suite'?: string;
  'ssl-protocol'?: string;
  count?: number;
}

interface Role {
  name: string;
  description: string;
  implicit: boolean;
  permissions: string[];
}

interface Principal {
  name: string;
  roles: string[];
}

interface Realm {
  name: string;
  users: string[];
}

interface IndexMetamodel {
  entityName: string;
  indexName: string;
  valueFields: IndexValueField[];
}

interface IndexValueField {
  name: string;
  multiValued: boolean;
  multiValuedInRoot: boolean;
  type: string;
  projectionType: string;
  argumentType: string;
  searchable: boolean;
  sortable: boolean;
  projectable: boolean;
  aggregable: boolean;
  analyzer: string;
}
