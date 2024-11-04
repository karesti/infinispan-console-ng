import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Pagination,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '@patternfly/react-icons';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { useFetchAvailableUsers } from '@app/services/userManagementHook';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';

const UsersTableDisplay = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { realms, setLoading, loading, error } = useFetchAvailableUsers();
  const [realm, setRealm] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    perPage: 5
  });

  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [usersRows, setUsersRows] = useState<string[]>([]);

  useEffect(() => {
    if (realm !== '') {
      setUsers(realms.get(realm) as string[]);
    }
  }, [realm]);

  useEffect(() => {
    if (realms.size > 0) {
      setRealm(realms.keys().next().value as string);
    }
  }, [realms, loading]);

  useEffect(() => {
    if (searchValue.trim() !== '') {
      setFilteredUsers(users.filter((user) => user.toLowerCase().includes(searchValue.toLowerCase())));
    } else {
      setFilteredUsers(users);
    }
    setUsersPagination({
      ...usersPagination,
      page: 1
    });
  }, [users, searchValue]);

  useEffect(() => {
    const initSlice = (usersPagination.page - 1) * usersPagination.perPage;
    setUsersRows(filteredUsers.slice(initSlice, initSlice + usersPagination.perPage));
  }, [filteredUsers, usersPagination]);

  const columnNames = {
    name: t('access-management.users.user-name')
  };

  const onSetPage = (_event, pageNumber) => {
    setUsersPagination({
      ...usersPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setUsersPagination({
      page: 1,
      perPage: perPage
    });
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const pagination = (
    <Pagination
      itemCount={filteredUsers.length}
      perPage={usersPagination.perPage}
      page={usersPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-users"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayRowsUsers = () => {
    return (
      <React.Fragment>
        {usersRows.map((row) => (
          <Tr key={row}>
            <Td dataLabel={columnNames.name}>{row}</Td>
          </Tr>
        ))}
      </React.Fragment>
    );
  };

  const displayEmptySearch = () => {
    return (
      <Tr>
        <Td colSpan={3}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm} icon={SearchIcon}>
              <Title headingLevel="h2" size="lg">
                {t('access-management.users.no-users-found')}
              </Title>
              <EmptyStateBody>
                {users.length == 0
                  ? t('access-management.users.no-users-body', { brandname: brandname })
                  : t('access-management.users.no-filtered-users-body')}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const displayContent = () => {
    if (loading) {
      return <TableLoadingState message={t('access-management.users.loading-users')} />;
    }

    if (error) {
      return <TableErrorState error={t('access-management.users.loading-users-error')} />;
    }

    return (
      <React.Fragment>
        <Toolbar id="principal-table-toolbar" className={'principal-table-display'}>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem variant="label" id="label-realm">
                {t('access-management.users.realm-label')}
              </ToolbarItem>
              <ToolbarItem>
                <SelectSingle
                  id={'selectedRealm'}
                  placeholder={''}
                  selected={realm}
                  options={selectOptionPropsFromArray(Array.from(realms.keys()))}
                  onSelect={(value) => setRealm(value)}
                />
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant={'filter-group'}>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('access-management.users.search-placeholder')}
                  value={searchValue}
                  onChange={(_event, value) => onSearchChange(value)}
                  onSearch={(_event, value) => onSearchChange(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'users-table'} aria-label={'users-table-label'} variant={'compact'}>
          <Thead noWrap>
            <Tr>
              <Th
                info={{
                  popover: <div>{t('access-management.users.user-name-tooltip')}</div>,
                  ariaLabel: 'User name more information',
                  popoverProps: {
                    headerContent: columnNames.name,
                    footerContent: (
                      <a target="_blank" rel="noreferrer" href={t('brandname.security-realms-docs-link')}>
                        {t('access-management.users.users-hint-link', { brandname: brandname })}
                      </a>
                    )
                  }
                }}
              >
                {columnNames.name}
              </Th>
            </Tr>
          </Thead>
          <Tbody>{usersRows.length == 0 ? displayEmptySearch() : displayRowsUsers()}</Tbody>
        </Table>
        <Toolbar id="users-table-toolbar" className={'users-table-display'}>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return <React.Fragment>{displayContent()}</React.Fragment>;
};

export { UsersTableDisplay };
