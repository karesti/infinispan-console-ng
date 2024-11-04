import * as React from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter, PageSection } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const navigate = useNavigate();

    function handleClick() {
      navigate('/' + location.search);
    }

    return <Button onClick={handleClick}>{t('not-found-page.button')}</Button>;
  }

  return (
    <PageSection>
      <EmptyState variant="full" titleText={t('not-found-page.title')} icon={ExclamationTriangleIcon} headingLevel="h1">
        <EmptyStateBody>{t('not-found-page.description')}</EmptyStateBody>
        <EmptyStateFooter>
          <GoHomeBtn />
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export { NotFound };
