import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';
import { HEALTHY_HEALTH } from '@services/infinispanRefData';
import { render, screen } from '@testing-library/react';

describe('Infinispan Component Status Test', () => {
  test('by default both health label and icon are displayed', () => {
    render(<InfinispanComponentStatus status={HEALTHY_HEALTH} />);
    expect(screen.getByText('Healthy')).toBeDefined();
    expect(screen.queryByTestId('HealthIcon')).toBeDefined();
  });
});
