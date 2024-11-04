import {
  customStore,
  fileStore,
  jdbcStore,
  querySqlStore,
  remoteStore,
  tableSqlStore
} from '@app/utils/persistentStorageTemplate';

export const TracingCategories = ['container', 'x-site', 'cluster', 'persistence'];

/**
 * Cache configuration utils class
 *
 * @author Katia Aresti
 */
export enum ContentType {
  StringContentType = 'String', //'application/x-java-object;type=java.lang.String'
  IntegerContentType = 'Integer', //'application/x-java-object;type=java.lang.Integer'
  DoubleContentType = 'Double', //'application/x-java-object;type=java.lang.Double'
  FloatContentType = 'Float', //'application/x-java-object;type=java.lang.Float'
  LongContentType = 'Long', //'application/x-java-object;type=java.lang.Long'
  BooleanContentType = 'Boolean', //'application/x-java-object;type=java.lang.Boolean'
  JSON = 'Json', //'application/json'
  XML = 'Xml', //'application/xml',
  YAML = 'Yaml', //'application/yaml'

  // Protobuf types
  string = 'string',
  int32 = 'int32',
  int64 = 'int64',
  double = 'double',
  float = 'float',
  bool = 'bool',
  bytes = 'bytes',
  uint32 = 'uint32',
  uint64 = 'uint64',
  sint32 = 'sint32',
  sint64 = 'sint64',
  fixed32 = 'fixed32',
  fixed64 = 'fixed64',
  sfixed32 = 'sfixed32',
  sfixed64 = 'sfixed64',
  customType = 'Custom Type'
}

export enum CacheType {
  Distributed = 'Distributed',
  Replicated = 'Replicated',
  Local = 'Local',
  Invalidated = 'Invalidated'
}

export enum EncodingType {
  Protobuf = 'application/x-protostream',
  Java = 'application/x-java-object',
  JavaSerialized = 'application/x-java-serialized-object',
  XML = 'application/xml; charset=UTF-8',
  JSON = 'application/json',
  Text = 'text/plain',
  JBoss = 'application/x-jboss-marshalling',
  Octet = 'application/octet-stream',
  Empty = 'Empty',
  Unknown = 'Unknown'
}

export enum InfinispanFlags {
  CACHE_MODE_LOCAL = 'CACHE_MODE_LOCAL',
  FAIL_SILENTLY = 'FAIL_SILENTLY',
  FORCE_ASYNCHRONOUS = 'FORCE_ASYNCHRONOUS',
  FORCE_SYNCHRONOUS = 'FORCE_SYNCHRONOUS',
  FORCE_WRITE_LOCK = 'FORCE_WRITE_LOCK',
  IGNORE_RETURN_VALUES = 'IGNORE_RETURN_VALUES',
  IGNORE_TRANSACTION = 'IGNORE_TRANSACTION',
  PUT_FOR_EXTERNAL_READ = 'PUT_FOR_EXTERNAL_READ',
  REMOTE_ITERATION = 'REMOTE_ITERATION',
  SKIP_CACHE_LOAD = 'SKIP_CACHE_LOAD',
  SKIP_CACHE_STORE = 'SKIP_CACHE_STORE',
  SKIP_INDEX_CLEANUP = 'SKIP_INDEX_CLEANUP',
  SKIP_INDEXING = 'SKIP_INDEXING',
  SKIP_LISTENER_NOTIFICATION = 'SKIP_LISTENER_NOTIFICATION',
  SKIP_LOCKING = 'SKIP_LOCKING',
  SKIP_OWNERSHIP_CHECK = 'SKIP_OWNERSHIP_CHECK',
  SKIP_REMOTE_LOOKUP = 'SKIP_REMOTE_LOOKUP',
  SKIP_SHARED_CACHE_STORE = 'SKIP_SHARED_CACHE_STORE',
  SKIP_SIZE_OPTIMIZATION = 'SKIP_SIZE_OPTIMIZATION',
  SKIP_STATISTICS = 'SKIP_STATISTICS',
  SKIP_XSITE_BACKUP = 'SKIP_XSITE_BACKUP',
  ZERO_LOCK_ACQUISITION_TIMEOUT = 'ZERO_LOCK_ACQUISITION_TIMEOUT'
}

export enum EvictionStrategy {
  REMOVE = 'REMOVE',
  EXCEPTION = 'EXCEPTION'
}

export enum IsolationLevel {
  REPEATABLE_READ = 'REPEATABLE_READ',
  READ_COMMITTED = 'READ_COMMITTED'
}

export enum StorageType {
  HEAP = 'HEAP',
  OFF_HEAP = 'OFF_HEAP'
}

export enum CacheMode {
  ASYNC = 'ASYNC',
  SYNC = 'SYNC'
}

export enum CacheFeature {
  BOUNDED = 'Bounded',
  INDEXED = 'Indexed',
  SECURED = 'Authorization',
  PERSISTENCE = 'Persistence',
  TRANSACTIONAL = 'Transactional',
  BACKUPS = 'Backups'
}

export enum CacheFeatureFilter {
  Bounded = 'bounded',
  Indexed = 'indexed',
  Authorization = 'secured',
  Persistence = 'persistent',
  Transactional = 'transactional',
  Backups = 'hasRemoteBackup'
}

export enum CacheStatus {
  IGNORED = 'Hidden'
}

export enum MaxSizeUnit {
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
  KiB = 'KiB',
  MiB = 'MiB',
  GiB = 'GiB',
  TiB = 'TiB'
}

export enum TimeUnits {
  milliseconds = 'milliseconds',
  seconds = 'seconds',
  minutes = 'minutes',
  hours = 'hours',
  days = 'days'
}

