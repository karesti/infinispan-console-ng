import { AuthenticationService } from '@services/authService';
import { RestUtils } from '@services/utils';
import { ProtobufService } from '@services/protobufService';
import { TasksService } from '@services/tasksService';
import { ServerService } from '@services/serverService';
import { CountersService } from '@services/countersService';
import { CrossSiteReplicationService } from '@services/crossSiteReplicationService';
import { CacheService } from '@services/cacheService';
import { ContainerService } from '@services/dataContainerService';
import { SecurityService } from '@services/securityService';
import {SearchService} from "@services/searchService";

/**
 * Infinispan Console Services
 */
export class ConsoleServices {
  private initialized = false;
  private static instance: ConsoleServices = new ConsoleServices();
  private restUtils;
  private authenticationService;
  private countersService;
  private serverService;
  private taskService;
  private protobufService;
  private xsiteReplicationService;
  private cacheService;
  private dataContainerService;
  private userService;
  private searchService;

  private constructor() {
    this.initialized = false;
  }

  public static get Instance(): ConsoleServices {
    return this.instance;
  }

  public static isDevMode(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  public static endpoint(): string {
    if (ConsoleServices.isDevMode()) {
      if (!process.env.INFINISPAN_SERVER_URL) {
        return 'http://localhost:11222/rest/v2';
      } else {
        return process.env.INFINISPAN_SERVER_URL + '/rest/v2';
      }
    } else {
      return window.location.origin.toString() + '/rest/v2';
    }
  }

  public static landing(): string {
    if (ConsoleServices.isDevMode()) {
      return 'http://localhost:9000/console/';
    } else {
      return window.location.origin.toString() + '/console';
    }
  }

  public static isWelcomePage(): boolean {
    return (
      location.pathname == '/console/welcome' ||
      location.pathname == '/console/welcome/'
    );
  }

  public static init() {
    if (!this.instance.initialized) {
      console.info('Init Console Services');
      this.instance.authenticationService = new AuthenticationService(
        ConsoleServices.endpoint()
      );
      this.instance.restUtils = new RestUtils(
        this.instance.authenticationService
      );
      this.instance.protobufService = new ProtobufService(
        ConsoleServices.endpoint() + '/schemas',
        this.instance.restUtils
      );
      this.instance.taskService = new TasksService(
        ConsoleServices.endpoint() + '/tasks',
        this.instance.restUtils
      );
      this.instance.serverService = new ServerService(
        ConsoleServices.endpoint() + '/server',
        this.instance.restUtils
      );
      this.instance.countersService = new CountersService(
        ConsoleServices.endpoint() + '/counters',
        this.instance.restUtils
      );
      this.instance.xsiteReplicationService = new CrossSiteReplicationService(
        ConsoleServices.endpoint(),
        this.instance.restUtils
      );
      this.instance.cacheService = new CacheService(
        ConsoleServices.endpoint(),
        this.instance.restUtils
      );
      this.instance.dataContainerService = new ContainerService(
        ConsoleServices.endpoint(),
        this.instance.restUtils
      );
      this.instance.userService = new SecurityService(
        ConsoleServices.endpoint() + '/security',
        this.instance.restUtils,
        this.instance.authenticationService
      );

      this.instance.searchService = new SearchService(
        ConsoleServices.endpoint() + '/caches',
        this.instance.restUtils
      );

      this.instance.initialized = true;
    }
  }

  public static server(): ServerService {
    return this.instance.serverService;
  }

  public static dataContainer(): ContainerService {
    return this.instance.dataContainerService;
  }

  public static caches(): CacheService {
    return this.instance.cacheService;
  }

  public static protobuf(): ProtobufService {
    return this.instance.protobufService;
  }

  public static xsite(): CrossSiteReplicationService {
    return this.instance.xsiteReplicationService;
  }

  public static counters(): CountersService {
    return this.instance.countersService;
  }

  public static tasks(): TasksService {
    return this.instance.taskService;
  }

  public static authentication(): AuthenticationService {
    return this.instance.authenticationService;
  }

  public static security(): SecurityService {
    return this.instance.userService;
  }

  public static search(): SearchService {
    return this.instance.searchService;
  }

  public isInitialized(): boolean {
    return ConsoleServices.Instance.initialized;
  }
}
