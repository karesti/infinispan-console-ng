import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  Tabs,
  TabsComponent,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/Entries/CacheEntries';
import { CacheConfiguration } from '@app/Caches/Configuration/CacheConfiguration';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { t_global_background_color_100, t_global_spacer_xs } from '@patternfly/react-tokens';
import { ExclamationCircleIcon, InfoCircleIcon, RedoIcon } from '@patternfly/react-icons';
import { QueryEntries } from '@app/Caches/Query/QueryEntries';
import { Link } from 'react-router-dom';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useTranslation } from 'react-i18next';
import { RebalancingCache } from '@app/Rebalancing/RebalancingCache';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { useNavigate } from 'react-router';
import { TracingEnabled } from '@app/Common/TracingEnabled';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';
import { PageHeader } from '@patternfly/react-component-groups';

const DetailCache = (props: { cacheName: string }) => {
  const cacheName = props.cacheName;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { connectedUser } = useConnectedUser();
  const { loading, error, cache, cacheManager, loadCache } = useCacheDetail();
  const [activeTabKey1, setActiveTabKey1] = useState<number | string>('');
  const [activeTabKey2, setActiveTabKey2] = useState<number | string>(10);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  useEffect(() => {
    if (activeTabKey1 != '' || !cache) {
      return;
    }

    if (
      cache.started &&
      cache.editable &&
      ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)
    ) {
      setActiveTabKey1(0);
    } else if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      setActiveTabKey1(1);
    } else {
      setActiveTabKey1(2);
    }
  }, [cache]);

  const buildEntriesTabContent = () => {
    if (cache.started && !ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
      return '';
    }

    if (!cache.queryable) {
      return <CacheEntries />;
    }

    return (
      <Tabs
        unmountOnExit
        isSubtab={true}
        activeKey={activeTabKey2}
        aria-label="Entries tab"
        component={TabsComponent.nav}
        style={theme === DARK ? {} : { backgroundColor: t_global_background_color_100.value }}
        onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}
      >
        <Tab
          eventKey={10}
          title={<TabTitleText>{t('caches.tabs.entries-manage')}</TabTitleText>}
          data-cy="manageEntriesTab"
        >
          <CacheEntries />
        </Tab>
        <Tab eventKey={11} data-cy="queriesTab" title={<TabTitleText>{t('caches.tabs.query-values')}</TabTitleText>}>
          <QueryEntries cacheName={cacheName} changeTab={() => setActiveTabKey1(2)} />
        </Tab>
      </Tabs>
    );
  };

  const entriesTabEnabled = (): boolean => {
    return cache.editable! && ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser);
  };

  const buildDetailContent = () => {
    if (error.length > 0) {
      return (
        <EmptyState
          variant={EmptyStateVariant.sm}
          titleText={`An error occurred while retrieving cache ${cacheName}`}
          headingLevel="h2"
          status="danger"
          icon={ExclamationCircleIcon}
        >
          <EmptyStateBody>{error}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Link
                to={{
                  pathname: '/',
                  search: location.search
                }}
              >
                <Button variant={ButtonVariant.secondary}>{t('common.actions.back')}</Button>
              </Link>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    if (loading || !cache) {
      return <Spinner size="xl" />;
    }

    if (activeTabKey1 == 0) {
      return buildEntriesTabContent();
    }

    if (activeTabKey1 == 1) {
      return (
        cache.configuration && (
          <CacheConfiguration
            cacheName={cache.name}
            editable={cache?.editable || true}
            config={cache.configuration.config}
          />
        )
      );
    }
    return <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2} />;

    return (
      <EmptyState variant={EmptyStateVariant.sm} titleText={`Empty ${cacheName}`} status="info" headingLevel="h2">
        <EmptyStateBody>{error}</EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Link
              to={{
                pathname: '/',
                search: location.search
              }}
            >
              <Button variant={ButtonVariant.secondary}>{t('caches.actions.back')}</Button>
            </Link>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  };

  const displayBackupsManagement = () => {
    return (
      cache &&
      cache?.features?.hasRemoteBackup &&
      ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)
    );
  };

  const displayIndexManage = () => {
    return cache && cache?.features?.indexed;
  };

  const buildBackupsManage = () => {
    if (!displayBackupsManagement()) return;

    return (
      <DropdownItem
        value={'backupsManage'}
        key="manageBackupsLink"
        data-cy="manageBackupsLink"
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/backups',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-backups')}
      </DropdownItem>
    );
  };

  const buildDisplayReindexing = () => {
    if (!cache?.indexing_in_progress) {
      return;
    }

    return (
      <React.Fragment>
        <ToolbarItem>
          <Flex data-cy="rebuildingIndex">
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <AlertIcon variant={AlertVariant.warning} />
            </FlexItem>
            <FlexItem>
              <Content component={ContentVariants.p}>{t('caches.rebuilding-index')}</Content>
            </FlexItem>
          </Flex>
        </ToolbarItem>
        <ToolbarItem variant="separator"></ToolbarItem>
      </React.Fragment>
    );
  };

  const buildTracing = () => {
    if (!cacheManager || !cacheManager.tracing_enabled || !cache || !cache.started) return;

    return (
      <DropdownItem
        value={'tracingManage'}
        key="manageTracingLink"
        data-cy="manageTracingLink"
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/tracing',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-tracing')}
      </DropdownItem>
    );
  };

  const buildIndexManage = () => {
    if (!displayIndexManage()) return;
    return (
      <DropdownItem
        value={'indexManage'}
        key="manageIndexesLink"
        data-cy="manageIndexesLink"
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/indexing',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-indexes')}
      </DropdownItem>
    );
  };

  const buildRefresh = () => {
    return (
      <React.Fragment>
        {(displayBackupsManagement() || displayIndexManage()) && <Divider component="li" />}
        <DropdownItem
          value={'refresh'}
          key="refreshAction"
          data-cy="refreshAction"
          onClick={() => loadCache(cacheName)}
          icon={<RedoIcon />}
        >
          {t('common.actions.refresh')}
        </DropdownItem>
      </React.Fragment>
    );
  };

  const buildFeaturesChip = () => {
    if (!cache || !cache.started) {
      return;
    }

    return (
      <Flex>
        {cache && cache.aliases && (
          <FlexItem>
            <LabelGroup categoryName={t('caches.info.aliases')}>
              {cache.aliases.map((feature) => (
                <Label isCompact key={feature}>
                  {feature}
                </Label>
              ))}
            </LabelGroup>
          </FlexItem>
        )}
        <FlexItem>
          <LabelGroup categoryName={t('caches.info.features')} numLabels={8}>
            <Label color={'blue'} isCompact key={cache.type} icon={<InfoCircleIcon />}>
              {cache.type}
            </Label>
            {cache.features &&
              displayUtils.createFeaturesChipGroup(cache.features).map((feature) => (
                <Label isCompact key={feature} icon={<InfoCircleIcon />}>
                  {feature}
                </Label>
              ))}
          </LabelGroup>
        </FlexItem>
      </Flex>
    );
  };

  const buildAliasesChips = () => {
    if (!cache?.aliases || cache?.aliases?.length == 0) return;

    return (
      <React.Fragment>
        <ToolbarItem>
          <LabelGroup categoryName={t('caches.info.aliases')} numLabels={8}>
            {cache.aliases.map((feature) => (
              <Label isCompact key={feature}>
                {feature}
              </Label>
            ))}
          </LabelGroup>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const buildShowMorePanel = () => {
    if (loading || error !== '' || !cache || !cache.started) {
      return;
    }

    return (
      <Toolbar id="cache-header-actions">
        <ToolbarContent>
          <ToolbarGroup>
            {cacheManager.tracing_enabled && (
              <React.Fragment>
                <ToolbarItem>
                  <TracingEnabled enabled={cache.tracing!} />
                </ToolbarItem>
                <ToolbarItem variant="separator"></ToolbarItem>
              </React.Fragment>
            )}
            {buildDisplayReindexing()}
            <RebalancingCache />
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    );
  };

  const displayCacheEntries = () => {
    if (!entriesTabEnabled()) {
      return;
    }

    return (
      <Tab
        data-cy="cacheEntriesTab"
        eventKey={0}
        title={
          cache.size
            ? t('caches.tabs.entries-size', {
                size: displayUtils.formatNumber(cache?.size)
              })
            : t('caches.tabs.entries')
        }
      />
    );
  };

  const displayConfiguration = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      // Only ADMIN can read the full configuration for security reasons
      return;
    }

    return <Tab data-cy="cacheConfigurationTab" eventKey={1} title={t('caches.tabs.configuration')} />;
  };

  const displayCacheStats = () => {
    if (!cache.stats) {
      return;
    }

    return (
      <Tab
        data-cy="cacheMetricsTab"
        eventKey={2}
        title={cache.stats?.enabled ? t('caches.tabs.metrics-enabled') : t('caches.tabs.metrics-disabled')}
      />
    );
  };

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignEnd' }}>
      <ToolbarItem>
        <Dropdown
          popperProps={{ position: 'right' }}
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              data-cy="detailCacheActions"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
            >
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="detailCacheDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            {buildTracing()}
            {buildIndexManage()}
            {buildBackupsManage()}
            {buildRefresh()}
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  const buildCacheHeader = () => {
    if (loading || !cache) {
      return <PageHeader title={cacheName} subtitle={t('common.loading')} />;
    }

    if (error != '') {
      return <PageHeader title={cacheName} subtitle={t('caches.info.error', { cacheName: cacheName })} />;
    }

    if (!cache.started) {
      // cache is not ok
      return (
        <PageHeader
          title={cache.name}
          subtitle={'cache detail'}
          actionMenu={displayActions}
          label={<InfinispanComponentStatus status={cache.health} name={cacheName} isLabel={true} />}
        />
      );
    }

    return <PageHeader title={cache.name} subtitle={''} actionMenu={displayActions} label={buildFeaturesChip()} />;
  };

  return (
    <React.Fragment>
      <DataContainerBreadcrumb currentPage={t('caches.info.breadcrumb', { cacheName: cacheName })} />
      {buildCacheHeader()}
      <PageSection>
        {buildShowMorePanel()}
        {cache && cache.started && (
          <Tabs
            isBox={false}
            activeKey={activeTabKey1}
            component={TabsComponent.nav}
            onSelect={(event, tabIndex) => {
              setActiveTabKey1(tabIndex);
            }}
          >
            {displayCacheEntries()}
            {displayConfiguration()}
            {displayCacheStats()}
          </Tabs>
        )}
        {buildDetailContent()}
      </PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
