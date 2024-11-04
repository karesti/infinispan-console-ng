import React, { useContext } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Pagination,
  Popover,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon, HelpIcon, SearchIcon } from '@patternfly/react-icons';
import displayUtils from '../../../services/displayUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { t_global_spacer_md, t_global_spacer_sm } from '@patternfly/react-tokens';
import { ThemeContext } from '@app/providers/ThemeProvider';
import { useSearch } from '@app/services/searchHook';

const QueryEntries = (props: { cacheName: string; changeTab: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { search, setSearch } = useSearch(props.cacheName);
  const { syntaxHighLighterTheme } = useContext(ThemeContext);

  const columnNames = {
    value: 'Value'
  };

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={syntaxHighLighterTheme}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {displayUtils.formatContentToDisplay(value)}
      </SyntaxHighlighter>
    );
  };

  const onSearch = () => {
    setSearch((prevState) => {
      return { ...prevState, loading: true };
    });
  };

  const onClear = () => {
    setSearch((prevState) => {
      return {
        ...prevState,
        query: '',
        searchResult: {
          total: 0,
          values: [],
          error: false,
          cause: '',
          executed: false
        },
        loading: false
      };
    });
  };

  const onChangeSearch = (value) => {
    setSearch((prevState) => {
      return { ...prevState, query: value };
    });
    if (value.length == 0) {
      onClear();
    }
  };

  const onSetPage = (_event, pageNumber) => {
    setSearch((prevState) => {
      return { ...prevState, page: pageNumber, loading: true };
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setSearch((prevState) => {
      return { ...prevState, perPage: perPage, loading: true };
    });
  };

  const buildViewAllQueryStats = () => {
    return (
      <React.Fragment>
        <ToolbarItem variant={'separator'} style={{ marginInline: t_global_spacer_sm.value }} />
        <ToolbarItem>
          <Button
            style={{ marginLeft: t_global_spacer_md.value }}
            variant={ButtonVariant.secondary}
            onClick={() => props.changeTab()}
            data-cy="viewQueryMetricsButton"
          >
            {t('caches.query.view-all-query-stats')}
          </Button>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={search.searchResult.total}
        perPage={search.perPage}
        page={search.page}
        onSetPage={onSetPage}
        widgetId="pagination-query"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const toolbar = (
    <Toolbar id="cache-query-toolbar" style={{ paddingLeft: 0 }}>
      <ToolbarContent>
        <ToolbarItem>
          <SearchInput
            name="textSearchByQuery"
            id="textSearchByQuery"
            aria-label="Query textfield"
            placeholder={t('caches.query.ickle-query')}
            type="search"
            submitSearchButtonLabel={'searchButton'}
            style={{ width: '35rem' }}
            onChange={(e, value) => onChangeSearch(value)}
            onSearch={onSearch}
            onClear={onClear}
          />
        </ToolbarItem>
        <ToolbarItem>
          <Popover
            headerContent={t('caches.query.ickle-query')}
            bodyContent={t('caches.query.ickle-query-tooltip', {
              brandname: brandname
            })}
            footerContent={
              <Button
                variant={'link'}
                style={{ paddingLeft: 0 }}
                iconPosition={'start'}
                icon={<ExternalLinkSquareAltIcon />}
                onClick={() => window.open(t('brandname.ickle-query-docs-link'), '_blank')}
              >
                {t('caches.query.ickle-query-docs')}
              </Button>
            }
          >
            <Button
              variant="plain"
              aria-label={'more-info-ickle'}
              onClick={(e) => e.preventDefault()}
              aria-describedby={'helpickle'}
              className="pf-v5-c-form__group-label-help"
              icon={<HelpIcon />}
            />
          </Popover>
        </ToolbarItem>
        {buildViewAllQueryStats()}
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const emptyQueryMessage = (
    <EmptyState variant={EmptyStateVariant.lg} icon={SearchIcon}>
      <EmptyStateBody>{t('caches.query.no-query-body')}</EmptyStateBody>
    </EmptyState>
  );

  const emptyStateLoading = <EmptyState titleText={t('caches.query.query-loading')} headingLevel="h4" icon={Spinner} />;

  const errorSearchMessage = (
    <EmptyState status={'danger'} headingLevel="h2" titleText={t('caches.query.query-error')}>
      <EmptyStateBody>{search.searchResult.cause}</EmptyStateBody>
    </EmptyState>
  );

  const emptySearchMessage = (
    <EmptyState>
      <EmptyStateBody>{t('caches.query.no-search-value')}</EmptyStateBody>
    </EmptyState>
  );

  const displayContent = () => {
    if (!search.searchResult.executed) {
      return emptyQueryMessage;
    }

    if (search.loading) {
      return emptyStateLoading;
    }

    if (search.searchResult.error) {
      return errorSearchMessage;
    }

    return (
      <React.Fragment>
        <Table data-cy="queryTable" className={'query-table'} aria-label={'query-table-label'} variant="compact">
          <Thead>
            <Tr>
              <Th>{columnNames.value}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {search.searchResult.values.length == 0 ? (
              <Tr>
                <Td>{emptySearchMessage}</Td>
              </Tr>
            ) : (
              search.searchResult.values.map((row, index) => {
                return (
                  <Tr key={index}>
                    <Td dataLabel={columnNames.value}>{displayValue(row)}</Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
        <Toolbar id="query-table-toolbar" className={'query-table-display'}>
          <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        {toolbar}
        {displayContent()}
      </CardBody>
    </Card>
  );
};

export { QueryEntries };
