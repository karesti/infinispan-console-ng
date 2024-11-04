import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Label,
  LabelGroup,
  Pagination,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { DatabaseIcon, SearchIcon } from '@patternfly/react-icons';
import { useFetchAvailablePrincipals } from '@app/services/principalsHook';
import { t_global_spacer_sm, t_global_spacer_xl } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { GrantNewAccess } from '@app/AccessManagement/GrantNewAccess';
import { RemovePrincipal } from '@app/AccessManagement/RemovePrincipal';
import { ManageRolesForPrincipal } from '@app/AccessManagement/ManageRolesForPrincipal';

const PrincipalTableDisplay = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { principals, setLoading, loading, error } = useFetchAvailablePrincipals();
  const [searchValue, setSearchValue] = useState<string>('');
  const [principalsPagination, setPrincipalsPagination] = useState({
    page: 1,
    perPage: 5
  });

  const [filteredPrincipals, setFilteredPrincipals] = useState<Principal[]>([]);
  const [principalsRows, setPrincipalsRows] = useState<Principal[]>([]);
  const [isGrantAccess, setIsGrantAccess] = useState(false);
  const [isRemovePrincipal, setIsRemovePrincipal] = useState(false);
  const [isManageRoles, setIsManageRoles] = useState(false);
  const [principalToManage, setPrincipalToManage] = useState('');

  useEffect(() => {
    if (searchValue.trim() !== '') {
      setFilteredPrincipals(principals.filter((role) => role.name.toLowerCase().includes(searchValue.toLowerCase())));
    } else {
      setFilteredPrincipals(principals);
    }
    setPrincipalsPagination({
      ...principalsPagination,
      page: 1
    });
  }, [principals, searchValue]);

  useEffect(() => {
    const initSlice = (principalsPagination.page - 1) * principalsPagination.perPage;
    setPrincipalsRows(filteredPrincipals.slice(initSlice, initSlice + principalsPagination.perPage));
  }, [filteredPrincipals, principalsPagination]);

  const columnNames = {
    name: t('access-management.principals.principal-name'),
    roles: t('access-management.principals.roles')
  };

  const rowActions = (principal: Principal): IAction[] => [
    {
      'aria-label': 'manageRoles',
      title: t('access-management.principals.manage-roles-action'),
      onClick: () => {
        setPrincipalToManage(principal.name);
        setIsManageRoles(true);
      }
    },
    {
      isSeparator: true
    },
    {
      'aria-label': 'removePrincipal',
      title: t('common.actions.remove'),
      onClick: () => {
        setPrincipalToManage(principal.name);
        setIsRemovePrincipal(true);
      }
    }
  ];

  const onSetPage = (_event, pageNumber) => {
    setPrincipalsPagination({
      ...principalsPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setPrincipalsPagination({
      page: 1,
      perPage: perPage
    });
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const pagination = (
    <Pagination
      itemCount={filteredPrincipals.length}
      perPage={principalsPagination.perPage}
      page={principalsPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-principals"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayRowsPrincipals = () => {
    return (
      <React.Fragment>
        {principalsRows.map((row) => (
          <Tr key={row.name}>
            <Td dataLabel={columnNames.name} width={15}>
              {row.name}
            </Td>
            <Td dataLabel={columnNames.roles} width={30}>
              {
                <LabelGroup>
                  {row.roles.map((currentRole) => (
                    <Label
                      key={currentRole}
                      render={({ className, content, componentRef }) => (
                        <Link
                          data-cy={`detailLink-${currentRole}`}
                          key={currentRole}
                          to={{
                            pathname: '/access-management/role/' + encodeURIComponent(currentRole),
                            search: location.search
                          }}
                        >
                          {content}
                        </Link>
                      )}
                    >
                      {currentRole}
                    </Label>
                  ))}
                </LabelGroup>
              }
            </Td>
            <Td isActionCell aria-label={row.name + '-menu'}>
              {<ActionsColumn items={rowActions(row)} />}
            </Td>
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
                {t('access-management.principals.no-principals-found')}
              </Title>
              <EmptyStateBody>
                {principals.length == 0
                  ? t('access-management.principals.no-principals-body', {
                      brandname: brandname
                    })
                  : t('access-management.principals.no-filtered-principals-body')}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const grantAccessButtonHelper = (isEmptyPage?: boolean) => {
    const emptyPageButtonProp = {
      style: { marginTop: t_global_spacer_xl.value }
    };
    const normalPageButtonProps = {
      style: { marginLeft: t_global_spacer_sm.value }
    };
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="grant-access-principal-button-helper"
        data-cy="grantAccessPrincipalButton"
        onClick={() => setIsGrantAccess(true)}
        {...(isEmptyPage ? emptyPageButtonProp : normalPageButtonProps)}
      >
        {t('access-management.principals.grant-access')}
      </Button>
    );
  };

  const displayContent = () => {
    if (principals.length === 0) {
      return (
        <EmptyState
          variant={EmptyStateVariant.lg}
          titleText={t('access-management.principals.no-principals-status')}
          icon={DatabaseIcon}
          headingLevel="h4"
        >
          <EmptyStateBody>
            {t('access-management.principals.no-principals-body', {
              brandname: brandname
            })}
          </EmptyStateBody>
          <EmptyStateFooter>{grantAccessButtonHelper(true)}</EmptyStateFooter>
        </EmptyState>
      );
    }

    if (loading) {
      return <TableLoadingState message={t('access-management.principals.loading-principals')} />;
    }

    if (error) {
      return <TableErrorState error={t('access-management.principals.loading-principals-error')} />;
    }

    return (
      <React.Fragment>
        <Toolbar id="principal-table-toolbar" className={'principal-table-display'}>
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <SearchInput
                  placeholder={t('access-management.principals.search-placeholder')}
                  value={searchValue}
                  onChange={(_event, value) => onSearchChange(value)}
                  onSearch={(_event, value) => onSearchChange(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              <ToolbarItem>{grantAccessButtonHelper(false)}</ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'principals-table'} aria-label={'principals-table-label'} variant={'compact'}>
          <Thead noWrap>
            <Tr>
              <Th
                info={{
                  popover: <div>{t('access-management.principals.principal-name-tooltip')}</div>,
                  ariaLabel: 'Principal name more information',
                  popoverProps: {
                    headerContent: columnNames.name,
                    footerContent: (
                      <a target="_blank" rel="noreferrer" href={t('brandname.principals-docs-link')}>
                        {t('access-management.principals.principals-hint-link', { brandname: brandname })}
                      </a>
                    )
                  }
                }}
              >
                {columnNames.name}
              </Th>
              <Th>{columnNames.roles}</Th>
            </Tr>
          </Thead>
          <Tbody>{principalsRows.length == 0 ? displayEmptySearch() : displayRowsPrincipals()}</Tbody>
        </Table>
        <Toolbar id="principal-table-toolbar" className={'principal-table-display'}>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {displayContent()}
      <GrantNewAccess
        isModalOpen={isGrantAccess}
        submitModal={() => {
          setIsGrantAccess(false);
          setLoading(true);
        }}
        closeModal={() => setIsGrantAccess(false)}
      />
      <ManageRolesForPrincipal
        principalName={principalToManage}
        isModalOpen={isManageRoles}
        submitModal={() => {
          setPrincipalToManage('');
          setIsManageRoles(false);
          setLoading(true);
        }}
        closeModal={() => {
          setPrincipalToManage('');
          setIsManageRoles(false);
        }}
      />
      <RemovePrincipal
        name={principalToManage}
        isModalOpen={isRemovePrincipal}
        submitModal={() => {
          setPrincipalToManage('');
          setIsRemovePrincipal(false);
          setLoading(true);
        }}
        closeModal={() => {
          setPrincipalToManage('');
          setIsRemovePrincipal(false);
        }}
      />
    </React.Fragment>
  );
};

export { PrincipalTableDisplay };
