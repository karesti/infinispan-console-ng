import React from 'react';
import { Content, ContentVariants, Flex, FlexItem, Icon, Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon
} from '@patternfly/react-icons';
import { UNKNOWN } from '@services/infinispanRefData';

const InfinispanComponentStatus = (props: { status?: ComponentStatusType; name?: string; isLabel?: boolean }) => {
  const status = props.status ? props.status : UNKNOWN;

  const componentStatusIcon = (status: string): React.ReactElement => {
    let variant;
    switch (status) {
      case 'success':
        variant = <CheckCircleIcon />;
        break;
      case 'warning':
        variant = <ExclamationTriangleIcon />;
        break;
      case 'danger':
        variant = <ExclamationCircleIcon />;
        break;
      case 'info':
      case 'custom':
      default:
        variant = <InfoCircleIcon />;
    }
    return variant;
  };

  if (props.isLabel) {
    return (
      <Label
        data-cy={props.name ? `labelStatusInfo-${props.name}` : 'labelStatusInfo'}
        status={status.status}
        variant="outline"
      >
        {status.name}
      </Label>
    );
  }
  return (
    <Flex data-cy={props.name ? `statusInfo-${props.name}` : 'statusInfo'}>
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <Icon status={status.status}>{componentStatusIcon(status.status)}</Icon>
      </FlexItem>
      <FlexItem>
        <Content component={ContentVariants.p}>{status.name}</Content>
      </FlexItem>
    </Flex>
  );
};
export { InfinispanComponentStatus };
