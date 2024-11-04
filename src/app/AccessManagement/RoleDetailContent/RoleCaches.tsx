import { useTranslation } from 'react-i18next';
import {
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useCachesForRole } from '@app/services/rolesHook';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { KeyIcon, SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

const RoleCaches = (props: { name: string }) => {
  const { t } = useTranslation();
  const { secured, nonSecured, loading, error } = useCachesForRole(props.name);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 5
  });
  const [searchValue, setSearchValue] = useState<string>('');
  const [cachesRows, setCachesRows] = useState<string[]>([]);
  const [filteredCaches, setFilteredCaches] = useState<string[]>([]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const caches = secured.concat(nonSecured);
    if (searchValue.trim() !== '') {
      setFilteredCaches(caches.filter((perm) => perm.toLowerCase().includes(searchValue.toLowerCase())).sort());
    } else {
      setFilteredCaches(caches);
    }

    setPagination({
      ...pagination,
      page: 1
    });
  }, [secured, nonSecured, searchValue, loading]);

  useEffect(() => {
    if (loading) {
      return;
    }
    const initSlice = (pagination.page - 1) * pagination.perPage;
    setCachesRows(filteredCaches.slice(initSlice, initSlice + pagination.perPage));
  }, [filteredCaches, pagination]);

  const columnNames = {
    name: t('access-management.role.caches-name')
  };

  const onSetPage = (_event, pageNumber) => {
    setPagination({
      ...pagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setPagination({
      page: 1,
      perPage: perPage
    });
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const paginationComponent = (
    <Pagination
      itemCount={filteredCaches.length}
      perPage={pagination.perPage}
      page={pagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-caches"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayRows = () => {
    if (!loading && cachesRows.length == 0) {
      return (
        <Tr>
          <Td>
            <Bullseye>
              <EmptyState
                variant={EmptyStateVariant.sm}
                title={t('access-management.role.no-caches-found')}
                headingLevel="h2"
                status="info"
                icon={SearchIcon}
              >
                <EmptyStateBody>{t('access-management.role.no-filtered-caches-body')}</EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      );
    }

    return (
      <React.Fragment>
        {cachesRows.map((row) => (
          <Tr key={row}>
            <Td dataLabel={columnNames.name}>
              {secured.includes(row) && <KeyIcon />}
              <Link
                data-cy={`detailLink-${row}`}
                key={row}
                to={{
                  pathname: '/cache/' + encodeURIComponent(row),
                  search: location.search
                }}
              >
                <Button data-cy={`detailButton-${row}`} key={`detail-button-${row}`} variant={ButtonVariant.link}>
                  {row}
                </Button>
              </Link>
            </Td>
          </Tr>
        ))}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <TableLoadingState
        message={t('access-management.role.loading-caches', {
          roleName: props.name
        })}
      />
    );
  }

  if (error) {
    return (
      <TableErrorState
        error={t('access-management.role.error-caches', {
          roleName: props.name
        })}
      />
    );
  }

  return (
    <React.Fragment>
      <Toolbar id="caches-table-toolbar" className={'caches-table-display'}>
        <ToolbarContent>
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <SearchInput
                placeholder={t('access-management.role.caches-search-placeholder')}
                value={searchValue}
                onChange={(_event, value) => onSearchChange(value)}
                onSearch={(_event, value) => onSearchChange(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{paginationComponent}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table className={'caches-table'} aria-label={'caches-table-label'} variant={'compact'}>
        <Thead noWrap>
          <Tr>
            <Th
              info={{
                popover: <div>{t('access-management.role.caches-name-tooltip')}</div>,
                ariaLabel: 'Cache name more information',
                popoverProps: {
                  headerContent: columnNames.name
                }
              }}
            >
              {columnNames.name}
            </Th>
          </Tr>
        </Thead>
        <Tbody>{displayRows()}</Tbody>
      </Table>
      <Toolbar id="caches-table-toolbar" className={'caches-table-toolbar'}>
        <ToolbarItem variant={ToolbarItemVariant.pagination}>{paginationComponent}</ToolbarItem>
      </Toolbar>
    </React.Fragment>
  );
};

export { RoleCaches };
