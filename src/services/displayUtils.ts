import {
  chart_color_black_300,
  chart_color_black_500,
  chart_color_blue_200,
  chart_color_cyan_300,
  chart_color_gold_300,
  chart_color_purple_200,
  chart_global_label_Fill,
  global_danger_color_100,
  global_success_color_100,
  global_warning_color_100
} from '@patternfly/react-tokens';
import { AlertVariant } from '@patternfly/react-core';

/**
 * Utility class to manage display features
 *
 * @author Katia Aresti
 */
class DisplayUtils {
  /**
   * Get the status color
   * @param componentStatus
   * @param isIcon
   */
  public statusColor(componentStatus: string | undefined, isIcon: boolean) {
    let color;
    if (!componentStatus) {
      return chart_global_label_Fill.value;
    }

    if (!isIcon) {
      return chart_global_label_Fill.value;
    }

    switch (componentStatus) {
      case 'STOPPING':
        color = chart_global_label_Fill.value;
        break;
      case 'RUNNING':
        color = global_success_color_100.value;
        break;
      case 'INSTANTIATED':
        color = chart_global_label_Fill.value;
        break;
      case 'INITIALIZING':
        color = global_warning_color_100.value;
        break;
      case 'FAILED':
        color = global_danger_color_100.value;
        break;
      case 'TERMINATED':
        color = chart_global_label_Fill.value;
        break;
      default:
        color = chart_global_label_Fill.value;
    }
    return color;
  }

  public statusAlterVariant(status: string): AlertVariant {
    let variant;
    switch (status) {
      case 'STOPPING':
        variant = AlertVariant.warning;
        break;
      case 'RUNNING':
        variant = AlertVariant.success;
        break;
      case 'INSTANTIATED':
        variant = AlertVariant.warning;
        break;
      case 'INITIALIZING':
        variant = AlertVariant.warning;
        break;
      case 'FAILED':
        variant = AlertVariant.danger;
        break;
      case 'TERMINATED':
        variant = AlertVariant.info;
        break;
      default:
        variant = AlertVariant.warning;
    }
    return variant;
  }

  /**
   * Get the health color
   * @param health, string value
   * @param isIcon, color depends on the icon as well
   */
  public healthColor(health: string | undefined, isIcon: boolean): string {
    if (!health) {
      return chart_global_label_Fill.value;
    }

    if (!isIcon) {
      return chart_global_label_Fill.value;
    }

    let color;
    switch (health) {
      case 'HEALTHY':
        color = global_success_color_100.value;
        break;
      case 'HEALTHY_REBALANCING':
        color = global_warning_color_100.value;
        break;
      case 'DEGRADED':
        color = global_danger_color_100.value;
        break;
      default:
        color = chart_global_label_Fill.value;
    }
    return color;
  }

  /**
   * Used to display a healh label instead of the backend value
   *
   * @param health
   */
  public healthLabel(health: string | undefined): string {
    if (health === undefined) {
      return '-';
    }

    let label;
    switch (health) {
      case 'HEALTHY':
        label = 'Healthy';
        break;
      case 'HEALTHY_REBALANCING':
        label = 'Rebalancing';
        break;
      case 'DEGRADED':
        label = 'Degraded';
        break;
      default:
        label = 'Unknown';
    }
    return label;
  }

  public healthAlertVariant(health: string | undefined): AlertVariant {
    if (!health) {
      return AlertVariant.warning;
    }

    let variant;

    switch (health) {
      case 'HEALTHY':
        variant = AlertVariant.success;
        break;
      case 'HEALTHY_REBALANCING':
        variant = AlertVariant.warning;
        break;
      case 'DEGRADED':
        variant = AlertVariant.danger;
        break;
      default:
        variant = AlertVariant.warning;
    }
    return variant;
  }

  public cacheTypeColor(cacheType: string): string {
    let color;
    switch (cacheType) {
      case 'Distributed':
        color = chart_color_blue_200.value;
        break;
      case 'Replicated':
        color = chart_color_purple_200.value;
        break;
      case 'Local':
        color = chart_color_cyan_300.value;
        break;
      case 'Invalidated':
        color = chart_color_gold_300.value;
        break;
      case 'Scattered':
        color = chart_color_black_300.value;
        break;
      default:
        color = chart_color_black_500.value;
    }
    return color;
  }

  public counterTypeColor(counterType: string): string {
    let color;
    switch (counterType) {
      case 'Strong':
        color = chart_color_blue_200.value;
        break;
      case 'Weak':
        color = chart_color_cyan_300.value;
        break;
      default:
        color = chart_color_black_500.value;
    }
    return color;
  }

  public taskTypeColor(counterType: string): string {
    let color;
    switch (counterType) {
      case 'AdminServerTask':
        color = chart_color_blue_200.value;
        break;
      default:
        color = chart_color_gold_300.value;
    }
    return color;
  }

  public capitalize(value: string | undefined): string {
    if (value === undefined) return '';

    return value.charAt(0).toUpperCase() + value.slice(1).toLocaleLowerCase();
  }

  public formatNumber(digit: number | undefined): string {
    if (!digit) return '0';

    return digit.toLocaleString('en', { maximumFractionDigits: 2 });
  }
}

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
