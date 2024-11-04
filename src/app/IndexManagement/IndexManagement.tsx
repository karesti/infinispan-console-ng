import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import { t_global_spacer_md } from '@patternfly/react-tokens';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { TableErrorState } from '@app/Common/TableErrorState';
import { PurgeIndex } from '@app/IndexManagement/PurgeIndex';
import { Reindex } from '@app/IndexManagement/Reindex';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useSearchStats } from '@app/services/statsHook';
import { DatabaseIcon } from '@patternfly/react-icons';
import { UpdateSchema } from '@app/IndexManagement/UpdateSchema';
import { useIndexMetamodel } from '@app/services/searchHook';
import { ViewMetamodel } from '@app/IndexManagement/ViewMetamodel';
import { PageHeader } from '@patternfly/react-component-groups';

const IndexManagement = () => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const cacheName = useParams()['cacheName'] as string;
  const { stats, loading, error, setLoading } = useSearchStats(cacheName);
  const { indexMetamodel, loadingIndexMetamodel, errorIndexMetamodel } = useIndexMetamodel(cacheName);
  const [purgeModalOpen, setPurgeModalOpen] = useState<boolean>(false);
  const [reindexModalOpen, setReindexModalOpen] = useState<boolean>(false);
  const [updateSchemaModalOpen, setUpdateSchemaModalOpen] = useState<boolean>(false);
  const [indexMetamodelName, setIndexMetamodelName] = useState<string>('');

  const closePurgeModal = () => {
    setPurgeModalOpen(false);
    setLoading(true);
  };

  const closeReindexModal = () => {
    setReindexModalOpen(false);
    setLoading(true);
  };

  const closeUpdateSchemaModal = () => {
    setUpdateSchemaModalOpen(false);
    setLoading(true);
  };

  const buildUpdateSchemaAction = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    if (stats?.reindexing) {
      return <Spinner size={'md'} />;
    }
    return (
      <ToolbarItem>
        <Button
          data-cy="updateSchemaIndexButton"
          variant={ButtonVariant.primary}
          onClick={() => setUpdateSchemaModalOpen(true)}
        >
          {t('caches.index.button-update-schema')}
        </Button>
      </ToolbarItem>
    );
  };

  const buildReindexAction = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    if (stats?.reindexing) {
      return <Spinner size={'md'} />;
    }
    return (
      <ToolbarItem>
        <Button
          data-cy="rebuildIndexButton"
          variant={ButtonVariant.secondary}
          onClick={() => setReindexModalOpen(true)}
        >
          {t('caches.index.button-rebuild')}
        </Button>
      </ToolbarItem>
    );
  };

  const buildPurgeIndexButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    return (
      <ToolbarItem>
        <Button
          data-cy="clearIndexButton"
          variant={ButtonVariant.secondary}
          isDanger
          disabled={!stats?.reindexing}
          onClick={() => setPurgeModalOpen(true)}
        >
          {t('caches.index.button-clear')}
        </Button>
      </ToolbarItem>
    );
  };

  const buildIndexPageContent = () => {
    if (loading) {
      return <Spinner size={'lg'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    if (stats && stats.index.length > 0) {
      return (
        <Grid hasGutter>
          {stats.index.map((indexData, num) => (
            <GridItem span={6} key={'grid-item-index-' + num}>
              <Content component={ContentVariants.dl} key={'index-className-' + num}>
                <Content component={ContentVariants.dt}>{t('caches.index.class-name')}</Content>
                <Content component={ContentVariants.dd} key={'classNameValue'}>
                  <Content component={'a'} onClick={() => setIndexMetamodelName(indexData.name)}>
                    {indexData.name}
                  </Content>
                </Content>
                <Content component={ContentVariants.dt} key={'entriesCount'}>
                  {t('caches.index.entities-number')}
                </Content>
                <Content component={ContentVariants.dd} key={'entriesCountValue'}>
                  <Content>{indexData.count}</Content>
                </Content>
                <Content component={ContentVariants.dt} key={'sizes'}>
                  {t('caches.index.size')}
                </Content>
                <Content component={ContentVariants.dd} key={'sizesValue'}>
                  <Content>{indexData.size}</Content>
                </Content>
              </Content>
            </GridItem>
          ))}
        </Grid>
      );
    }

    return (
      <EmptyState variant={EmptyStateVariant.sm} icon={DatabaseIcon} status={'info'}>
        <EmptyStateBody>{t('caches.index.empty')}</EmptyStateBody>
      </EmptyState>
    );
  };

  return (
    <React.Fragment>
      <DataContainerBreadcrumb currentPage={t('caches.index.title')} cacheName={cacheName} />
      <PageHeader title={t('caches.index.title')} subtitle={t('caches.index.description')} />
      <PageSection>
        {buildIndexPageContent()}
        <Toolbar id="indexing-page-toolbar">
          <ToolbarContent style={{ paddingLeft: 0, paddingTop: t_global_spacer_md.value }}>
            {buildUpdateSchemaAction()}
            {buildReindexAction()}
            {buildPurgeIndexButton()}
            <ToolbarItem>
              <Link
                to={{
                  pathname: '/cache/' + encodeURIComponent(cacheName),
                  search: location.search
                }}
              >
                <Button variant={ButtonVariant.link} data-cy="backButton">
                  {t('common.actions.back')}
                </Button>
              </Link>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PurgeIndex cacheName={cacheName} isModalOpen={purgeModalOpen} closeModal={closePurgeModal} />
      <Reindex cacheName={cacheName} isModalOpen={reindexModalOpen} closeModal={closeReindexModal} />
      <UpdateSchema cacheName={cacheName} isModalOpen={updateSchemaModalOpen} closeModal={closeUpdateSchemaModal} />
      <ViewMetamodel
        metamodelName={indexMetamodelName}
        metamodels={indexMetamodel}
        loading={loadingIndexMetamodel}
        error={errorIndexMetamodel}
        isModalOpen={indexMetamodelName.length > 0}
        closeModal={() => setIndexMetamodelName('')}
      />
    </React.Fragment>
  );
};
export { IndexManagement };
