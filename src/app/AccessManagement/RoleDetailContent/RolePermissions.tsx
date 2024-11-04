import { useTranslation } from 'react-i18next';
import {
  Alert,
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
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useDescribeRole } from '@app/services/rolesHook';
import { ROLES_MAP } from '@services/infinispanRefData';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { SearchIcon } from '@patternfly/react-icons';
import { AddPermissions } from '@app/AccessManagement/RoleDetailContent/AddPermissions';
import { RemovePermission } from '@app/AccessManagement/RoleDetailContent/RemovePermission';

const RolePermissions = (props: { name: string }) => {
  const { t } = useTranslation();
  const { role, loading, error, setLoading } = useDescribeRole(props.name);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 5
  });
  const [isAddPermissions, setIsAddPermissions] = useState(false);
  const [removePermission, setIsRemovePermission] = useState('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [permissionRows, setPermissionRows] = useState<string[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!role) {
      return;
    }

    if (searchValue.trim() !== '') {
      setFilteredPermissions(
        role.permissions.filter((perm) => perm.toLowerCase().includes(searchValue.toLowerCase())).sort()
      );
    } else {
      setFilteredPermissions(role.permissions.sort());
    }

    setPagination({
      ...pagination,
      page: 1
    });
  }, [role, searchValue]);

  useEffect(() => {
    if (!role) {
      return;
    }
    const initSlice = (pagination.page - 1) * pagination.perPage;
    setPermissionRows(filteredPermissions.slice(initSlice, initSlice + pagination.perPage));
  }, [filteredPermissions, pagination]);

  const columnNames = {
    name: t('access-management.role.permission-name'),
    description: t('access-management.role.permission-description')
  };

  const rowActions = (permission): IAction[] => [
    {
      'aria-label': 'removePermission-' + permission,
      title: t('common.actions.remove'),
      onClick: () => {
        setIsRemovePermission(permission);
      }
    }
  ];

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
      itemCount={filteredPermissions.length}
      perPage={pagination.perPage}
      page={pagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-permissions"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayRows = () => {
    if (!role || permissionRows.length == 0) {
      return (
        <Tr>
          <Td colSpan={3}>
            <Bullseye>
              <EmptyState
                variant={EmptyStateVariant.sm}
                title={t('access-management.role.no-permissions-found')}
                headingLevel="h2"
                icon={SearchIcon}
              >
                <EmptyStateBody>{t('access-management.role.no-filtered-permissions-body')}</EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      );
    }

    return (
      <React.Fragment>
        {permissionRows.map((row) => (
          <Tr key={row}>
            <Td dataLabel={columnNames.name} width={20}>
              {row}
            </Td>
            <Td dataLabel={columnNames.description}>{ROLES_MAP.get(row) ? t(ROLES_MAP.get(row) as string) : row}</Td>
            {!role.implicit && role.permissions.length > 1 && (
              <Td isActionCell aria-label={row + '-menu'}>
                {<ActionsColumn items={rowActions(row)} />}
              </Td>
            )}
          </Tr>
        ))}
      </React.Fragment>
    );
  };

  const addPermissionButton = () => {
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="add-permission-button"
        data-cy="addPermissionButton"
        isDisabled={!role || role.implicit}
        onClick={() => setIsAddPermissions(true)}
      >
        {t('access-management.role.add-permission-button')}
      </Button>
    );
  };

  const displayImplicitRoleMessage = () => {
    return (
      role?.implicit && (
        <Alert isInline isPlain variant={'warning'} title={t('access-management.role.permissions-implicit-warning')} />
      )
    );
  };

  if (loading) {
    return <TableLoadingState message={t('access-management.role.loading', { roleName: props.name })} />;
  }

  if (error) {
    return <TableErrorState error={t('access-management.role.error', { roleName: props.name })} />;
  }

  return (
    <React.Fragment>
      {displayImplicitRoleMessage()}
      <Toolbar id="role-table-toolbar" className={'role-table-display'}>
        <ToolbarContent>
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <SearchInput
                placeholder={t('access-management.role.permissions-search-placeholder')}
                value={searchValue}
                onChange={(_event, value) => onSearchChange(value)}
                onSearch={(_event, value) => onSearchChange(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>{addPermissionButton()}</ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{paginationComponent}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table className={'permissions-table'} aria-label={'permissions-table-label'} variant={'compact'}>
        <Thead noWrap>
          <Tr>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.description}</Th>
          </Tr>
        </Thead>
        <Tbody>{displayRows()}</Tbody>
      </Table>
      <Toolbar id="permissions-table-toolbar" className={'permissions-table-toolbar'}>
        <ToolbarItem variant={ToolbarItemVariant.pagination}>{paginationComponent}</ToolbarItem>
      </Toolbar>
      {role && (
        <AddPermissions
          name={role.name}
          permissions={role.permissions}
          isModalOpen={isAddPermissions}
          submitModal={() => {
            setIsAddPermissions(false);
            setLoading(true);
          }}
          closeModal={() => {
            setIsAddPermissions(false);
          }}
        />
      )}
      {role && (
        <RemovePermission
          name={role.name}
          remove={removePermission}
          permissions={role.permissions}
          isModalOpen={removePermission != ''}
          submitModal={() => {
            setIsRemovePermission('');
            setLoading(true);
          }}
          closeModal={() => {
            setIsRemovePermission('');
          }}
        />
      )}
    </React.Fragment>
  );
};

export { RolePermissions };
