import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  PageSectionVariants,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { ArrowIcon, CubesIcon, RedoIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import displayUtils from '@services/displayUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchGlobalStats } from '@app/services/statsHook';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import ClusterDistributionChart from '@app/GlobalStats/ClusterDistributionChart';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { ClearMetrics } from '@app/ClearMetrics/ClearMetrics';
import { useConnectedUser } from '@app/services/userManagementHook';
import { MultiContentCard, PageHeader } from '@patternfly/react-component-groups';

const GlobalStats = () => {
  const { t } = useTranslation();
  const { stats, error, loading, reload } = useFetchGlobalStats();
  const { connectedUser } = useConnectedUser();
  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const allOps = () => {
    return stats.hits + stats.misses + stats.remove_hits + stats.remove_misses + stats.stores + stats.evictions;
  };

  const clusterStatsCard = () => {
    return (
      <Card isFullHeight isPlain>
        <CardTitle>
          <PopoverHelp
            name="cluster-wide-stats"
            label={t('global-stats.cluster-wide-stats')}
            content={t('global-stats.cluster-wide-stats-tooltip')}
            text={t('global-stats.cluster-wide-stats')}
          />
        </CardTitle>
        <CardBody>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.number_of_entries)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.no-of-entries')}</Content>
            <Content component={ContentVariants.dt}>
              {displayUtils.formatNumber(stats.current_number_of_entries_in_memory)}
            </Content>
            <Content component={ContentVariants.dd}>{t('global-stats.current-entry-in-memory')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.total_number_of_entries)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.total-no-entries')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.data_memory_used)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.data-memory-used')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.off_heap_memory_used)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.off-heap-memory-used')}</Content>
          </Content>
        </CardBody>
        <CardFooter>
          <Link to={{ pathname: '/', search: location.search }}>
            <Button data-cy="viewCachesLink" variant={ButtonVariant.link} icon={<ArrowIcon />}>
              {t('global-stats.view-caches-link')}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  const displayAccessStats = (name: string, value: number, label: string, tooltip: string) => {
    return (
      <React.Fragment>
        <Content component={ContentVariants.dt} data-cy={label.replace(/\s/g, '') + 'Val'}>
          {displayUtils.formatNumber(value)}
        </Content>
        <Content component={ContentVariants.dd}>
          <PopoverHelp name={name} label={label} content={tooltip} text={label} />
        </Content>
      </React.Fragment>
    );
  };

  const buildClearStatsItem = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <React.Fragment>
        <Divider component="li" />
        <DropdownItem
          value={0}
          key="clearAccessMetricsButton"
          data-cy="clearAccessMetricsButton"
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.cache-metrics.button-clear-access-stats')}
        </DropdownItem>
      </React.Fragment>
    );
  };

  const dataAccessCard = () => {
    return (
      <Card>
        <CardTitle>{t('global-stats.data-access-stats')}</CardTitle>
        <CardBody>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>{displayUtils.formatBigNumber(allOps())}</Content>
            <Content component={ContentVariants.dd}>
              <Content component="h5">{t('caches.cache-metrics.data-total')}</Content>
            </Content>
          </Content>

          <Divider component="div" style={{ padding: '10px 0' }} />

          <Content component={ContentVariants.dl}>
            {displayAccessStats(
              'hits',
              stats.hits,
              t('global-stats.data-access-hits'),
              t('global-stats.data-access-hits-info')
            )}
            {displayAccessStats(
              'misses',
              stats.misses,
              t('global-stats.data-access-misses'),
              t('global-stats.data-access-misses-info')
            )}
            {displayAccessStats(
              'stores',
              stats.stores,
              t('global-stats.data-access-stores'),
              t('global-stats.data-access-stores-info')
            )}
            {displayAccessStats(
              'remove_hits',
              stats.remove_hits,
              t('global-stats.data-access-remove-hits'),
              t('global-stats.data-access-remove-hits-info')
            )}
            {displayAccessStats(
              'remove_misses',
              stats.remove_misses,
              t('global-stats.data-access-remove-misses'),
              t('global-stats.data-access-remove-misses-info')
            )}
            {displayAccessStats(
              'evictions',
              stats.evictions,
              t('global-stats.data-access-evictions'),
              t('global-stats.data-access-evictions-info')
            )}
          </Content>
        </CardBody>
      </Card>
    );
  };

  const operationPerformanceCard = () => {
    return (
      <Card isFullHeight isPlain>
        <CardTitle>
          <PopoverHelp
            name={'operation-performance-values'}
            label={t('global-stats.operation-performance-values')}
            content={t('global-stats.operation-performance-values-tooltip')}
            text={t('global-stats.operation-performance-values')}
          />
        </CardTitle>
        <CardBody>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.average_read_time)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.average-reads')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.average_remove_time)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.average-writes')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.average_write_time)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.average-removes')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.read_write_ratio)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.average-read-write-ratio')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.hit_ratio)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.average-hits-ratio')}</Content>
          </Content>
        </CardBody>
      </Card>
    );
  };

  const cacheManagerLifecycleCard = () => {
    return (
      <Card isFullHeight isPlain>
        <CardTitle>
          <Level>
            <LevelItem>
              <PopoverHelp
                name={'cache-manager-lifecycle-values'}
                label={t('global-stats.cache-manager-lifecycle')}
                content={t('global-stats.cache-manager-lifecycle-tooltip')}
                text={t('global-stats.cache-manager-lifecycle')}
              />
            </LevelItem>
            <LevelItem>
              <Link to={{ pathname: '/cluster-membership', search: location.search }}>
                <Button data-cy="viewClustersLink" variant={ButtonVariant.link} icon={<ArrowIcon />}>
                  {t('global-stats.view-cluster-membership-link')}
                </Button>
              </Link>
            </LevelItem>
          </Level>
        </CardTitle>
        <CardBody>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt} data-cy="cacheManagerStartTime">
              {displayUtils.formatNumber(stats.time_since_start)}
            </Content>
            <Content component={ContentVariants.dd}>{t('global-stats.cache-manager-start-time')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.time_since_reset)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.cache-manager-reset-time')}</Content>
          </Content>
        </CardBody>
      </Card>
    );
  };

  const buildStats = () => {
    if (loading && !error) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    if (!loading && !error && !stats.statistics_enabled) {
      return (
        <Card>
          <CardBody>
            <EmptyState
              variant={EmptyStateVariant.full}
              titleText={<>{t('global-stats.global-stats-disabled')}</>}
              icon={CubesIcon}
              headingLevel="h5"
            >
              <EmptyStateBody>{t('global-stats.global-stats-disabled-help')}</EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <Grid hasGutter={true}>
        <GridItem span={12}>
          <MultiContentCard
            withDividers
            cards={[clusterStatsCard(), operationPerformanceCard(), cacheManagerLifecycleCard()]}
          />
        </GridItem>
        <GridItem span={8}>
          <ClusterDistributionChart />
        </GridItem>
        <GridItem span={4}>{dataAccessCard()}</GridItem>
      </Grid>
    );
  };

  const descriptionText = () => {
    if (stats.statistics_enabled) {
      return t('global-stats.global-stats-enable-msg');
    } else {
      return t('global-stats.global-stats-disable-msg');
    }
  };

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignEnd' }}>
      <ToolbarItem>
        <Dropdown
          isOpen={isOpen}
          popperProps={{ position: 'right' }}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              data-cy="globalStatsActions"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
            >
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="globalAccessDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            <DropdownItem value={0} key="refreshAction" data-cy="refreshAction" onClick={reload} icon={<RedoIcon />}>
              {t('common.actions.refresh')}
            </DropdownItem>
            {buildClearStatsItem()}
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <PageHeader title={t('global-stats.title')} subtitle={descriptionText()} actionMenu={displayActions} />
      <PageSection>{buildStats()}</PageSection>
      <ClearMetrics
        name={'cm'}
        isModalOpen={isClearMetricsModalOpen}
        closeModal={() => {
          reload();
          setClearMetricsModalOpen(false);
        }}
        type={'global-stats'}
      />
    </React.Fragment>
  );
};

export { GlobalStats };
