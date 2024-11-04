import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  DividerVariant,
  Level,
  LevelItem,
  Spinner
} from '@patternfly/react-core';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ClearMetrics } from '@app/ClearMetrics/ClearMetrics';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { useSearchStats } from '@app/services/statsHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';

/**
 * Query stats for indexed caches only
 */
const QueryMetrics = (props: { cacheName: string }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { stats, loading, error, setLoading } = useSearchStats(props.cacheName);

  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);

  const closeClearMetricsModal = () => {
    setClearMetricsModalOpen(false);
    setLoading(true);
  };

  const buildCardContent = () => {
    if (loading && !stats) {
      return <Spinner size={'sm'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    return (
      <>
        {stats.query.map((queryStat, num) => (
          <React.Fragment key={'stat-fragment-' + num}>
            <Content component={ContentVariants.small} key={'name-' + num}>
              {' '}
              {queryStat.name} <Divider component={DividerVariant.hr} />
            </Content>
            <Content component={ContentVariants.dl} key={'stats-' + num}>
              <Content component={ContentVariants.dt} style={{ width: 250 }} key={'stats-count-label-' + num}>
                {t('caches.query.stat-count')}
              </Content>
              <Content component={ContentVariants.dd} key={'stats-count-value-' + num}>
                {queryStat.count}
              </Content>
              <Content component={ContentVariants.dt} style={{ width: 250 }} key={'stats-qverage-label-' + num}>
                {t('caches.query.stat-average')}
              </Content>
              <Content component={ContentVariants.dd} key={'stats-average-value-' + num}>
                {queryStat.average}
              </Content>
              <Content component={ContentVariants.dt} style={{ width: 250 }} key={'stats-max-label-' + num}>
                {t('caches.query.stat-max')}
              </Content>
              <Content component={ContentVariants.dd} key={'stats-max-value-' + num}>
                {queryStat.max}
              </Content>
              {displaySlowest(queryStat, num)}
            </Content>
          </React.Fragment>
        ))}
      </>
    );
  };

  const displaySlowest = (queryStat: QueryStat, num: number) => {
    if (!queryStat.slowest || queryStat.slowest == '') {
      return '';
    }
    return (
      <React.Fragment>
        <Content component={ContentVariants.dt} style={{ width: 250 }} key={'stats-slowest-label-' + num}>
          {t('caches.query.stat-slowest')}
        </Content>
        <Content component={ContentVariants.dd} key={'stats-slowest-value-' + num}>
          <code>{queryStat.slowest}</code>
        </Content>
      </React.Fragment>
    );
  };

  const buildClearStatsButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <LevelItem>
        <Button
          data-cy="clearQueryMetricsButton"
          variant={ButtonVariant.danger}
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.query.button-clear-query-stats')}
        </Button>
        <ClearMetrics
          name={props.cacheName}
          isModalOpen={isClearMetricsModalOpen}
          closeModal={closeClearMetricsModal}
          type={'query'}
        />
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'query-stats'}>
          <LevelItem>
            <PopoverHelp
              name="query-metrics"
              label={t('caches.query.query-metrics-title')}
              content={t('caches.query.query-metrics-tooltip')}
              text={t('caches.query.query-metrics-title')}
            />
          </LevelItem>
          {buildClearStatsButton()}
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export { QueryMetrics };
