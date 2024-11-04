import React, { useEffect, useState } from 'react';
import {
  Badge,
  Bullseye,
  Button,
  ButtonProps,
  ButtonVariant,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Label,
  LabelGroup,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuToggle,
  Pagination,
  Popper,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarItem,
  ToolbarItemVariant,
  ToolbarToggleGroup
} from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { useCaches, useDataContainer } from '@app/services/dataContainerHooks';
import { DatabaseIcon, EyeSlashIcon, FilterIcon, SearchIcon } from '@patternfly/react-icons';
import displayUtils from '@services/displayUtils';
import {
  CacheFeature,
  CacheFeatureFilter,
  CacheStatus,
  CacheType,
  DEGRADED_HEALTH,
  FAILED
} from '@services/infinispanRefData';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useBanner } from '@app/utils/useApiAlert';
import { t_global_spacer_sm, t_global_spacer_xl } from '@patternfly/react-tokens';
import { Link } from 'react-router-dom';
import { onSearch } from '@app/utils/searchFilter';
import { DeleteCache } from '@app/Caches/DeleteCache';
import { IgnoreCache } from '@app/Caches/IgnoreCache';
import { SetAvailableCache } from '@app/Caches/SetAvailableCache';
import { UpdateAliasCache } from '@app/Caches/UpdateAliasCache';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';

interface CacheAction {
  cacheName: string;
  action: '' | 'ignore' | 'undo' | 'delete' | 'available' | 'aliases';
}

