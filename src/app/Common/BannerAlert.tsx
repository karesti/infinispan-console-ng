import React from 'react';
import { Banner, Flex, FlexItem } from '@patternfly/react-core';
import { useBanner } from '@app/utils/useApiAlert';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const BannerAlert = () => {
  const { banner } = useBanner();

  if (!banner || banner.length == 0) {
    return <span data-testid={'NoBanner'} />;
  }

  return (
    <Banner screenReaderText="Danger banner" status="danger">
      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <ExclamationCircleIcon />
        </FlexItem>
        <FlexItem>{banner}</FlexItem>
      </Flex>
    </Banner>
  );
};
export { BannerAlert };