export enum EvictionType {
  size = 'size',
  count = 'count'
}

export enum IndexingMode {
  auto = 'AUTO',
  manual = 'MANUAL'
}

export enum IndexedStorage {
  persistent = 'filesystem',
  volatile = 'local-heap'
}

export enum IndexedStartupMode {
  none = 'None',
  purge = 'Purge',
  reindex = 'Reindex',
  auto = 'Auto'
}

export enum BackupSiteStrategy {
  ASYNC = 'ASYNC',
  SYNC = 'SYNC'
}

export enum BackupSiteFailurePolicy {
  IGNORE = 'IGNORE',
  WARN = 'WARN',
  FAIL = 'FAIL',
  CUSTOM = 'CUSTOM'
}

export enum BackupSiteStateTransferMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO'
}

export enum Locking {
  OPTIMISTIC = 'OPTIMISTIC',
  PESSIMISTIC = 'PESSIMISTIC'
}

export enum TransactionalMode {
  NON_XA = 'NON_XA',
  NON_DURABLE_XA = 'NON_DURABLE_XA',
  FULL_XA = 'FULL_XA'
}

export enum PersistentCacheStorage {
  FileStore = 'File store',
  RemoteStore = 'Remote store',
  TableSQLStore = 'Table SQL store',
  QuerySQLStore = 'Query SQL store',
  JDBCStore = 'JDBC string-based store',
  Custom = 'Custom store'
}

export const PersistentStorageConfig = new Map<string, string>([
  [PersistentCacheStorage.FileStore, fileStore],
  [PersistentCacheStorage.RemoteStore, remoteStore],
  [PersistentCacheStorage.TableSQLStore, tableSqlStore],
  [PersistentCacheStorage.QuerySQLStore, querySqlStore],
  [PersistentCacheStorage.JDBCStore, jdbcStore],
  [PersistentCacheStorage.Custom, customStore]
]);

export enum ConfigDownloadType {
  JSON = 'JSON',
  XML = 'XML',
  YAML = 'YAML'
}

export enum DataDistributionStatsOption {
  Entries = 'Entries',
  MemoryUsed = 'Total memory used'
}

export enum CounterType {
  STRONG_COUNTER = 'Strong',
  WEAK_COUNTER = 'Weak'
}

export enum CounterStorage {
  VOLATILE = 'Volatile',
  PERSISTENT = 'Persistent'
}

export enum RoleFilterOption {
  name = 'Name',
  cacheManagerPermissions = 'Cache Manager Permissions',
  cachePermissions = 'Cache Permissions'
}

export enum Permission {
  ALL = 'all'
}

export const ROLES_MAP = new Map<string, string>([
  ['ALL', 'access-management.roles.permission-all'],
  ['ADMIN', 'access-management.roles.permission-admin'],
  ['ALL_READ', 'access-management.roles.permission-all-read'],
  ['READ', 'access-management.roles.permission-read'],
  ['BULK_READ', 'access-management.roles.permission-bulk-read'],
  ['ALL_WRITE', 'access-management.roles.permission-all-write'],
  ['WRITE', 'access-management.roles.permission-write'],
  ['BULK_WRITE', 'access-management.roles.permission-bulk-write'],
  ['MONITOR', 'access-management.roles.permission-monitor'],
  ['CREATE', 'access-management.roles.permission-create'],
  ['EXEC', 'access-management.roles.permission-exec'],
  ['LISTEN', 'access-management.roles.permission-listen'],
  ['LIFECYCLE', 'access-management.roles.permission-lifecycle'],
  ['NONE', 'access-management.roles.permission-none']
]);

export const UNKNOWN: ComponentStatusType = {
  name: 'Unknown',
  status: 'custom'
};
export const OK_STATUS: ComponentStatusType = {
  name: 'Ok',
  status: 'success'
};
export const RUNNING_STATUS: ComponentStatusType = {
  name: 'Running',
  status: 'success'
};
export const INIT_STATUS: ComponentStatusType = {
  name: 'Initializing',
  status: 'warning'
};
export const CANCEL_STATUS: ComponentStatusType = {
  name: 'Cancelling',
  status: 'warning'
};

export const ERROR_STATUS: ComponentStatusType = {
  name: 'Error',
  status: 'danger'
};
export const TERMINATED_STATUS: ComponentStatusType = {
  name: 'Terminated',
  status: 'info'
};
export const STOPPING_STATUS: ComponentStatusType = {
  name: 'Stopping',
  status: 'info'
};
export const INSTANTIATED_STATUS: ComponentStatusType = {
  name: 'Instantiated',
  status: 'info'
};

export const ST_IDLE: ComponentStatusType = {
  name: 'Inactive',
  status: 'success'
};
export const ST_SENDING: ComponentStatusType = {
  name: 'Sending',
  status: 'info'
};
export const ST_SEND_OK: ComponentStatusType = {
  name: 'Transfer Ok',
  status: 'success'
};
export const ST_SEND_FAILED: ComponentStatusType = {
  name: 'Transfer Failed',
  status: 'danger'
};
export const ST_SEND_CANCELED: ComponentStatusType = {
  name: 'Transfer Cancelled',
  status: 'warning'
};

export const HEALTHY_HEALTH: ComponentStatusType = {
  name: 'Healthy',
  status: 'success'
};

export const HEALTHY_REBALANCING_HEALTH: ComponentStatusType = {
  name: 'Healthy rebalancing',
  status: 'info'
};

export const DEGRADED_HEALTH: ComponentStatusType = {
  name: 'Degraded',
  status: 'warning'
};

export const FAILED: ComponentStatusType = {
  name: 'Failed',
  status: 'danger'
};
