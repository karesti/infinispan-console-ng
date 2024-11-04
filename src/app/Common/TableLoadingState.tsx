import { Bullseye, EmptyState, EmptyStateVariant, Spinner } from '@patternfly/react-core';
import * as React from 'react';

const TableLoadingState = (props: { message: string }) => {
  return (
    <Bullseye>
      <EmptyState
        variant={EmptyStateVariant.sm}
        titleText={props.message}
        icon={Spinner}
        headingLevel="h4"
      ></EmptyState>
    </Bullseye>
  );
};
export { TableLoadingState };
