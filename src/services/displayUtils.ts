import { chart_color_blue_500, t_chart_color_purple_500 } from '@patternfly/react-tokens';
import numeral from 'numeral';
import {
  CacheType,
  CANCEL_STATUS,
  ContentType,
  DEGRADED_HEALTH,
  ERROR_STATUS,
  FAILED,
  HEALTHY_HEALTH,
  HEALTHY_REBALANCING_HEALTH,
  INIT_STATUS,
  INSTANTIATED_STATUS,
  OK_STATUS,
  RUNNING_STATUS,
  ST_IDLE,
  ST_SEND_CANCELED,
  ST_SEND_FAILED,
  ST_SEND_OK,
  ST_SENDING,
  STOPPING_STATUS,
  TERMINATED_STATUS,
  UNKNOWN
} from '@services/infinispanRefData';

/**
 * Utility class to manage display features
 *
 * @author Katia Aresti
 */

class DisplayUtils {
  public parseStateTransferStatus(value?: string): ComponentStatusType {
    let stateTransfertStatus: ComponentStatusType;
    switch (value) {
      case 'IDLE':
        stateTransfertStatus = ST_IDLE;
        break;
      case 'SENDING':
        stateTransfertStatus = ST_SENDING;
        break;
      case 'OK':
        stateTransfertStatus = ST_SEND_OK;
        break;
      case 'ERROR':
        stateTransfertStatus = ST_SEND_FAILED;
        break;
      case 'CANCELED':
        stateTransfertStatus = ST_SEND_CANCELED;
        break;
      default:
        stateTransfertStatus = ST_IDLE;
    }

    return stateTransfertStatus;
  }

  public parseComponentStatus(value?: string): ComponentStatusType {
    let componentStatus: ComponentStatusType;

    switch (value) {
      case 'HEALTHY':
        componentStatus = HEALTHY_HEALTH;
        break;
      case 'HEALTHY_REBALANCING':
        componentStatus = HEALTHY_REBALANCING_HEALTH;
        break;
      case 'DEGRADED':
        componentStatus = DEGRADED_HEALTH;
        break;
      case 'RUNNING':
        componentStatus = RUNNING_STATUS;
        break;
      case 'OK':
        componentStatus = OK_STATUS;
        break;
      case 'INITIALIZING':
        componentStatus = INIT_STATUS;
        break;
      case 'CANCELLING':
        componentStatus = CANCEL_STATUS;
        break;
      case 'ERROR':
        componentStatus = ERROR_STATUS;
        break;
      case 'TERMINATED':
        componentStatus = TERMINATED_STATUS;
        break;
      case 'STOPPING':
        componentStatus = STOPPING_STATUS;
        break;
      case 'INSTANTIATED':
        componentStatus = INSTANTIATED_STATUS;
        break;
      case 'FAILED':
        componentStatus = FAILED;
        break;
      default:
        componentStatus = UNKNOWN;
    }

    return componentStatus;
  }

  /**
   * Cache type color calculation for labels
   *
   * @param cacheType
   */
  public cacheTypeColor(cacheType: CacheType | undefined) {
    let color;
    if (cacheType == undefined) {
      return 'grey';
    }
    switch (cacheType) {
      case CacheType.Distributed:
        color = 'blue';
        break;
      case CacheType.Replicated:
        color = 'purple';
        break;
      case CacheType.Local:
        color = 'cyan';
        break;
      case CacheType.Invalidated:
        color = 'gold';
        break;
      default:
        color = 'grey';
    }
    return color;
  }

  public taskTypeColor(counterType: string): string {
    let color;
    switch (counterType) {
      case 'AdminServerTask':
        color = t_chart_color_purple_500.value;
        break;
      default:
        color = chart_color_blue_500.value;
    }
    return color;
  }

  public formatNumber(digit: number | undefined): string {
    if (!digit) return '0';

    if (digit >= 100000000) {
      return numeral(digit).format('0.0a');
    }

    return digit.toLocaleString('en', { maximumFractionDigits: 2 });
  }

  public formatBigNumber(digit: number | undefined): string {
    if (!digit) return '0';

    if (digit >= 1000000) {
      return numeral(digit).format('0.0a');
    }

    if (digit >= 1000) {
      return numeral(digit).format('0 a');
    }

    return this.formatNumber(digit);
  }

  public createFeaturesString(features: Features): string {
    let featuresString = '';

    if (features.bounded) {
      featuresString = this.appendFeature(featuresString, 'Bounded');
    }
    if (features.indexed) {
      featuresString = this.appendFeature(featuresString, 'Indexed');
    }
    if (features.persistent) {
      featuresString = this.appendFeature(featuresString, 'Persistent');
    }
    if (features.transactional) {
      featuresString = this.appendFeature(featuresString, 'Transactional');
    }
    if (features.secured) {
      featuresString = this.appendFeature(featuresString, 'Secured');
    }
    if (features.hasRemoteBackup) {
      featuresString = this.appendFeature(featuresString, 'Backups');
    }

    return featuresString.length > 0 ? featuresString : 'None';
  }

  public createFeaturesChipGroup(features: Features): string[] {
    let featureChipGroup: string[] = [];

    if (features.bounded) {
      featureChipGroup = ['Bounded', ...featureChipGroup];
    }
    if (features.indexed) {
      featureChipGroup = ['Indexed', ...featureChipGroup];
    }
    if (features.persistent) {
      featureChipGroup = ['Persistent', ...featureChipGroup];
    }
    if (features.transactional) {
      featureChipGroup = ['Transactional', ...featureChipGroup];
    }
    if (features.secured) {
      featureChipGroup = ['Secured', ...featureChipGroup];
    }
    if (features.hasRemoteBackup) {
      featureChipGroup = ['Backups', ...featureChipGroup];
    }

    return featureChipGroup;
  }

  public formatContentToDisplay(content: any, contentType?: ContentType): string {
    if (!contentType || contentType == ContentType.JSON || contentType == ContentType.customType) {
      // Try parse and stringify
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (err) {
        /* empty */
      }
    }

    return content as string;
  }

  private appendFeature = (features: string, feature: string): string => {
    return features + (features.length > 0 ? ' / ' : '') + feature;
  };
}

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
