import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  Icon,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { CacheTableDisplay } from '@app/CacheManagers/CacheTableDisplay';
import { CounterTableDisplay } from '@app/CacheManagers/CounterTableDisplay';
import { TasksTableDisplay } from '@app/CacheManagers/TasksTableDisplay';
import { ProtobufSchemasDisplay } from '@app/ProtoSchema/ProtobufSchemasDisplay';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';

import { t_global_spacer_md } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useDataContainer } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { RebalancingCacheManager } from '@app/Rebalancing/RebalancingCacheManager';
import { ClusterIcon } from '@patternfly/react-icons';
import { TracingEnabled } from '@app/Common/TracingEnabled';
import { PageHeader } from '@patternfly/react-component-groups';

const CacheManagers = () => {
  const { connectedUser } = useConnectedUser();
  const { cm, loading, error } = useDataContainer();
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [cachesCount, setCachesCount] = useState<number>(0);
  const [countersCount, setCountersCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [protoSchemasCount, setProtoSchemasCount] = useState<number>(0);
  const [showCaches, setShowCaches] = useState(true);
  const [showCounters, setShowCounters] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showSerializationContext, setShowSerializationContext] = useState(false);
  const { t } = useTranslation();

  const handleTabClick = (index) => {
    setActiveTabKey(index);
    setShowCaches(index == '0');
    setShowCounters(index == '1');
    setShowTasks(index == '2');
    setShowSerializationContext(index == '3');
  };

  interface ContainerTab {
    key: string;
    name: string;
    count: number;
  }

  const buildTabs = () => {
    if (loading || error) {
      return '';
    }

    const tabs: ContainerTab[] = [
      { name: t('cache-managers.caches-tab'), count: cachesCount, key: '0' },
      {
        name: t('cache-managers.counters-tab'),
        count: countersCount,
        key: '1'
      }
    ];

    if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      tabs.push({
        name: t('cache-managers.tasks-tab'),
        count: tasksCount,
        key: '2'
      });
    }

    if (ConsoleServices.security().hasConsoleACL(ConsoleACL.BULK_READ, connectedUser)) {
      tabs.push({
        name: t('cache-managers.schemas-tab'),
        count: protoSchemasCount,
        key: '3'
      });
    }

    return (
      <Tabs
        data-cy="navigationTabs"
        onSelect={(_event, tab) => handleTabClick(tab)}
        style={{ marginTop: t_global_spacer_md.value }}
        activeKey={activeTabKey}
      >
        <>
          {tabs.map((tab) => (
            <Tab
              data-cy={'tab-' + tab.name}
              aria-label={'nav-item-' + tab.name}
              key={'nav-item-' + tab.key}
              eventKey={tab.key}
              title={<TabTitleText>{tab.count + ' ' + tab.name}</TabTitleText>}
            ></Tab>
          ))}
        </>
      </Tabs>
    );
  };

  const buildSelectedContent = () => {
    if (loading) {
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

    return (
      <React.Fragment>
        {cm && <CacheTableDisplay setCachesCount={setCachesCount} isVisible={showCaches} />}
        {cm && <CounterTableDisplay setCountersCount={setCountersCount} isVisible={showCounters} />}
        {cm && ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser) && (
          <TasksTableDisplay setTasksCount={setTasksCount} isVisible={showTasks} />
        )}
        {cm && (
          <ProtobufSchemasDisplay setProtoSchemasCount={setProtoSchemasCount} isVisible={showSerializationContext} />
        )}
      </React.Fragment>
    );
  };

  const buildHeader = () => {
    const title = t('cache-managers.title');
    if (!cm) {
      return <PageHeader title={title} subtitle={''} />;
    }

    return (
      <>
        <PageHeader ouiaId="cluster-manager-header" title={title} subtitle={''} />
        <PageSection>
          <Toolbar id="cluster-manager-sub-header">
            <ToolbarContent>
              {cm.local_site != null && cm.local_site !== '' && (
                <>
                  <ToolbarItem>
                    <Flex data-cy="localSite">
                      <FlexItem spacer={{ default: 'spacerXs' }}>
                        <Icon>
                          <ClusterIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>{cm.local_site}</FlexItem>
                    </Flex>
                  </ToolbarItem>
                  <ToolbarItem variant="separator"></ToolbarItem>
                </>
              )}
              <ToolbarItem>
                <InfinispanComponentStatus name="clusterManager" status={cm.cache_manager_status} />
              </ToolbarItem>
              {cm.tracing_enabled && (
                <React.Fragment>
                  <ToolbarItem variant="separator"></ToolbarItem>
                  <ToolbarItem>
                    <TracingEnabled enabled={cm.tracing_enabled} />
                  </ToolbarItem>
                </React.Fragment>
              )}
              <ToolbarItem variant="separator"></ToolbarItem>
              <ToolbarItem>
                <RebalancingCacheManager />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          {buildTabs()}
        </PageSection>
      </>
    );
  };

  return (
    <React.Fragment>
      {buildHeader()}
      <PageSection variant={PageSectionVariants.default}>{buildSelectedContent()}</PageSection>
    </React.Fragment>
  );
};

export { CacheManagers };
