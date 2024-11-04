import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  Alert,
  AlertVariant,
  Bullseye,
  EmptyState,
  PageSection,
  PageSectionVariants,
  Spinner,
  Content,
  ContentVariants,
  Toolbar,
  ToolbarContent
} from '@patternfly/react-core';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { ConsoleServices } from '@services/ConsoleServices';
import { useTranslation } from 'react-i18next';
import { CreateCacheWizard } from '@app/Caches/Create/CreateCacheWizard';
import { CreateCacheProvider } from '@app/providers/CreateCacheProvider';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useDataContainer } from '@app/services/dataContainerHooks';
import { PageHeader } from '@patternfly/react-component-groups';

const CreateCache = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { cm, loading, error } = useDataContainer();
  const [localSite, setLocalSite] = useState('');
  const { connectedUser } = useConnectedUser();
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  useEffect(() => {
    if (cm) {
      if (cm.backups_enabled && cm.local_site) {
        setLocalSite(cm.local_site);
      }
    }
  }, [cm]);

  const displayError = () => {
    return (
      <PageSection>
        <TableErrorState error={error} />
      </PageSection>
    );
  };

  const displayLoading = () => {
    return (
      <PageSection>
        <Bullseye>
          <EmptyState titleText="Loading" icon={Spinner} headingLevel="h4" />
        </Bullseye>
      </PageSection>
    );
  };

  const create = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const id = create ? 'create' : 'setup';

  return (
    <CreateCacheProvider>
      {create && <DataContainerBreadcrumb currentPage={t('caches.create.breadcrumb')} />}
      <PageHeader
        title={
          localSite == ''
            ? t(`caches.${id}.page-title`)
            : t(`caches.${id}.page-title-with-backups`, { localsite: localSite })
        }
        subtitle={t(`caches.${id}.page-title-description`, { brandname: brandname })}
      />

      {loading && displayLoading()}
      {error != '' && displayError()}
      {cm && <CreateCacheWizard cacheManager={cm} create={create} />}
    </CreateCacheProvider>
  );
};
export { CreateCache };
