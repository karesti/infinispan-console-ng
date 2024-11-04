import * as React from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter, PageSection } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const NotAuthorized = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const navigate = useNavigate();

    function handleClick() {
      navigate('/' + location.search);
    }

    return <Button onClick={handleClick}>{t('not-auth-page.button')}</Button>;
  }

  return (
    <PageSection>
      <EmptyState variant="full" icon={ExclamationTriangleIcon} headingLevel="h1" titleText={t('not-auth-page.title')}>
        <EmptyStateBody>{t('not-auth-page.description')}</EmptyStateBody>
        <EmptyStateFooter>
          <GoHomeBtn />
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export { NotAuthorized };
