import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Badge,
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  PageSection,
  Spinner,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import { t_global_spacer_xs } from '@patternfly/react-tokens';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { StateTransfer } from '@app/XSite/StateTransfer';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';
import { DatabaseIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ST_IDLE, ST_SEND_CANCELED, ST_SEND_FAILED, ST_SEND_OK, ST_SENDING } from '@services/infinispanRefData';
import { TableErrorState } from '@app/Common/TableErrorState';
import { PageHeader } from '@patternfly/react-component-groups';

interface StateTransferModalState {
  site: string;
  open: boolean;
  action: 'start' | 'cancel' | '';
}

const XSiteCache = (props) => {
  const { t } = useTranslation();
  const crossSiteReplicationService = ConsoleServices.xsite();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = useParams()['cacheName'] as string;
  const { connectedUser } = useConnectedUser();
  const [backups, setBackups] = useState<XSite[]>([]);
  const [stateTransferStatus, setStateTransferStatus] = useState(new Map<string, ComponentStatusType>());
  const [backupsStatus, setBackupsStatus] = useState(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [stateTransferModal, setStateTransferModal] = useState<StateTransferModalState>({
    site: '',
    open: false,
    action: ''
  });

  useEffect(() => {
    if (loading) {
      crossSiteReplicationService
        .backupsForCache(cacheName)
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setBackups(eitherResponse.value);
            eitherResponse.value.map((xsite) => {
              const latestBackups = new Map();
              crossSiteReplicationService.backupsForSite(cacheName, xsite.name).then((eitherResponse) => {
                if (eitherResponse.isRight()) {
                  latestBackups.set(xsite.name, eitherResponse.value);
                  setBackupsStatus(latestBackups);
                } else {
                  addAlert(eitherResponse.value);
                }
              });
            });
          } else {
            setError(eitherResponse.value.message);
            addAlert(eitherResponse.value);
          }
        })
        .then(() => {
          // Third get state transfer status
          crossSiteReplicationService
            .stateTransferStatus(cacheName)
            .then((eitherResponse) => {
              const latestStStatus = new Map();
              if (eitherResponse.isRight()) {
                eitherResponse.value.map((stStatus) => latestStStatus.set(stStatus.site, stStatus.status));
                setStateTransferStatus(latestStStatus);
              } else {
                addAlert(eitherResponse.value);
              }
            })
            .finally(() => setLoading(false));
        });
    }
  }, [loading]);

  const columns = [
    { key: 'site', title: t('caches.backups.column-site') },
    {
      key: 'status',
      title: t('caches.backups.column-status')
    },
    {
      key: 'transfer',
      title: t('caches.backups.column-transfer')
    },
    {
      key: 'action',
      title: t('caches.backups.column-action')
    }
  ];

  const bringOnlineTakeOffLine = (site: string, status: string) => {
    if (status == 'online') {
      crossSiteReplicationService
        .takeOffline(cacheName, site)
        .then((result) => {
          addAlert(result);
        })
        .finally(() => setLoading(true));
    }
    if (status == 'offline') {
      crossSiteReplicationService
        .bringOnline(cacheName, site)
        .then((result) => {
          addAlert(result);
        })
        .finally(() => setLoading(true));
    }
  };

  const clearStateTransfer = (site: string) => {
    crossSiteReplicationService
      .clearStateTransferState(cacheName, site)
      .then((result) => {
        addAlert(result);
      })
      .finally(() => setLoading(true));
  };

  const buildStatus = (site: string, status: string) => {
    if (status == 'mixed') {
      return (
        <Toolbar key={'mixed-toolbar-' + site}>
          <ToolbarContent>
            <ToolbarItem>
              <Badge>
                <InfoCircleIcon
                  style={{
                    marginRight: t_global_spacer_xs.value,
                    marginTop: t_global_spacer_xs.value
                  }}
                />
                {t('caches.backups.mixed')}
              </Badge>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.link} onClick={() => bringOnlineTakeOffLine(site, 'offline')}>
                {t('caches.backups.bring-all-online')}
              </Button>
            </ToolbarItem>
            <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.link} onClick={() => bringOnlineTakeOffLine(site, 'online')}>
                {t('caches.backups.take-all-offline')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      );
    }

    return (
      <Switch
        id={site + '-switch'}
        hasCheckIcon
        label={status == 'online' ? t('caches.backups.take-offline-action') : t('caches.backups.bring-online-action')}
        isChecked={status == 'online'}
        onChange={() => bringOnlineTakeOffLine(site, status)}
      />
    );
  };

  const buildStateTransferStatus = (site: string) => {
    const stStatus = stateTransferStatus.get(site);
    if (!stStatus || stStatus == ST_IDLE) {
      return '';
    }
    return <InfinispanComponentStatus status={stateTransferStatus.get(site)} />;
  };

  const buildStateTransferButton = (backup: XSite) => {
    const maybeSTStatus = stateTransferStatus.get(backup.name);
    const stStatus = maybeSTStatus != undefined ? maybeSTStatus : ST_IDLE;

    if (stStatus == ST_SENDING) {
      return (
        <Button
          data-cy={backup.name + '-cancelStateTransferButton'}
          variant={ButtonVariant.danger}
          onClick={() =>
            setStateTransferModal({
              site: backup.name,
              open: true,
              action: 'cancel'
            })
          }
        >
          {t('common.actions.cancel')}
        </Button>
      );
    }

    if (stStatus == ST_SEND_OK || stStatus == ST_SEND_FAILED || stStatus == ST_SEND_CANCELED) {
      return (
        <Button
          data-cy={backup.name + '-clearStateButton'}
          variant={ButtonVariant.tertiary}
          onClick={() => clearStateTransfer(backup.name)}
        >
          {t('caches.backups.clear-state-action')}
        </Button>
      );
    }

    return (
      <Button
        data-cy={backup.name + '-startTransfer'}
        variant={ButtonVariant.secondary}
        onClick={() =>
          setStateTransferModal({
            site: backup.name,
            open: true,
            action: 'start'
          })
        }
      >
        {t('caches.backups.start-transfer-action')}
      </Button>
    );
  };

  const stateTransfer = (doAction: true) => {
    if (doAction) {
      if (stateTransferModal.action == 'start') {
        crossSiteReplicationService
          .startStateTransfer(cacheName, stateTransferModal.site)
          .then((result) => {
            addAlert(result);
          })
          .finally(() => setLoading(true));
      } else if (stateTransferModal.action == 'cancel') {
        crossSiteReplicationService
          .cancelStateTransfer(cacheName, stateTransferModal.site)
          .then((result) => {
            addAlert(result);
          })
          .finally(() => setLoading(true));
      } else {
        setLoading(true);
      }
    }
    setStateTransferModal({ site: '', open: false, action: '' });
  };

  const buildRows = () => {
    if (backups.length == 0) {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={4}>
              <Bullseye>
                <EmptyState
                  variant={EmptyStateVariant.sm}
                  headingLevel="h2"
                  titleText={t('caches.backups.no-backups')}
                  icon={DatabaseIcon}
                >
                  <EmptyStateBody>{t('caches.backups.no-backups-body')}</EmptyStateBody>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        </Tbody>
      );
    }

    return (
      <Tbody>
        {backups.map((backup) => {
          return (
            <Tr key={backup.name}>
              <Td dataLabel={columns[0].title}>{backup.name}</Td>
              <Td dataLabel={columns[1].title}>{buildStatus(backup.name, backup.status)}</Td>
              <Td dataLabel={columns[2].title}>{buildStateTransferStatus(backup.name)}</Td>
              <Td dataLabel={columns[3].title}>{buildStateTransferButton(backup)}</Td>
            </Tr>
          );
        })}
      </Tbody>
    );
  };

  const buildBody = () => {
    if (loading) {
      return <Spinner size="lg" />;
    }

    if (error) {
      return <TableErrorState error={error} />;
    }

    return (
      <Table aria-label="XSite Table" variant={TableVariant.compact}>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key} style={{ width: '15%' }}>
                {column.title}
              </Th>
            ))}
          </Tr>
        </Thead>
        {buildRows()}
      </Table>
    );
  };
  return (
    <React.Fragment>
      <DataContainerBreadcrumb currentPage={t('caches.backups.title')} cacheName={cacheName} />
      <PageHeader title={t('caches.backups.title')} subtitle={''} />
      <PageSection>
        <Card>
          <CardBody>{buildBody()}</CardBody>
          <CardFooter>
            <Content key={'button-back'}>
              <Link
                to={{
                  pathname: '/cache/' + encodeURIComponent(cacheName),
                  search: location.search
                }}
              >
                <Button variant={ButtonVariant.secondary} data-cy="backButton">
                  {t('common.actions.back')}
                </Button>
              </Link>
            </Content>
          </CardFooter>
        </Card>
      </PageSection>
      <StateTransfer
        cacheName={cacheName}
        action={stateTransferModal.action}
        siteName={stateTransferModal.site}
        isModalOpen={stateTransferModal.open}
        closeModal={stateTransfer}
      />
    </React.Fragment>
  );
};
export { XSiteCache };
