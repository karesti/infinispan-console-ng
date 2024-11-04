import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  Divider,
  Level,
  LevelItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { ClearMetrics } from '@app/ClearMetrics/ClearMetrics';
import { useConnectedUser } from '@app/services/userManagementHook';
import { MetricDescriptionListGroup } from '@app/Caches/Metrics/MetricDescriptionListGroup';

const DataAccess = (props: { cacheName: string; stats: CacheStats }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);

  const all =
    props.stats.hits +
    props.stats.retrievals +
    props.stats.remove_hits +
    props.stats.remove_misses +
    props.stats.stores +
    props.stats.misses +
    props.stats.evictions;

  const displayStats = (name: string, stat: number, label: string) => {
    return (
      <MetricDescriptionListGroup
        dataCy={'stat' + name + 'Val'}
        metricName={label}
        metricValue={stat}
        ariaLabel={label}
      />
    );
  };

  const buildClearStatsButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <LevelItem>
        <Button
          data-cy="clearAccessMetricsButton"
          variant={ButtonVariant.danger}
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.cache-metrics.button-clear-access-stats')}
        </Button>
        <ClearMetrics
          name={props.cacheName}
          isModalOpen={isClearMetricsModalOpen}
          closeModal={() => setClearMetricsModalOpen(false)}
          type={'cache-metrics'}
        />
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'access-stats'}>
          <LevelItem>{t('caches.cache-metrics.data-access-title')}</LevelItem>
          {buildClearStatsButton()}
        </Level>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isCompact>
          <MetricDescriptionListGroup
            metricName="caches.cache-metrics.data-total"
            metricValue={all}
            ariaLabel="view-cache-metrics-data-total"
          />
        </DescriptionList>
        <Divider component="li" role="none" />
        <DescriptionList isHorizontal isCompact>
          {displayStats('hits', props.stats.hits, 'caches.cache-metrics.data-access-hits')}
          {displayStats('misses', props.stats.misses, 'caches.cache-metrics.data-access-misses')}
          {displayStats('stores', props.stats.stores, 'caches.cache-metrics.data-access-stores')}
          {displayStats('retrievals', props.stats.retrievals, 'caches.cache-metrics.data-access-retrievals')}
          {displayStats('remove_hits', props.stats.remove_hits, 'caches.cache-metrics.data-access-remove-hits')}
          {displayStats('remove_misses', props.stats.remove_misses, 'caches.cache-metrics.data-access-remove-misses')}
          {displayStats('evictions', props.stats.evictions, 'caches.cache-metrics.data-access-evictions')}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export { DataAccess };
