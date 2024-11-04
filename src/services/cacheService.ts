import { FetchCaller } from './fetchCaller';
import { Either, left, right } from './either';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { ContentTypeHeaderMapper } from '@services/contentTypeHeaderMapper';
import { CacheRequestResponseMapper } from '@services/cacheRequestResponseMapper';
import { ContentType, EncodingType } from '@services/infinispanRefData';
import { formatXml } from '@utils/dataSerializerUtils';
import displayUtils from '@services/displayUtils';

/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 */
export class CacheService {
  endpoint: string;
  fetchCaller: FetchCaller;

  constructor(endpoint: string, fetchCaller: FetchCaller) {
    this.endpoint = endpoint;
    this.fetchCaller = fetchCaller;
  }

  /**
   * Retrieve cache health
   *
   * @param cacheName
   */
  public retrieveHealth(cacheName: string): Promise<Either<ActionResponse, ComponentStatusType>> {
    return this.fetchCaller.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=health',
      (data) => displayUtils.parseComponentStatus(data),
      undefined,
      true
    );
  }

  /**
   * Retrieve cache config
   *
   * @param cacheName
   */
  public retrieveConfig(cacheName: string): Promise<Either<ActionResponse, CacheConfig>> {
    return this.fetchCaller.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=config',
      (data) =>
        <CacheConfig>{
          name: cacheName,
          config: JSON.stringify(data, null, 2)
        }
    );
  }

  /**
   * Retrieves all the properties to be displayed in the cache detail in a single rest call
   *
   * @param cacheName
   */
  public retrieveFullDetail(cacheName: string): Promise<Either<ActionResponse, DetailedInfinispanCache>> {
    return this.fetchCaller.get(this.endpoint + '/caches/' + encodeURIComponent(cacheName), (data) => {
      let cacheStats = <CacheStats>{ enabled: false };
      if (data['stats']) {
        cacheStats = data.stats;
        cacheStats.enabled = data.statistics;
      }
      const keyValueEncoding = {
        key: CacheConfigUtils.toEncoding(data['key_storage']),
        value: CacheConfigUtils.toEncoding(data['value_storage'])
      };
      let cacheConfig: CacheConfig | undefined = undefined;
      if (data.configuration) {
        cacheConfig = <CacheConfig>{
          name: cacheName,
          config: JSON.stringify(data.configuration, null, 2)
        };
      }

      let cacheMemory: undefined | CacheMemory = undefined;
      if (data['storage_type']) {
        cacheMemory = <CacheMemory>{
          storage_type: data['storage_type'],
          max_size: data['max_size'],
          max_size_bytes: data['max_size_bytes']
        };
      }

      const cacheType = CacheConfigUtils.mapCacheType(data['mode']);
      const async = CacheConfigUtils.isAsync(data['mode']);
      return <DetailedInfinispanCache>{
        name: cacheName,
        started: true,
        type: cacheType,
        encoding: keyValueEncoding,
        size: data['size'],
        rehash_in_progress: data['rehash_in_progress'],
        indexing_in_progress: data['indexing_in_progress'],
        rebalancing_enabled: data['rebalancing_enabled'],
        aliases: data.aliases,
        editable:
          data.indexed ||
          (CacheConfigUtils.isEditable(keyValueEncoding.key as EncodingType) &&
            CacheConfigUtils.isEditable(keyValueEncoding.value as EncodingType)),
        updateEntry: CacheConfigUtils.canUpdateEntries(keyValueEncoding.key as EncodingType),
        deleteEntry: CacheConfigUtils.canDeleteEntries(keyValueEncoding.key as EncodingType),
        queryable: data.queryable,
        features: <Features>{
          bounded: data.bounded,
          indexed: data.indexed,
          persistent: data.persistent,
          transactional: data.transactional,
          secured: data.secured,
          hasRemoteBackup: data['has_remote_backup']
        },
        tracing: data.tracing,
        configuration: cacheConfig,
        stats: cacheStats,
        memory: cacheMemory,
        async: async
      };
    });
  }

  /**
   * Creates a cache by configuration name.
   * The template must be present in the server
   *
   * @param cacheName, the cache name
   * @param configName, the template name
   */
  public async createCacheByConfigName(cacheName: string, configName: string): Promise<ActionResponse> {
    const createCacheByConfig =
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?template=' + encodeURIComponent(configName);

    return this.fetchCaller.post({
      url: createCacheByConfig,
      successMessage: `Cache ${cacheName} successfully created with ${configName}.`,
      errorMessage: `Unexpected error when creating cache ${configName}.`
    });
  }

  /**
   * Create a cache with the configuration provided.
   * Config can be in json or xml format
   *
   * @param cacheName, the cache name
   * @param config, the configuration to send in the body
   */
  public async createCacheWithConfiguration(
    cacheName: string,
    config: string,
    configType: 'xml' | 'json' | 'yaml'
  ): Promise<ActionResponse> {
    const customHeaders = this.createCustomHeader('Content-Type', configType);

    const urlCreateCache = this.endpoint + '/caches/' + encodeURIComponent(cacheName);
    return this.fetchCaller.post({
      url: urlCreateCache,
      successMessage: `Cache ${cacheName} created with the provided configuration.`,
      errorMessage: 'Unexpected error creating the cache with the provided configuration.',
      customHeaders: customHeaders,
      body: config
    });
  }

  private createCustomHeader(header: string, configType: 'xml' | 'json' | 'yaml') {
    let contentType = ContentType.YAML;
    if (configType == 'json') {
      contentType = ContentType.JSON;
    } else if (configType == 'xml') {
      contentType = ContentType.XML;
    }
    const customHeaders = new Headers();
    customHeaders.append(header, ContentTypeHeaderMapper.fromContentType(contentType));
    return customHeaders;
  }

  /**
   * Delete cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async deleteCache(cacheName: string): Promise<ActionResponse> {
    return this.fetchCaller.delete({
      url: this.endpoint + '/caches/' + encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} deleted.`,
      errorMessage: `Unexpected error deleting cache ${cacheName}.`
    });
  }

  /**
   * Ignore cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async ignoreCache(cacheName: string): Promise<ActionResponse> {
    return this.fetchCaller.post({
      url: this.endpoint + '/server/ignored-caches/' + encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} hidden.`,
      errorMessage: `Unexpected error hidding cache ${cacheName}.`
    });
  }

  /**
   * Undo ignore cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async undoIgnoreCache(cacheName: string): Promise<ActionResponse> {
    return this.fetchCaller.delete({
      url: this.endpoint + '/server/ignored-caches/' + encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} is now visible.`,
      errorMessage: `Unexpected error making cache ${cacheName} visible again.`
    });
  }

  /**
   * Add or Update an entry
   *
   * @param cacheName
   * @param key
   * @param keyContentType
   * @param value
   * @param valueContentType
   * @param maxIdle
   * @param timeToLive
   * @param flags
   */
  public async createOrUpdateEntry(
    cacheName: string,
    cacheEncoding: CacheEncoding,
    key: string,
    keyContentType: ContentType,
    value: string,
    valueContentType: ContentType,
    maxIdle: string,
    timeToLive: string,
    flags: string[],
    create: boolean
  ): Promise<ActionResponse> {
    const headers = new Headers();
    const keyContentTypeHeader = ContentTypeHeaderMapper.fromEncodingAndContentTypeToHeader(
      cacheEncoding.key as EncodingType,
      key,
      keyContentType
    );
    const contentTypeHeader = ContentTypeHeaderMapper.fromEncodingAndContentTypeToHeader(
      cacheEncoding.value as EncodingType,
      value,
      valueContentType
    );
    headers.append('Key-Content-Type', keyContentTypeHeader);
    headers.append('Content-Type', contentTypeHeader);
    if (timeToLive.length > 0) headers.append('timeToLiveSeconds', timeToLive);
    if (maxIdle.length > 0) headers.append('maxIdleTimeSeconds', maxIdle);
    if (flags.length > 0) headers.append('flags', flags.join(','));

    // treat key to send in the url
    let keyForUrl = '';
    const maybeKeyForUrl = CacheRequestResponseMapper.formatContent(
      key,
      keyContentType,
      cacheEncoding.key as EncodingType
    );
    if (maybeKeyForUrl.isRight()) {
      keyForUrl = maybeKeyForUrl.value;
    } else {
      return Promise.resolve(maybeKeyForUrl.value);
    }

    // treat value to send in the body
    let body = '';
    const maybeBody = CacheRequestResponseMapper.formatContent(
      value,
      valueContentType,
      cacheEncoding.value as EncodingType
    );
    if (maybeBody.isRight()) {
      body = maybeBody.value;
    } else {
      return Promise.resolve(maybeBody.value);
    }

    const urlCreateOrUpdate =
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/' + encodeURIComponent(keyForUrl);

    return create
      ? this.fetchCaller.post({
          url: urlCreateOrUpdate,
          successMessage: `Entry added to cache ${cacheName}.`,
          errorMessage: `Unexpected error creating an entry in cache ${cacheName}.`,
          customHeaders: headers,
          body: body
        })
      : this.fetchCaller.put({
          url: urlCreateOrUpdate,
          successMessage: `Entry updated in cache ${cacheName}.`,
          errorMessage: `Unexpected error updating an entry in cache ${cacheName}.`,
          customHeaders: headers,
          body: body
        });
  }

  /**
   * List of entries.
   *
   * @param cacheName, the cache name
   * @param limit, maximum number of entries to be retrieved
   */
  public async getEntries(
    cacheName: string,
    encoding: CacheEncoding,
    limit: string
  ): Promise<Either<ActionResponse, CacheEntry[]>> {
    const entriesUrl =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '?action=entries&content-negotiation=true&metadata=true&limit=' +
      limit;

    const customHeaders = new Headers();
    customHeaders.set('Accept', ContentTypeHeaderMapper.fromContentType(ContentType.JSON));
    return this.fetchCaller.get(
      entriesUrl,
      (data) => CacheRequestResponseMapper.toEntries(data, encoding),
      customHeaders
    );
  }

  /**
   * Get entry by key
   * @param cacheName
   * @param key
   * @param keyContentType
   * @return Entry or ActionResponse
   */
  public async getEntry(
    cacheName: string,
    encoding: CacheEncoding,
    key: string,
    keyContentType: ContentType
  ): Promise<Either<ActionResponse, CacheEntry[]>> {
    const customHeaders = new Headers();

    if ((encoding.value as EncodingType) == EncodingType.XML) {
      customHeaders.append('Accept', 'application/xml');
    } else if (
      (encoding.value as EncodingType) == EncodingType.JSON ||
      (encoding.value as EncodingType) == EncodingType.Protobuf ||
      (encoding.value as EncodingType) == EncodingType.JavaSerialized ||
      (encoding.value as EncodingType) == EncodingType.Java
    ) {
      customHeaders.append('Accept', 'application/json');
    } else {
      customHeaders.append('Accept', 'text/plain');
    }

    let keyContentTypeHeader;
    let keyForURL;
    if (encoding.key == EncodingType.Protobuf || encoding.key == EncodingType.JSON) {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(ContentType.JSON);
      const keyProtobuffed = CacheRequestResponseMapper.formatContent(
        key,
        keyContentType,
        encoding.key as EncodingType
      );
      if (keyProtobuffed.isLeft()) {
        // Return the error
        return Promise.resolve(left(keyProtobuffed.value));
      }
      keyForURL = keyProtobuffed.value;
    } else {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(keyContentType);
      keyForURL = key;
    }

    customHeaders.append('Key-Content-Type', keyContentTypeHeader);

    const getEntryUrl =
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/' + encodeURIComponent(keyForURL);

    return this.fetchCaller
      .fetch(getEntryUrl, 'GET', customHeaders)
      .then((response) => {
        if (response.ok) {
          return response
            .text()
            .then((value) => [
              CacheRequestResponseMapper.toEntry(key, keyContentType, encoding, value, response.headers)
            ]);
        }

        if (response.status == 404) {
          // Just return empty array if not found
          return [];
        }

        return response.text().then((text) => {
          throw text;
        });
      })
      .then((data) => right(data) as Either<ActionResponse, CacheEntry[]>)
      .catch((err) => {
        return left(this.fetchCaller.mapError(err, 'An error occurred retrieving key ' + key));
      });
  }

  /**
   * Clear cache
   * @param cacheName, the name of the cache
   */
  public async clear(cacheName: string): Promise<ActionResponse> {
    const clearUrl = this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=clear';
    return this.fetchCaller.post({
      url: clearUrl,
      successMessage: `Cache ${cacheName} cleared.`,
      errorMessage: `Unexpected error when clearing the cache ${cacheName}.`
    });
  }

  /**
   * Delete entry from cache
   *
   * @param cacheName, cache name
   * @param entryKey, entry key
   */
  public async deleteEntry(
    cacheName: string,
    key: string,
    keyEncoding: EncodingType,
    keyContentType: ContentType
  ): Promise<ActionResponse> {
    const headers = new Headers();
    let keyContentTypeHeader;
    let keyForURL;
    if (keyEncoding == EncodingType.Protobuf || keyEncoding == EncodingType.JSON) {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(ContentType.JSON);
      const keyProtobuffed = CacheRequestResponseMapper.formatContent(key, keyContentType, keyEncoding);
      if (keyProtobuffed.isLeft()) {
        // Return the error
        return Promise.resolve({
          message: 'Unexpected issue to parse key value',
          success: false
        });
      }
      keyForURL = keyProtobuffed.value;
    } else {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(keyContentType);
      keyForURL = key;
    }

    headers.append('Key-Content-Type', keyContentTypeHeader);

    const deleteUrl = this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '/' + encodeURIComponent(keyForURL);

    return this.fetchCaller.delete({
      url: deleteUrl,
      successMessage: `Entry ${key} deleted.`,
      errorMessage: 'Unexpected error deleting the entry.',
      customHeaders: headers
    });
  }

  /**
   * Retrieve cache configuration
   *
   * @param cacheName
   */
  public async getConfiguration(
    cacheName: string,
    configType: 'xml' | 'json' | 'yaml'
  ): Promise<Either<ActionResponse, string>> {
    const customHeaders = this.createCustomHeader('Accept', configType);

    return this.fetchCaller.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=config',
      (text) => text,
      customHeaders,
      true
    );
  }

  /**
   * Retrieve cache config attribute
   *
   * @param cacheName
   * @param configAttribute
   */
  public async getConfigAttribute(cacheName: string, configAttribute: string): Promise<Either<ActionResponse, string>> {
    const customHeaders = this.createCustomHeader('Accept', 'json');
    return this.fetchCaller.get(
      this.endpoint +
        '/caches/' +
        encodeURIComponent(cacheName) +
        '?action=get-mutable-attribute&attribute-name=' +
        configAttribute,
      (text) => text,
      customHeaders,
      true
    );
  }

  /**
   * Update cache config attribute
   *
   * @param cacheName
   * @param configAttribute
   * @param configAttributeValue
   */
  public async setConfigAttribute(cacheName: string, configAttribute: string, value: string): Promise<ActionResponse> {
    let url =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '?action=set-mutable-attribute&attribute-name=' +
      configAttribute +
      '&attribute-value=';
    if (value.length > 0) {
      url = url + encodeURIComponent(value);
    }
    return this.fetchCaller.post({
      url: url,
      successMessage: `Cache ${cacheName} successfully updated.`,
      errorMessage: `Unexpected error when updating ${cacheName} config.`
    });
  }

  public async getSize(cacheName: string): Promise<Either<ActionResponse, number>> {
    return this.fetchCaller
      .fetch(this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=size', 'GET')
      .then((response) => response.text())
      .then((data) => {
        if (Number.isNaN(data)) {
          return right(Number.parseInt(data)) as Either<ActionResponse, number>;
        } else {
          return left(<ActionResponse>{
            message: 'Size of cache ' + cacheName + ' is not a number :' + data,
            success: false
          }) as Either<ActionResponse, number>;
        }
      })
      .catch((err) => left(this.fetchCaller.mapError(err, 'Cannot get size for cache ' + cacheName)));
  }

  /**
   * Enables or disables rebalancing on a cache
   * @param cacheName
   * @param enable, true to enable, false for disable
   */
  public async rebalancing(cacheName: string, enable: boolean): Promise<ActionResponse> {
    const action = enable ? 'enable' : 'disable';
    const url = this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=' + action + '-rebalancing';
    return this.fetchCaller.post({
      url: url,
      successMessage: `Cache ${cacheName} rebalancing successfully ${action}d.`,
      errorMessage: `Unexpected error when cache ${cacheName} rebalancing ${action}d.`
    });
  }

  /**
   * Set Availability of cache
   * @param cacheName, the name of the cache
   * @author Dipanshu Gupta
   */
  public async setAvailability(cacheName: string): Promise<ActionResponse> {
    const availabilityUrl =
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=set-availability&availability=AVAILABLE';
    return this.fetchCaller.post({
      url: availabilityUrl,
      successMessage: `Cache ${cacheName} is now available.`,
      errorMessage: `An error occurred while changing cache ${cacheName} availability.`
    });
  }

  /**
   * Retrieve cache configuration
   *
   * @param cacheName
   */
  public async cacheExists(cacheName: string): Promise<ActionResponse> {
    return this.fetchCaller.head({
      url: this.endpoint + '/caches/' + encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} name is available.`,
      errorMessage: `Cache ${cacheName} already exists.`
    });
  }

  private createTwoCustomHeader(
    header1: string,
    configType1: 'xml' | 'json' | 'yaml',
    header2: string,
    configType2: 'xml' | 'json' | 'yaml'
  ) {
    const customHeaders = new Headers();

    let contentType1 = ContentType.YAML;
    if (configType1 == 'json') {
      contentType1 = ContentType.JSON;
    } else if (configType1 == 'xml') {
      contentType1 = ContentType.XML;
    }
    customHeaders.append(header1, ContentTypeHeaderMapper.fromContentType(contentType1));

    let contentType2 = ContentType.YAML;
    if (configType2 == 'json') {
      contentType2 = ContentType.JSON;
    } else if (configType2 == 'xml') {
      contentType2 = ContentType.XML;
    }
    customHeaders.append(header2, ContentTypeHeaderMapper.fromContentType(contentType2));
    return customHeaders;
  }

  public async convertToAllFormat(
    cacheName: string,
    config: string,
    contentType: 'xml' | 'json' | 'yaml'
  ): Promise<Either<ActionResponse, FormattedCacheConfig>> {
    return Promise.all([
      this.convertConfigFormat(cacheName, config, 'json', contentType),
      this.convertConfigFormat(cacheName, config, 'xml', contentType),
      this.convertConfigFormat(cacheName, config, 'yaml', contentType)
    ]).then((reposes) => {
      if (!reposes[0].success && !reposes[1].success && !reposes[2].success) {
        return left(<ActionResponse>{
          message: reposes[0].message,
          success: false
        }) as Either<ActionResponse, FormattedCacheConfig>;
      }

      let json: string | undefined = undefined;
      let xml: string | undefined = undefined;
      let yaml: string | undefined = undefined;
      if (reposes[0].success) {
        json = JSON.stringify(JSON.parse(reposes[0].data as string), null, 2);
      }
      if (reposes[1].success) {
        xml = formatXml(reposes[1].data);
      }

      if (reposes[2].success) {
        yaml = reposes[2].data as string;
      }

      return right(<FormattedCacheConfig>{
        json: json,
        xml: xml,
        yaml: yaml
      }) as Either<ActionResponse, FormattedCacheConfig>;
    });
  }

  /**
   * Convert cache configuration to XML or JSON or YAML
   */
  public async convertConfigFormat(
    cacheName: string,
    config: string,
    configType: 'xml' | 'json' | 'yaml',
    contentType: 'xml' | 'json' | 'yaml'
  ): Promise<ActionResponse> {
    const customHeaders = this.createTwoCustomHeader('Accept', configType, 'Content-Type', contentType);

    const urlCreateCache = this.endpoint + '/caches?action=convert';
    return this.fetchCaller.post({
      url: urlCreateCache,
      successMessage: `Cache ${cacheName} is converted to ${configType}.`,
      errorMessage: `Unexpected error converting the cache to ${configType}.`,
      customHeaders: customHeaders,
      body: config
    });
  }

  public async getDistribution(cacheName: string): Promise<Either<ActionResponse, DataDistribution[]>> {
    return this.fetchCaller.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=distribution',
      (text) => text
    );
  }

  public async getClusterDistribution(): Promise<Either<ActionResponse, ClusterDistribution[]>> {
    return this.fetchCaller.get(this.endpoint + '/cluster?action=distribution', (text) => text);
  }

  /**
   * Retrieve caches for a role
   *
   */
  public async getCachesForRole(role: string): Promise<Either<ActionResponse, Map<string, string[]>>> {
    return this.fetchCaller.get(this.endpoint + '/caches?action=role-accessible&role=' + role, (data) =>
      new Map().set('secured', data['secured']).set('non-secured', data['non-secured'])
    );
  }

  /**
   * Clear cache stats
   * @param cacheName, the name of the cache
   */
  public async clearStats(cacheName: string): Promise<ActionResponse> {
    const clearUrl = this.endpoint + '/caches/' + encodeURIComponent(cacheName) + '?action=stats-reset';
    return this.fetchCaller.post({
      url: clearUrl,
      successMessage: `Cache stats ${cacheName} cleared.`,
      errorMessage: `Unexpected error when clearing the cache ${cacheName} stats.`
    });
  }
}
