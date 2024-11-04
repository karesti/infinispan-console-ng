import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant, Spinner } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const TableEmptyState = (props: { loading: boolean; error: string; empty: string | React.ReactNode }) => {
  const { t } = useTranslation();

  if (props.loading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (props.error != '') {
    return (
      <Bullseye>
        <EmptyState
          variant={EmptyStateVariant.sm}
          headingLevel="h2"
          titleText="There was an error retrieving the data"
          status={'danger'}
        >
          <EmptyStateBody>{props.error}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <Bullseye data-cy="emptyStateTable">
      <EmptyState
        variant={EmptyStateVariant.sm}
        icon={SearchIcon}
        headingLevel="h2"
        titleText={<>{props.empty}</>}
      ></EmptyState>
    </Bullseye>
  );
};

export { TableEmptyState };
