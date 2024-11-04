import displayUtils from '@services/displayUtils';
import {
  CANCEL_STATUS,
  ERROR_STATUS,
  FAILED,
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

describe('Display Utils tests', () => {
  test('parseStateTransferStatus', () => {
    expect(displayUtils.parseStateTransferStatus(undefined)).toBe(ST_IDLE);
    expect(displayUtils.parseStateTransferStatus('OK')).toBe(ST_SEND_OK);
    expect(displayUtils.parseStateTransferStatus('IDLE')).toBe(ST_IDLE);
    expect(displayUtils.parseStateTransferStatus('CANCELED')).toBe(ST_SEND_CANCELED);
    expect(displayUtils.parseStateTransferStatus('ERROR')).toBe(ST_SEND_FAILED);
    expect(displayUtils.parseStateTransferStatus('SENDING')).toBe(ST_SENDING);
  });

  test('parseComponentStatus', () => {
    expect(displayUtils.parseComponentStatus(undefined)).toBe(UNKNOWN);
    expect(displayUtils.parseComponentStatus('OK')).toBe(OK_STATUS);
    expect(displayUtils.parseComponentStatus('RUNNING')).toBe(RUNNING_STATUS);
    expect(displayUtils.parseComponentStatus('INITIALIZING')).toBe(INIT_STATUS);
    expect(displayUtils.parseComponentStatus('CANCELLING')).toBe(CANCEL_STATUS);
    expect(displayUtils.parseComponentStatus('FAILED')).toBe(FAILED);
    expect(displayUtils.parseComponentStatus('ERROR')).toBe(ERROR_STATUS);
    expect(displayUtils.parseComponentStatus('STOPPING')).toBe(STOPPING_STATUS);
    expect(displayUtils.parseComponentStatus('TERMINATED')).toBe(TERMINATED_STATUS);
    expect(displayUtils.parseComponentStatus('INSTANTIATED')).toBe(INSTANTIATED_STATUS);
  });

  test('format number should cut 2 digits', () => {
    expect(displayUtils.formatNumber(undefined)).toBe('0');
    expect(displayUtils.formatNumber(12.9999)).toBe('13');
    expect(displayUtils.formatNumber(12.349876567)).toBe('12.35');
  });
});