const CacheTableDisplay = (props: { setCachesCount: (count: number) => void; isVisible: boolean }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { setBanner } = useBanner();
  const { caches, errorCaches, loadingCaches, reloadCaches } = useCaches();
  const { cm } = useDataContainer();

  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([]);
  const [selectedCacheFeature, setSelectedCacheFeature] = useState<string[]>([]);
  const [selectedCacheType, setSelectedCacheType] = useState<string[]>([]);
  const [selectedCacheStatus, setSelectedCacheStatus] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [rows, setRows] = useState<CacheInfo[] | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const areSelectionsPresent =
    selectedCacheFeature.length > 0 || selectedCacheType.length > 0 || selectedCacheStatus.length > 0;

  const isAdmin = ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser);
  const isCreator = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const [rowsLoading, setRowsLoading] = useState<boolean>(true);

  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [cacheAction, setCacheAction] = useState<CacheAction>({
    cacheName: '',
    action: ''
  });

  const isCacheIgnored = (cacheInfo: CacheInfo): boolean => {
    return cacheInfo.status == 'IGNORED';
  };

  const onFilter = (cache: CacheInfo) => {
    const matchesTypeValue = selectedCacheType.includes(cache.type);
    const matchesFeatureValue = selectedCacheFeature.some(
      (feature) => cache.features[CacheFeatureFilter[feature]] == true
    );
    const matchesStatusValue = selectedCacheStatus.includes(CacheStatus[cache.status]);

    return (
      (selectedCacheType.length === 0 || matchesTypeValue) &&
      (selectedCacheFeature.length === 0 || matchesFeatureValue) &&
      (selectedCacheStatus.length === 0 || matchesStatusValue)
    );
  };

  useEffect(() => {
    if (!loadingCaches) {
      const failedCaches = caches.reduce((failedCaches: string, cacheInfo: CacheInfo) => {
        if (cacheInfo.health == FAILED || cacheInfo.health == DEGRADED_HEALTH) {
          return failedCaches == '' ? cacheInfo.name : failedCaches + ', ' + cacheInfo.name;
        } else {
          return failedCaches;
        }
      }, '');

      if (failedCaches.length > 0) {
        setBanner('[' + failedCaches + '] ' + t('cache-managers.cache-failed-status'));
      } else {
        setBanner('');
      }

      props.setCachesCount(caches.length);
      setFilteredCaches(caches);
    }
  }, [caches, errorCaches, loadingCaches]);

  useEffect(() => {
    if (filteredCaches) {
      const initSlice = (cachesPagination.page - 1) * cachesPagination.perPage;
      const updateRows = filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage);
      setRows(updateRows);
    }
  }, [cachesPagination, filteredCaches]);

  useEffect(() => {
    if (rows != null) {
      setRowsLoading(false);
    }
  }, [rows]);

  useEffect(() => {
    setFilteredCaches(
      caches
        .filter(
          (cache) =>
            // on cache name
            onSearch(searchValue, cache.name) ||
            // on aliases
            cache.aliases.map((alias) => onSearch(searchValue, alias)).filter((r) => r).length > 0
        )
        .filter(onFilter)
    );
  }, [searchValue, selectedCacheFeature, selectedCacheType, selectedCacheStatus]);

  const columnNames = {
    name: t('cache-managers.cache-name'),
    aliases: t('cache-managers.cache-aliases'),
    mode: t('cache-managers.cache-mode'),
    health: t('cache-managers.cache-health'),
    features: t('cache-managers.cache-features'),
    status: t('cache-managers.cache-status')
  };

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      ...cachesPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: 1,
      perPage: perPage
    });
  };

  const openIgnoreCacheModal = (cacheName: string, ignored: boolean) => {
    setCacheAction({
      cacheName: cacheName,
      action: ignored ? 'undo' : 'ignore'
    });
  };

  const openUpdateAliasesCacheModal = (cacheName: string) => {
    setCacheAction({
      cacheName: cacheName,
      action: 'aliases'
    });
  };

  const openAvailableCacheModal = (cacheName: string) => {
    setCacheAction({
      cacheName: cacheName,
      action: 'available'
    });
  };

  const closeDeleteModal = (deleteDone: boolean) => {
    if (deleteDone) setFilteredCaches(filteredCaches.filter((cacheInfo) => cacheInfo.name !== cacheAction.cacheName));
    setCacheAction({ cacheName: '', action: '' });
  };

  const onLabelDelete = (category: string, label: string) => {
    if (category === 'feature') {
      setSelectedCacheFeature(selectedCacheFeature.filter((selection) => selection !== label));
    } else if (category === 'type') {
      setSelectedCacheType(selectedCacheType.filter((selection) => selection !== label));
    } else {
      setSelectedCacheStatus(selectedCacheStatus.filter((selection) => selection !== label));
    }
  };

  const onToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (menuRef.current) {
        const firstElement = menuRef.current.querySelector('li > button:not(:disabled)');
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
      }
    }, 0);
    setIsFilterOpen(!isFilterOpen);
  };

  const onSelectFilter = (event: React.MouseEvent | undefined, itemId: string | number | undefined) => {
    if (typeof itemId === 'undefined') {
      return;
    }

    const itemStr = itemId.toString();
    const category = Object.keys(CacheType).includes(itemStr)
      ? 'Type'
      : Object.keys(CacheFeatureFilter).includes(itemStr)
        ? 'Feature'
        : 'Status';

    if (category === 'Type') {
      setSelectedCacheType(
        selectedCacheType.includes(itemStr)
          ? selectedCacheType.filter((selection) => selection !== itemStr)
          : [itemStr, ...selectedCacheType]
      );
    } else if (category === 'Feature') {
      setSelectedCacheFeature(
        selectedCacheFeature.includes(itemStr)
          ? selectedCacheFeature.filter((selection) => selection !== itemStr)
          : [itemStr, ...selectedCacheFeature]
      );
    } else {
      setSelectedCacheStatus(
        selectedCacheStatus.includes(itemStr)
          ? selectedCacheStatus.filter((selection) => selection !== itemStr)
          : [itemStr, ...selectedCacheStatus]
      );
    }
  };

  const rebalancingOffBadge = (cacheInfo: CacheInfo) => {
    if (!cm.rebalancing_enabled) {
      return '';
    }

    if (cacheInfo.rebalancing_enabled != undefined && cacheInfo.rebalancing_enabled) {
      return '';
    }

    return <Label key={`ignore-${cacheInfo.name}`}>{t('cache-managers.rebalancing.disabled-status')}</Label>;
  };

  const ignoreCacheBadge = (cacheInfo: CacheInfo) => {
    if (!isCacheIgnored(cacheInfo)) {
      return '';
    }
    return (
      <Label key={`ignore-${cacheInfo.name}`} data-cy={`ignoreBadge-${cacheInfo.name}`}>
        {t('cache-managers.ignored-status')}
      </Label>
    );
  };

  const displayCacheName = (cacheInfo: CacheInfo) => {
    let className = '';
    if (cacheInfo.health == FAILED) {
      className = 'failed-link';
    }

    const disableCacheDetail = isCacheIgnored(cacheInfo);

    const cacheNameHiddenIcon: ButtonProps = {
      icon: <EyeSlashIcon />,
      iconPosition: 'right'
    };

    const cacheDetailAccess = (
      <Button
        data-cy={`detailButton-${cacheInfo.name}`}
        key={`detail-button-${cacheInfo.name}`}
        variant={ButtonVariant.link}
        isDisabled={disableCacheDetail}
        className={className}
        {...(disableCacheDetail && cacheNameHiddenIcon)}
        style={{ paddingLeft: 0 }}
      >
        {cacheInfo.name}
      </Button>
    );

    if (disableCacheDetail) {
      return cacheDetailAccess;
    }

    return (
      <Link
        data-cy={`detailLink-${cacheInfo.name}`}
        key={cacheInfo.name}
        to={{
          pathname: '/cache/' + encodeURIComponent(cacheInfo.name),
          search: location.search
        }}
      >
        {cacheDetailAccess}
      </Link>
    );
  };

  const displayCacheAliases = (cacheInfo: CacheInfo) => {
    if (cacheInfo.aliases.length == 0) {
      return (
        <Content component={ContentVariants.small} data-cy={`alias-none`}>
          {t('cache-managers.aliases-none')}
        </Content>
      );
    }
    return (
      <LabelGroup>
        {cacheInfo.aliases.map((alias) => (
          <Label key={`alias-${alias}`} data-cy={`alias-${alias}`} isCompact>
            {alias}
          </Label>
        ))}
      </LabelGroup>
    );
  };

  const displayCacheFeatures = (cacheInfo: CacheInfo) => {
    return (
      <Content component={ContentVariants.small} data-cy={`feature-${cacheInfo.name}`}>
        {displayUtils.createFeaturesString(cacheInfo.features)}
      </Content>
    );
  };

  const displayCacheHealth = (cacheHealth: ComponentStatusType, cacheName: string) => {
    return <InfinispanComponentStatus status={cacheHealth} name={cacheName} isLabel={true} />;
  };

  const displayCacheType = (cacheType) => {
    const labelColor = displayUtils.cacheTypeColor(cacheType);
    return (
      <Label color={labelColor} data-cy={'type-' + cacheType}>
        {cacheType}
      </Label>
    );
  };

  const displayCacheStatus = (cacheInfo: CacheInfo) => {
    const badgeIgnore = ignoreCacheBadge(cacheInfo);
    const badgeRebalancing = rebalancingOffBadge(cacheInfo);

    if (badgeIgnore == '' && badgeRebalancing == '') {
      return '';
    }

    return (
      <LabelGroup>
        {badgeIgnore}
        {badgeRebalancing}
      </LabelGroup>
    );
  };

  const displayActions = (cache: CacheInfo): IAction[] => {
    const cacheName: string = cache.name as string;

    if (!cacheName) return [];

    const ignoredCache = cache.status === 'IGNORED';
    const health = cache.health;

    if ((!isAdmin && !isCreator) || (ignoredCache && !isAdmin)) return [];

    if (ignoredCache) {
      return [
        {
          'aria-label': 'showCacheAction',
          title: t('cache-managers.undo-ignore'),
          onClick: () => openIgnoreCacheModal(cacheName, ignoredCache)
        }
      ];
    }

    // eslint-disable-next-line prefer-const
    let actions: IAction[] = [];

    if (isAdmin) {
      actions.push({
        'aria-label': 'updateAliasesCacheAction',
        title: t('cache-managers.update-aliases'),
        onClick: () => openUpdateAliasesCacheModal(cacheName)
      });

      actions.push({
        'aria-label': 'ignoreCacheAction',
        title: t('cache-managers.ignore'),
        onClick: () => openIgnoreCacheModal(cacheName, ignoredCache)
      });
    }

    if (isAdmin && health === DEGRADED_HEALTH) {
      actions.push({
        'aria-label': 'openAvailableCacheAction',
        title: t('cache-managers.available'),
        onClick: () => openAvailableCacheModal(cacheName)
      });
    }

    actions.push({
      'aria-label': 'deleteCacheAction',
      title: t('cache-managers.delete'),
      onClick: () => {
        setCacheAction({
          cacheName: cacheName,
          action: 'delete'
        });
      }
    });

    return actions;
  };

  const createCacheButtonHelper = (isEmptyPage?: boolean) => {
    const pathName = canCreateCache ? '/container/caches/create' : '/caches/setup';
    const emptyPageButtonProp = {
      style: { marginTop: t_global_spacer_xl.value }
    };
    const normalPageButtonProps = {
      style: { marginLeft: t_global_spacer_sm.value }
    };
    return (
      <Link
        to={{
          pathname: pathName,
          search: location.search
        }}
      >
        <Button
          variant={ButtonVariant.primary}
          aria-label="create-cache-button-helper"
          data-cy={canCreateCache ? 'createCacheButton' : 'createCacheConfigButton'}
          {...(isEmptyPage ? emptyPageButtonProp : normalPageButtonProps)}
        >
          {canCreateCache ? t('cache-managers.create-cache-button') : 'Create cache configuration'}
        </Button>
      </Link>
    );
  };

  const buildCreateCacheButton = () => {
    return (
      <React.Fragment>
        <ToolbarItem>{createCacheButtonHelper()}</ToolbarItem>
      </React.Fragment>
    );
  };

  const cacheTemplateButton = (
    <Link
      to={{
        pathname: '/container/configurations/',
        search: location.search
      }}
    >
      <Button variant={'link'} aria-label="view-cache-configurations-button" data-cy="showTemplatesButton">
        {t('cache-managers.config-templates-button')}
      </Button>
    </Link>
  );

  const emptyPage = (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={t('cache-managers.no-caches-status')}
      icon={DatabaseIcon}
      headingLevel="h4"
    >
      <EmptyStateBody>{t('cache-managers.no-caches-body')}</EmptyStateBody>
      <EmptyStateFooter>
        {createCacheButtonHelper(true)}
        <EmptyStateActions style={{ marginTop: t_global_spacer_sm.value }}>{cacheTemplateButton}</EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  const toggleFilter = (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isFilterOpen}
      {...(areSelectionsPresent && {
        badge: (
          <Badge isRead>{selectedCacheFeature.length + selectedCacheType.length + selectedCacheStatus.length}</Badge>
        )
      })}
      icon={<FilterIcon />}
      style={
        {
          width: '200px'
        } as React.CSSProperties
      }
    >
      {t('cache-managers.cache-filter-label')}
    </MenuToggle>
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (isFilterOpen && !menuRef.current?.contains(event.target as Node)) {
      setIsFilterOpen(false);
    }
  };

  const handleKeys = (event: KeyboardEvent) => {
    if (isFilterOpen && menuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsFilterOpen(!isFilterOpen);
        toggleRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isFilterOpen, menuRef]);

  const filterMenu = (
    <Menu ref={menuRef} id="filter-faceted-cache-menu" onSelect={onSelectFilter} selected={selectedCacheType}>
      <MenuContent>
        <MenuList>
          <MenuGroup label={t('cache-managers.cache-filter-type-label')}>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheType.includes(CacheType.Local)}
              itemId="Local"
              data-cy="localType"
            >
              {t('cache-managers.mode-local')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheType.includes(CacheType.Replicated)}
              itemId="Replicated"
              data-cy="replicatedType"
            >
              {t('cache-managers.mode-repl')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheType.includes(CacheType.Distributed)}
              itemId="Distributed"
              data-cy="distributedType"
            >
              {t('cache-managers.mode-dist')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheType.includes(CacheType.Invalidated)}
              itemId="Invalidated"
              data-cy="invalidatedType"
            >
              {t('cache-managers.mode-invalid')}
            </MenuItem>
          </MenuGroup>
          <MenuGroup label={t('cache-managers.cache-filter-feature-label')}>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.BOUNDED)}
              itemId="Bounded"
              data-cy="boundedFeature"
            >
              {t('cache-managers.cache-filter-feature-bounded')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.INDEXED)}
              itemId="Indexed"
              data-cy="indexedFeature"
            >
              {t('cache-managers.cache-filter-feature-indexed')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.PERSISTENCE)}
              itemId="Persistence"
              data-cy="persistenceFeature"
            >
              {t('cache-managers.cache-filter-feature-persistent')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.TRANSACTIONAL)}
              itemId="Transactional"
              data-cy="transactionalFeature"
            >
              {t('cache-managers.cache-filter-feature-trans')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.SECURED)}
              itemId="Authorization"
              data-cy="authorizationFeature"
            >
              {t('cache-managers.cache-filter-feature-secure')}
            </MenuItem>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheFeature.includes(CacheFeature.BACKUPS)}
              itemId="Backups"
              data-cy="backupsFeature"
            >
              {t('cache-managers.cache-filter-feature-xsite')}
            </MenuItem>
          </MenuGroup>
          <MenuGroup label={t('cache-managers.cache-filter-status-label')}>
            <MenuItem
              hasCheckbox
              isSelected={selectedCacheStatus.includes(CacheStatus.IGNORED)}
              itemId="Hidden"
              data-cy="hiddenStatus"
            >
              {t('cache-managers.cache-filter-status-ignored')}
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const selectFilter = (
    <div ref={containerRef}>
      <Popper
        trigger={toggleFilter}
        popper={filterMenu}
        appendTo={containerRef.current || undefined}
        isVisible={isFilterOpen}
      />
    </div>
  );

  const searchInput = (
    <SearchInput
      placeholder={t('cache-managers.cache-search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={filteredCaches.length}
        perPage={cachesPagination.perPage}
        page={cachesPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-caches"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const toolbar = (
    <Toolbar
      id="cache-table-toolbar"
      clearAllFilters={() => {
        setSelectedCacheFeature([]);
        setSelectedCacheType([]);
        setSelectedCacheStatus([]);
      }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup data-cy="cacheFilterSelect" toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarFilter
            labels={selectedCacheType}
            deleteLabel={(category, chip) => onLabelDelete(category as string, chip as string)}
            deleteLabelGroup={() => setSelectedCacheType([])}
            categoryName={{
              key: 'type',
              name: t('cache-managers.cache-filter-type-label')
            }}
            showToolbarItem={false}
          >
            <div />
          </ToolbarFilter>
          <ToolbarFilter
            labels={selectedCacheFeature}
            deleteLabel={(category, chip) => onLabelDelete(category as string, chip as string)}
            deleteLabelGroup={() => setSelectedCacheFeature([])}
            categoryName={{
              key: 'feature',
              name: t('cache-managers.cache-filter-feature-label')
            }}
          >
            <div />
          </ToolbarFilter>
          <ToolbarFilter
            labels={selectedCacheStatus}
            deleteLabel={(category, chip) => onLabelDelete(category as string, chip as string)}
            deleteLabelGroup={() => setSelectedCacheStatus([])}
            categoryName={{
              key: 'status',
              name: t('cache-managers.cache-filter-status-label')
            }}
            data-cy="cacheFilterSelectExpanded"
          >
            {selectFilter}
          </ToolbarFilter>
        </ToolbarToggleGroup>
        <ToolbarItem>{searchInput}</ToolbarItem>
        <ToolbarItem
          variant={ToolbarItemVariant.separator}
          style={{ marginInline: t_global_spacer_sm.value }}
        ></ToolbarItem>
        {buildCreateCacheButton()}
        <ToolbarItem>{cacheTemplateButton}</ToolbarItem>
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  if (!props.isVisible) {
    return <span />;
  }

  const displayEmptyState = () => {
    if (rowsLoading || rows == null) {
      return (
        <Bullseye>
          <EmptyState
            variant={EmptyStateVariant.sm}
            icon={Spinner}
            headingLevel="h4"
            titleText={<>{t('cache-managers.loading-caches')}</>}
          ></EmptyState>
        </Bullseye>
      );
    }

    return (
      <Bullseye>
        <EmptyState
          variant={EmptyStateVariant.sm}
          titleText={<>{t('cache-managers.no-filter-cache')}</>}
          icon={SearchIcon}
          headingLevel="h2"
        >
          <EmptyStateBody>{t('cache-managers.no-caches-body')}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  };

  if (loadingCaches) {
    return (
      <EmptyState
        variant={EmptyStateVariant.sm}
        titleText={<>{t('cache-managers.loading-caches')}</>}
        icon={Spinner}
        headingLevel="h4"
      />
    );
  }

  return (
    <React.Fragment>
      {!loadingCaches && !rowsLoading && caches.length == 0 ? (
        emptyPage
      ) : (
        <>
          {toolbar}
          <Table data-cy="cachesTable" className={'cache-table'} aria-label={'cache-table-label'} variant="compact">
            <Thead>
              <Tr>
                <Th colSpan={1}>{columnNames.name}</Th>
                <Th colSpan={1}>{columnNames.aliases}</Th>
                <Th colSpan={1}>{columnNames.mode}</Th>
                <Th colSpan={1}>{columnNames.health}</Th>
                <Th colSpan={1}>{columnNames.features}</Th>
                <Th colSpan={1}>{columnNames.status}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rowsLoading || rows == null || rows.length == 0 ? (
                <Tr>
                  <Td colSpan={6}>{displayEmptyState()}</Td>
                </Tr>
              ) : (
                rows.map((row) => {
                  return (
                    <Tr key={row.name}>
                      <Td dataLabel={columnNames.name}>{displayCacheName(row)}</Td>
                      <Td dataLabel={columnNames.aliases}>{displayCacheAliases(row)}</Td>
                      <Td dataLabel={columnNames.mode}>{displayCacheType(row.type)}</Td>
                      <Td dataLabel={columnNames.health}>{displayCacheHealth(row.health, row.name)}</Td>
                      <Td dataLabel={columnNames.features}>{displayCacheFeatures(row)}</Td>
                      <Td dataLabel={columnNames.status}>{displayCacheStatus(row)}</Td>
                      {(isAdmin || isCreator) && (
                        <Td isActionCell data-cy={'actions-' + row.name}>
                          <ActionsColumn items={displayActions(row)} />
                        </Td>
                      )}
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
          <Toolbar id="cache-table-pagination">
            <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
          </Toolbar>
          <DeleteCache
            cacheName={cacheAction.cacheName}
            isModalOpen={cacheAction.action == 'delete'}
            closeModal={closeDeleteModal}
          />
          <IgnoreCache
            cacheName={cacheAction.cacheName}
            isModalOpen={cacheAction.action == 'ignore' || cacheAction.action == 'undo'}
            action={cacheAction.action}
            closeModal={() => setCacheAction({ cacheName: '', action: '' })}
          />
          <SetAvailableCache
            cacheName={cacheAction.cacheName}
            isModalOpen={cacheAction.action == 'available'}
            closeModal={() => setCacheAction({ cacheName: '', action: '' })}
          />
          <UpdateAliasCache
            cacheName={cacheAction.cacheName}
            isModalOpen={cacheAction.action == 'aliases'}
            closeModal={() => {
              setCacheAction({ cacheName: '', action: '' });
              reloadCaches();
            }}
          />
        </>
      )}
    </React.Fragment>
  );
};

export { CacheTableDisplay };
