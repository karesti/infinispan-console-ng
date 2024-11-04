import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Icon,
  Label,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Pagination,
  Popover,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { CubesIcon, InfoCircleIcon, RedoIcon, SearchIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useFetchConnectedClients } from '@app/services/serverHook';
import { formatAge } from '@app/utils/formatAge';
import { onSearch } from '@app/utils/searchFilter';
import { PageHeader } from '@patternfly/react-component-groups';

const ConnectedClients = () => {
  const { t } = useTranslation();
  const { connectedClients, error, loading, setLoading } = useFetchConnectedClients();
  const [filteredConnections, setFilteredConnections] = useState<ConnectedClients[]>([]);
  const [rows, setRows] = useState<ConnectedClients[]>([]);
  const [connectionPagination, setConnectionPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (connectedClients) {
      setFilteredConnections(connectedClients);
    }
  }, [connectedClients, loading, error]);

  useEffect(() => {
    if (filteredConnections) {
      const initSlice = (connectionPagination.page - 1) * connectionPagination.perPage;
      const updateRows = filteredConnections.slice(initSlice, initSlice + connectionPagination.perPage);
      setRows(updateRows);
    }
  }, [filteredConnections, connectionPagination]);

  useEffect(() => {
    setFilteredConnections(connectedClients.filter((client) => onSearch(searchValue, client['server-node-name'])));
  }, [searchValue]);

  const columnNames = {
    nodeName: t('connected-clients.node-name'),
    principal: t('connected-clients.principal'),
    clientLibrary: t('connected-clients.client-library'),
    clientAddress: t('connected-clients.client-address'),
    protocolVersion: t('connected-clients.protocol-version'),
    moreInfo: t('connected-clients.more-info')
  };

  const onSetPage = (_event, pageNumber) => {
    setConnectionPagination({
      ...connectionPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setConnectionPagination({
      page: 1,
      perPage: perPage
    });
  };

  const emptyPage = (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={<>{t('connected-clients.no-connections')}</>}
      icon={CubesIcon}
      headingLevel="h4"
    >
      <EmptyStateBody>{t('connected-clients.no-connections-body')}</EmptyStateBody>
    </EmptyState>
  );

  const buildSearch = (
    <ToolbarGroup variant="filter-group">
      <ToolbarFilter categoryName={'Name'}>
        <SearchInput
          placeholder={`Find by server node`}
          value={searchValue}
          onChange={(_event, value) => setSearchValue(value)}
          onClear={() => setSearchValue('')}
        />
      </ToolbarFilter>
    </ToolbarGroup>
  );

  const pagination = (
    <Pagination
      itemCount={connectedClients.length}
      perPage={connectionPagination.perPage}
      page={connectionPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-connected-clients"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayPrincipal = (row) => {
    if (row.principal == null) {
      return <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>;
    }
    return row.principal;
  };

  const displayClientAddress = (row) => {
    if (row['remote-address'] == null) {
      return <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>;
    }

    return <Label color={'blue'}>{row['remote-address']}</Label>;
  };

  const displayClientVersion = (row) => {
    if (row['client-version'] == null) {
      return <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>;
    }

    return (
      <Label variant="outline" color={'blue'}>
        {row['client-version']}
      </Label>
    );
  };

  const displayClientLibrary = (row) => {
    if (row['client-library'] === null) {
      return <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>;
    }

    return row['client-library'];
  };

  const displayProtocolVersion = (row) => {
    if (row['protocol-version'] === null) {
      return <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>;
    }

    return row['protocol-version'];
  };

  const displayMoreInfo = (row: ConnectedClients) => {
    const description = (
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.id')}</DescriptionListTerm>
          <DescriptionListDescription>{row.id}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.created')}</DescriptionListTerm>
          <DescriptionListDescription>{formatAge(row.created)}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.ssl-application-protocol')}</DescriptionListTerm>
          <DescriptionListDescription>
            {row['ssl-application-protocol'] ? (
              row['ssl-application-protocol']
            ) : (
              <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.ssl-cipher-suite')}</DescriptionListTerm>
          <DescriptionListDescription>
            {row['ssl-cipher-suite'] ? (
              row['ssl-cipher-suite']
            ) : (
              <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.ssl-protocol')}</DescriptionListTerm>
          <DescriptionListDescription>
            {row['ssl-protocol'] ? (
              row['ssl-protocol']
            ) : (
              <Content component={ContentVariants.small}>{t('connected-clients.null')}</Content>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.client-version')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="blue">
              {row['client-version'] == null ? t('connected-clients.null') : row['client-version']}
            </Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('connected-clients.local-address')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="blue">
              {row['local-address'] == null ? t('connected-clients.null') : row['local-address']}
            </Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );

    return (
      <Popover
        position="left"
        headerContent={t('connected-clients.more-info')}
        headerComponent="h3"
        bodyContent={description}
      >
        <Button variant="plain" onClick={(e) => e.preventDefault()} icon={<InfoCircleIcon />} />
      </Popover>
    );
  };

  const buildConnectedClients = () => {
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

    if (connectedClients.length === 0) {
      return (
        <Card>
          <CardBody>{emptyPage}</CardBody>
        </Card>
      );
    }

    return (
      <>
        <Toolbar
          style={{ paddingBottom: '1rem' }}
          id="connections-table-toolbar"
          className={'connections-table-display'}
        >
          <ToolbarContent>
            {buildSearch}
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'connections-table'} aria-label={'connections-table-label'} variant={'compact'}>
          <Thead>
            <Tr>
              <Th style={{ width: '15%' }} colSpan={1}>
                {columnNames.nodeName}
              </Th>
              <Th style={{ width: '10%' }} colSpan={1}>
                {columnNames.principal}
              </Th>
              <Th colSpan={1}>{columnNames.clientLibrary}</Th>
              <Th style={{ width: '12%' }} colSpan={1}>
                {columnNames.clientAddress}
              </Th>
              <Th style={{ width: '12%' }} colSpan={1}>
                {columnNames.protocolVersion}
              </Th>
              <Th style={{ width: '5%' }} />
            </Tr>
          </Thead>
          <Tbody>
            {filteredConnections.length == 0 ? (
              <Tr>
                <Td colSpan={4}>
                  <Bullseye>
                    <EmptyState
                      variant={EmptyStateVariant.sm}
                      titleText={t('connected-clients.no-filtered-connections')}
                      icon={SearchIcon}
                      headingLevel="h2"
                    >
                      <EmptyStateBody>{t('connected-clients.no-filtered-connections-body')}</EmptyStateBody>
                    </EmptyState>
                  </Bullseye>
                </Td>
              </Tr>
            ) : (
              rows.map((row) => {
                return (
                  <Tr key={row.id}>
                    <Td dataLabel={columnNames.nodeName}>{row['server-node-name']}</Td>
                    <Td dataLabel={columnNames.principal}>{displayPrincipal(row)}</Td>
                    <Td dataLabel={columnNames.clientLibrary}>{displayClientLibrary(row)}</Td>
                    <Td dataLabel={columnNames.clientAddress}>{displayClientAddress(row)}</Td>
                    <Td dataLabel={columnNames.protocolVersion}>{displayProtocolVersion(row)}</Td>
                    <Td dataLabel={columnNames.moreInfo}>{displayMoreInfo(row)}</Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
        <Toolbar id="connections-table-toolbar" className={'connections-table-display'}>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </Toolbar>
      </>
    );
  };

  const displayActions = (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} data-cy="aclActions" onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
          {t('common.actions.actions')}
        </MenuToggle>
      )}
      ouiaId="conectedClientsDropdown"
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem
          value={0}
          key="refreshAction"
          data-cy="refreshAction"
          onClick={() => setLoading(true)}
          icon={<RedoIcon />}
        >
          {t('common.actions.refresh')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return (
    <React.Fragment>
      <PageHeader
        title={t('connected-clients.title')}
        subtitle={t('connected-clients.description')}
        actionMenu={displayActions}
      />
      <PageSection>{buildConnectedClients()}</PageSection>
    </React.Fragment>
  );
};

export { ConnectedClients };
