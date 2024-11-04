import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const TableErrorState = (props: { error: string; detail?: string }) => {
  const { t } = useTranslation();
  const displayErrorBody = () => {
    if (props.detail) {
      return props.detail as string;
    } else {
      return t('common.loading-error-message');
    }
  };

  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.full} status={'danger'} titleText={<>{props.error}</>} headingLevel="h2">
        <EmptyStateBody>{displayErrorBody()}</EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
export { TableErrorState };
