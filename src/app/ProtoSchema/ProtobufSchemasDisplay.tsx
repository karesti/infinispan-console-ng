import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Pagination,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { ActionsColumn, ExpandableRowContent, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DatabaseIcon, SearchIcon } from '@patternfly/react-icons';
import { t_global_spacer_md, t_global_spacer_sm, t_global_spacer_xl } from '@patternfly/react-tokens';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { CreateProtoSchema } from '@app/ProtoSchema/CreateProtoSchema';
import { DeleteSchema } from '@app/ProtoSchema/DeleteSchema';
import { EditSchema } from './EditSchema';
import { useFetchProtobufSchemas } from '@app/services/protobufHooks';
import { onSearch } from '@app/utils/searchFilter';
import './ProtobufSchemasDisplay.css';
import { ThemeContext } from '@app/providers/ThemeProvider';

const ProtobufSchemasDisplay = (props: { setProtoSchemasCount: (number) => void; isVisible: boolean }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const protobufService = ConsoleServices.protobuf();
  const { connectedUser } = useConnectedUser();
  const { schemas, loading, reload, error } = useFetchProtobufSchemas();
  const [filteredSchemas, setFilteredSchemas] = useState<ProtoSchema[]>([]);
  const [rows, setRows] = useState<ProtoSchema[]>([]);
  const [schemasContent, setSchemasContent] = useState(new Map<string, string>());
  const [createSchemaFormOpen, setCreateSchemaFormOpen] = useState<boolean>(false);
  const [deleteSchemaName, setDeleteSchemaName] = useState<string>('');
  const [editSchemaName, setEditSchemaName] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [expandedSchemaNames, setExpandedSchemaNames] = useState<string[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemasPagination, setSchemasPagination] = useState({
    page: 1,
    perPage: 10
  });
  const { syntaxHighLighterTheme } = useContext(ThemeContext);

  const isSchemaExpanded = (row) => expandedSchemaNames.includes(row.name);

  const displayActions = (row): IAction[] => [
    {
      'aria-label': 'editSchemaAction',
      title: t('schemas.edit-button'),
      onClick: () => {
        setLoadingSchema(true);
        loadSchema(row.name);
        setEditSchemaName(row.name);
      }
    },
    {
      'aria-label': 'deleteSchemaAction',
      title: t('schemas.delete-button'),
      onClick: () => {
        setDeleteSchemaName(row.name);
      }
    }
  ];

  const onSetPage = (_event, pageNumber) => {
    setSchemasPagination({
      ...schemasPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setSchemasPagination({
      page: 1,
      perPage: perPage
    });
  };

  const columnNames = {
    name: t('schemas.name'),
    status: t('schemas.status')
  };

  useEffect(() => {
    if (schemas) {
      props.setProtoSchemasCount(schemas.length);
      setFilteredSchemas(schemas);
      setExpandedSchemaNames([]);
      schemasContent.clear();
    }
  }, [schemas, loading, error]);

  useEffect(() => {
    if (filteredSchemas) {
      const initSlice = (schemasPagination.page - 1) * schemasPagination.perPage;
      const updateRows = filteredSchemas.slice(initSlice, initSlice + schemasPagination.perPage);
      setRows(updateRows);
    }
  }, [schemasPagination, filteredSchemas]);

  useEffect(() => {
    setFilteredSchemas(schemas.filter((schema) => onSearch(searchValue, schema.name)));
  }, [searchValue]);

  const loadSchema = (schemaName: string) => {
    if (loadingSchema) {
      protobufService
        .getSchema(schemaName)
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setSchemasContent((map) => new Map(map.set(schemaName, eitherResponse.value)));
          } else {
            setSchemasContent(
              (map) => new Map(map.set(schemaName, 'An error occurred. Try closing the tab and opening it again.'))
            );
            addAlert(eitherResponse.value);
          }
        })
        .finally(() => setLoadingSchema(false));
    }
  };

  const setSchemaExpanded = (schema, isExpanding = true) =>
    setExpandedSchemaNames((prevExpanded) => {
      const otherExpandedSchemaNames = prevExpanded.filter((r) => r !== schema.name);
      return isExpanding ? [...otherExpandedSchemaNames, schema.name] : otherExpandedSchemaNames;
    });

  const closeEditSchemaModal = () => {
    setEditSchemaName('');
  };

  const closeDeleteSchemaModal = () => {
    setDeleteSchemaName('');
    reload();
  };

  const submitEditSchemaModal = () => {
    setEditSchemaName('');
    reload();
    setLoadingSchema(true);
    loadSchema(editSchemaName);
  };

  const closeCreateSchemaModal = (createDone: boolean) => {
    if (createDone) {
      reload();
    }
    setCreateSchemaFormOpen(false);
  };

  const createSchemaButtonHelper = (isEmptyPage?: boolean) => {
    const emptyPageButtonProp = {
      style: { marginTop: t_global_spacer_xl.value }
    };
    const normalPageButtonProps = {
      style: { marginLeft: t_global_spacer_sm.value }
    };
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="create-schema-button"
        data-cy="createSchemaButton"
        {...(isEmptyPage ? emptyPageButtonProp : normalPageButtonProps)}
        onClick={() => {
          setCreateSchemaFormOpen(true);
        }}
      >
        {t('schemas.create-button')}
      </Button>
    );
  };

  const buildCreateSchemaButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return '';
    }
    return <ToolbarItem>{createSchemaButtonHelper()}</ToolbarItem>;
  };

  const displayProtoError = (error: ProtoError | undefined) => {
    if (error) {
      return (
        <Alert isPlain isInline variant={AlertVariant.danger} title={error.message} className="alert-message">
          <p>{error.cause}</p>
        </Alert>
      );
    }

    return <Alert isPlain isInline variant={AlertVariant.success} title={''} className="alert-message" />;
  };

  const buildSchemaContent = (name) => {
    if (!schemasContent.get(name)) {
      loadSchema(name);
      return (
        <ExpandableRowContent>
          <Spinner size={'sm'} />
        </ExpandableRowContent>
      );
    }

    return (
      <ExpandableRowContent>
        <SyntaxHighlighter
          wrapLines={false}
          style={syntaxHighLighterTheme}
          useInlineStyles={true}
          showLineNumbers={true}
        >
          {schemasContent.get(name)}
        </SyntaxHighlighter>
      </ExpandableRowContent>
    );
  };

  const emptyPage = (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={t('schemas.no-schema-status')}
      icon={DatabaseIcon}
      headingLevel="h4"
    >
      <EmptyStateBody>{t('schemas.no-schema-body')}</EmptyStateBody>
      <EmptyStateFooter>{createSchemaButtonHelper(true)}</EmptyStateFooter>
    </EmptyState>
  );

  const searchInput = (
    <SearchInput
      placeholder={t('schemas.schema-search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={filteredSchemas.length}
        perPage={schemasPagination.perPage}
        page={schemasPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-schemas"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  if (!props.isVisible) {
    return <span />;
  }

  if (schemas.length == 0) {
    return emptyPage;
  }

  return (
    <React.Fragment>
      <Toolbar id="schema-table-toolbar">
        <ToolbarContent>
          <ToolbarItem>{searchInput}</ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
          {buildCreateSchemaButton()}
          <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        data-cy="schemaTable"
        className={'schema-table'}
        aria-label={'schema-table-label'}
        variant="compact"
        style={{ marginTop: t_global_spacer_md.value }}
      >
        <Thead>
          <Tr>
            <Th />
            <Th width={30}>{columnNames.name}</Th>
            <Th width={60}>{columnNames.status}</Th>
          </Tr>
        </Thead>
        {filteredSchemas.length == 0 ? (
          <Tbody>
            <Tr>
              <Td colSpan={6}>
                <Bullseye>
                  <EmptyState
                    variant={EmptyStateVariant.sm}
                    titleText={t('schemas.no-filter-schema')}
                    icon={SearchIcon}
                    headingLevel="h2"
                  >
                    <EmptyStateBody>{t('schemas.no-filter-schema-body')}</EmptyStateBody>
                    <EmptyStateFooter>
                      <EmptyStateActions style={{ marginTop: t_global_spacer_sm.value }}>
                        <Button variant={'link'} onClick={() => setSearchValue('')}>
                          {t('schemas.create-button')}
                        </Button>
                      </EmptyStateActions>
                    </EmptyStateFooter>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          </Tbody>
        ) : (
          rows.map((row, rowIndex) => {
            return (
              <Tbody key={row.name} isExpanded={isSchemaExpanded(row)}>
                <Tr>
                  <Td
                    data-cy={row.name + 'Config'}
                    expand={{
                      rowIndex,
                      isExpanded: isSchemaExpanded(row),
                      onToggle: () => {
                        setLoadingSchema(true);
                        setSchemaExpanded(row, !isSchemaExpanded(row));
                      }
                    }}
                  />
                  <Td dataLabel={columnNames.name}>{row.name}</Td>
                  <Td dataLabel={columnNames.status}>{displayProtoError(row.error)}</Td>
                  <Td isActionCell data-cy={'actions-' + row.name}>
                    <ActionsColumn items={displayActions(row)} />
                  </Td>
                </Tr>
                <Tr isExpanded={isSchemaExpanded(row)}>
                  <Td />
                  <Td className="app-prefix--m-scroll-content" colSpan={3}>
                    {isSchemaExpanded(row) && buildSchemaContent(row.name)}
                  </Td>
                </Tr>
              </Tbody>
            );
          })
        )}
      </Table>
      <Toolbar>
        <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
      </Toolbar>
      <CreateProtoSchema isModalOpen={createSchemaFormOpen} closeModal={closeCreateSchemaModal} />
      <EditSchema
        schemaName={editSchemaName}
        isModalOpen={editSchemaName !== ''}
        submitModal={submitEditSchemaModal}
        closeModal={closeEditSchemaModal}
      />
      <DeleteSchema
        schemaName={deleteSchemaName}
        isModalOpen={deleteSchemaName !== ''}
        closeModal={closeDeleteSchemaModal}
      />
    </React.Fragment>
  );
};

export { ProtobufSchemasDisplay };
