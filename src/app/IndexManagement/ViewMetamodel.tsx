import React, { useState } from 'react';
import {
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  Popover,
  Toolbar,
  ToolbarItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, HelpIcon, ListIcon } from '@patternfly/react-icons';
import { TableEmptyState } from '@app/Common/TableEmptyState';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

/**
 * Update schema modal
 */
const ViewMetamodel = (props: {
  metamodelName: string;
  metamodels: Map<string, IndexMetamodel>;
  loading: boolean;
  error: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const [loadingFields, setLoadingFields] = useState(true);
  const [fieldsPagination, setFieldsPagination] = useState<PaginationType>({
    page: 1,
    perPage: 10
  });

  const columnNames = {
    name: t('caches.index.metamodel.column-name'),
    searchable: t('caches.index.metamodel.column-searchable'),
    sortable: t('caches.index.metamodel.column-sortable'),
    projectable: t('caches.index.metamodel.column-projectable'),
    aggregable: t('caches.index.metamodel.column-aggregable'),
    multiValued: t('caches.index.metamodel.column-multi-valued'),
    multiValuedInRoot: t('caches.index.metamodel.column-multi-valued-root'),
    type: t('caches.index.metamodel.column-type'),
    projectionType: t('caches.index.metamodel.column-projection-type'),
    argumentType: t('caches.index.metamodel.column-argument-type'),
    analyzer: t('caches.index.metamodel.column-analyzer')
  };

  const displayEnabled = (enabled: boolean) => {
    if (!enabled) {
      return <></>;
    }

    return (
      <Icon status={'success'}>
        <CheckCircleIcon />
      </Icon>
    );
  };

  const onSetPage = (_event, pageNumber) => {
    setFieldsPagination({
      ...fieldsPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setFieldsPagination({
      page: 1,
      perPage: perPage
    });
  };

  const buildContent = () => {
    if (props.loading || props.error !== '' || !props.metamodels.get(props.metamodelName)) {
      return <TableEmptyState loading={loadingFields} error={props.error} empty={t('common.loading-empty-message')} />;
    }

    const metamodel = props.metamodels.get(props.metamodelName) as IndexMetamodel;
    const initSlice = (fieldsPagination.page - 1) * fieldsPagination.perPage;
    const toolbarPagination = (dropDirection) => {
      return (
        <Toolbar>
          <ToolbarItem variant="pagination">
            <Pagination
              data-cy="paginationArea"
              itemCount={metamodel.valueFields.length}
              perPage={fieldsPagination.perPage}
              page={fieldsPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-fields"
              onPerPageSelect={onPerPageSelect}
              isCompact
              dropDirection={dropDirection}
            />
          </ToolbarItem>
        </Toolbar>
      );
    };
    return (
      <React.Fragment>
        {toolbarPagination('down')}
        <Table aria-label="Metamodel table" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              <Th>{columnNames.name}</Th>
              <Th>{columnNames.type}</Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-analyzer-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-analyzer')
                  }
                }}
                colSpan={1}
              >
                {columnNames.analyzer}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-multi-valued-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-multi-valued')
                  }
                }}
                colSpan={1}
              >
                {columnNames.multiValued}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-multi-valued-root-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-multi-valued-root')
                  }
                }}
                colSpan={1}
              >
                {columnNames.multiValuedInRoot}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-aggregable-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-aggregable')
                  }
                }}
                colSpan={1}
              >
                {columnNames.aggregable}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-projectable-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-projectable')
                  }
                }}
                colSpan={1}
              >
                {columnNames.projectable}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-searchable-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-searchable')
                  }
                }}
                colSpan={1}
              >
                {columnNames.searchable}
              </Th>
              <Th
                info={{
                  popover: t('caches.index.metamodel.column-sortable-tooltip'),
                  popoverProps: {
                    headerContent: t('caches.index.metamodel.column-sortable')
                  }
                }}
                colSpan={1}
              >
                {columnNames.sortable}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {metamodel.valueFields.slice(initSlice, initSlice + fieldsPagination.perPage).map((field) => (
              <Tr key={field.name}>
                <Td dataLabel={columnNames.name}>{field.name}</Td>
                <Td dataLabel={columnNames.type}>{field.type}</Td>
                <Td dataLabel={columnNames.analyzer}>{field.analyzer}</Td>
                <Td dataLabel={columnNames.multiValued}>{displayEnabled(field.multiValued)}</Td>
                <Td dataLabel={columnNames.multiValuedInRoot}>{displayEnabled(field.multiValuedInRoot)}</Td>
                <Td dataLabel={columnNames.aggregable}>{displayEnabled(field.aggregable)}</Td>
                <Td dataLabel={columnNames.projectable}>{displayEnabled(field.projectable)}</Td>
                <Td dataLabel={columnNames.searchable}>{displayEnabled(field.searchable)}</Td>
                <Td dataLabel={columnNames.sortable}>{displayEnabled(field.sortable)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {toolbarPagination('up')}
      </React.Fragment>
    );
  };

  return (
    <Modal isOpen={props.isModalOpen} onClose={props.closeModal}>
      <ModalHeader
        titleIconVariant={ListIcon}
        title={props.metamodelName}
        help={
          <Popover
            headerContent={<div>{t('caches.index.metamodel.tooltip-title')}</div>}
            bodyContent={<div>{t('caches.index.metamodel.tooltip-content')}</div>}
          >
            <Button variant="plain" aria-label="Help">
              <HelpIcon />
            </Button>
          </Popover>
        }
      />
      <ModalBody>{buildContent()}</ModalBody>
    </Modal>
  );
};

export { ViewMetamodel };
