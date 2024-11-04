import { FetchCaller } from './fetchCaller';
import { Either } from './either';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import displayUtils from '@services/displayUtils';

export class ContainerService {
  endpoint: string;
  fetchCaller: FetchCaller;

  private TEMPLATES = [
    'example.PROTOBUF_DIST',
    'org.infinispan.DIST_ASYNC',
    'org.infinispan.DIST_SYNC',
    'org.infinispan.INVALIDATION_ASYNC',
    'org.infinispan.INVALIDATION_SYNC',
    'org.infinispan.LOCAL',
    'org.infinispan.REPL_ASYNC',
    'org.infinispan.REPL_SYNC'
  ];

  constructor(endpoint: string, fetchCaller: FetchCaller) {
    this.endpoint = endpoint;
    this.fetchCaller = fetchCaller;
  }

  /**
   * For now there is a single cache manager
   */
  public getDefaultCacheManager(): Promise<Either<ActionResponse, CacheManager>> {
    const healthPromise: Promise<Either<ActionResponse, ComponentStatusType>> = this.fetchCaller.get(
      this.endpoint + '/container/health',
      (data) => displayUtils.parseComponentStatus(data.cluster_health.health_status)
    );

    return healthPromise.then((maybeHealth) =>
      this.fetchCaller.get(
        this.endpoint + '/container/',
        (data) =>
          <CacheManager>{
            name: data.name,
            physical_addresses: data.physical_addresses,
            coordinator: data.coordinator,
            cluster_name: data.cluster_name,
            cache_manager_status: displayUtils.parseComponentStatus(data.cache_manager_status),
            cluster_size: data.cluster_size,
            defined_caches: this.removeInternalCaches(data.defined_caches),
            cache_configuration_names: this.removeInternalTemplate(data.cache_configuration_names),
            cluster_members: this.clusterMembers(data.cluster_members, data.cluster_members_physical_addresses),
            health: maybeHealth.isRight() ? maybeHealth.value : maybeHealth.value.message,
            local_site: data.local_site,
            rebalancing_enabled: data.rebalancing_enabled,
            backups_enabled: data.relay_node || (data.local_site != null && data.local_site !== ''), // relay node might be false if not coordinator
            sites_view: data.sites_view,
            tracing_enabled: data.tracing_enabled
          }
      )
    );
  }

  private removeInternalCaches(caches: DefinedCache[]) {
    return caches.filter((cache) => !cache.name.startsWith('___'));
  }

  private removeInternalTemplate(templates: string[]) {
    return templates.filter((template) => this.isInternalTemplate(template));
  }

  private isInternalTemplate(template: string) {
    return template.startsWith('___') || this.TEMPLATES.includes(template);
  }

  /**
   * Retrieve the cache manager stats
   */
  public async getCacheManagerStats(): Promise<Either<ActionResponse, CacheManagerStats>> {
    return this.fetchCaller.get(this.endpoint + '/container/stats', (data) => {
      return <CacheManagerStats>data;
    });
  }

  /**
   * Clear cache manager stats
   */
  public async clearCacheManagerStats(): Promise<ActionResponse> {
    const clearUrl = this.endpoint + '/container/stats?action=reset';
    return this.fetchCaller.post({
      url: clearUrl,
      successMessage: `Global metrics cleared.`,
      errorMessage: `Unexpected error when clearing global metrics.`
    });
  }

  /**
   * Get cache configuration templates for in the cache manager name
   *
   */
  public async getCacheConfigurationTemplates(): Promise<Either<ActionResponse, CacheConfig[]>> {
    return this.fetchCaller.get(this.endpoint + '/container/cache-configs/templates', (data) =>
      data
        .filter((config) => !this.isInternalTemplate(config.name))
        .map(
          (config) =>
            <CacheConfig>{
              name: config.name,
              config: JSON.stringify(config.configuration, undefined, 2)
            }
        )
    );
  }

  /**
   * Get all caches for a cache manager
   * @param name
   */
  public async getCaches(): Promise<Either<ActionResponse, CacheInfo[]>> {
    return this.fetchCaller.get(this.endpoint + '/caches?action=detailed', (data) =>
      data
        .map(
          (cacheInfo) =>
            <CacheInfo>{
              name: cacheInfo.name,
              status: cacheInfo.status,
              type: CacheConfigUtils.mapCacheType(cacheInfo.type),
              simpleCache: cacheInfo.simpleCache,
              aliases: cacheInfo.aliases,
              features: <Features>{
                transactional: cacheInfo.transactional,
                persistent: cacheInfo.persistent,
                bounded: cacheInfo.bounded,
                secured: cacheInfo.secured,
                indexed: cacheInfo.indexed,
                hasRemoteBackup: cacheInfo.has_remote_backup
              },
              tracing: cacheInfo.tracing,
              health: displayUtils.parseComponentStatus(cacheInfo.health),
              rebalancing_enabled: cacheInfo['rebalancing_enabled']
            }
        )
        .filter((cacheInfo) => !cacheInfo.name.startsWith('___'))
    );
  }

  /**
   * Enables or disables rebalancing on a cluster
   * @param enable, true to enable, false for disable
   */
  public async rebalancing(enable: boolean): Promise<ActionResponse> {
    const action = enable ? 'enable' : 'disable';
    const url = this.endpoint + '/container?action=' + action + '-rebalancing';
    return this.fetchCaller.post({
      url: url,
      successMessage: `Rebalancing ${action}d.`,
      errorMessage: `Unexpected error when rebalancing ${action}d.`
    });
  }

  private clusterMembers(cluster_members: [string], cluster_members_physical_addresses: [string]): ClusterMember[] {
    return cluster_members.map(
      (mem, index) =>
        <ClusterMember>{
          name: mem,
          physical_address: cluster_members_physical_addresses[index]
        }
    );
  }
}
