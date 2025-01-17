import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
  Pagination
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, TableVariant } from '@patternfly/react-table';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartThemeColor,
  ChartStack,
  ChartTooltip
} from '@patternfly/react-charts/victory';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useClusterDistribution } from '@app/services/dataDistributionHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { formatBytes } from '@utils/formatBytes';
import { onSearch } from '@app/utils/searchFilter';
import { chart_color_blue_300, chart_color_blue_200 } from '@patternfly/react-tokens';
import './ClusterDistributionChart.css';

const ClusterDistributionChart = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const MAX_NUMBER_FOR_CHART = 5;
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    perPage: 5
  });
  const [tableRow, setTableRow] = useState<ClusterDistribution[]>();
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState<ClusterDistribution[]>([]);

  const { clusterDistribution, loadingCluster, errorCluster } = useClusterDistribution();

  useEffect(() => {
    if (clusterDistribution) setFilteredData(clusterDistribution);
  }, [clusterDistribution, errorCluster, loadingCluster]);

  useEffect(() => {
    if (filteredData) {
      const initSlice = (tablePagination.page - 1) * tablePagination.perPage;
      const updateRows = filteredData.slice(initSlice, initSlice + tablePagination.perPage);
      setTableRow(updateRows);
    }
  }, [tablePagination, filteredData]);

  useEffect(() => {
    if (clusterDistribution) {
      setFilteredData(clusterDistribution.filter((data) => onSearch(searchValue, data.node_name)));
      onSetPage(1);
    }
  }, [searchValue, clusterDistribution]);

  const onPerPageSelect = (event, selection) => {
    setTablePagination({
      page: 1,
      perPage: selection
    });
  };

  const onSetPage = (selection) => {
    setTablePagination({
      ...tablePagination,
      page: selection
    });
  };

  const columnNames = {
    nodeName: t('global-stats.cluster-distribution-node-name'),
    memoryAvailable: t('global-stats.cluster-distribution-option-memory-available'),
    memoryUsed: t('global-stats.cluster-distribution-option-memory-used')
  };

  const searchInput = (
    <SearchInput
      placeholder={t('caches.cache-metrics.data-distribution-search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const pagination = (
    <Pagination
      data-cy="paginationArea"
      itemCount={clusterDistribution?.length}
      perPage={tablePagination.perPage}
      page={tablePagination.page}
      onSetPage={(event, selection) => onSetPage(selection)}
      widgetId="cluster-distribution-table-pagination"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const clusterTable = (
    <React.Fragment>
      <Toolbar style={{ paddingTop: '0', marginBottom: '1rem' }} id="cluster-distribution-table-toolbar">
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant['search-filter']}>{searchInput}</ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Cluster Distribution Table" variant={TableVariant.compact} borders>
        <Thead>
          <Tr>
            <Th>{columnNames.nodeName}</Th>
            <Th>{columnNames.memoryAvailable}</Th>
            <Th>{columnNames.memoryUsed}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableRow?.map((row) => (
            <Tr key={row.node_name}>
              <Td dataLabel={columnNames.nodeName}>{row.node_name}</Td>
              <Td dataLabel={columnNames.memoryAvailable}>{row.memory_available}</Td>
              <Td dataLabel={columnNames.memoryUsed}>{row.memory_used}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </React.Fragment>
  );

  // Find max domain
  let maxDomain = 1;
  if (clusterDistribution) {
    const maxUsed = Math.max(...clusterDistribution.map((entry) => entry.memory_available), 1);
    const maxAvailable = Math.max(...clusterDistribution.map((entry) => entry.memory_used), 1);
    maxDomain = maxUsed + maxAvailable;
  }

  const dataMemoryAvailable = clusterDistribution?.map((item, index) => {
    return {
      name: 'N ' + index + ': ' + item.node_name,
      y: item.memory_available,
      x: 'N ' + index + ': ' + item.node_name,
      label: `${t('global-stats.cluster-distribution-option-memory-available')}: ${formatBytes(item.memory_available)}`
    };
  });

  const dataMemoryUsed = clusterDistribution?.map((item, index) => {
    return {
      name: 'N ' + index + ': ' + item.node_name,
      y: item.memory_used,
      x: 'N ' + index + ': ' + item.node_name,
      label: `${t('global-stats.cluster-distribution-option-memory-used')}: ${formatBytes(item.memory_used)}`
    };
  });

  const clusterChart = (
    <div className="cluster-chart">
      <Chart
        ariaDesc={t('global-stats.cluster-distribution')}
        domainPadding={{ x: [30, 25] }}
        legendComponent={
          <ChartLegend
            data={[
              {
                name: t('global-stats.cluster-distribution-option-memory-used'),
                symbol: { fill: chart_color_blue_300.var }
              },
              {
                name: t('global-stats.cluster-distribution-option-memory-available'),
                symbol: { fill: chart_color_blue_200.var }
              }
            ]}
          />
        }
        domain={{ y: [0, maxDomain] }}
        legendPosition="bottom-left"
        height={250}
        padding={{
          bottom: 10,
          left: 200, // Adjusted to accommodate y axis label
          right: 50, // Adjusted to accommodate legend
          top: 0
        }}
        width={700}
        themeColor={ChartThemeColor.blue}
      >
        <ChartAxis />
        <ChartAxis dependentAxis tickFormat={(t) => formatBytes(t)} />
        <ChartStack colorScale={[chart_color_blue_300.var, chart_color_blue_200.var]} horizontal>
          <ChartBar data={dataMemoryUsed} labelComponent={<ChartTooltip />} />
          <ChartBar data={dataMemoryAvailable} labelComponent={<ChartTooltip />} />
        </ChartStack>
      </Chart>
    </div>
  );

  const buildCardContent = () => {
    if (loadingCluster && clusterDistribution === undefined) {
      return <Spinner size={'lg'} />;
    }

    if (errorCluster != '') {
      return <TableErrorState error={errorCluster} />;
    }

    return clusterDistribution && clusterDistribution.length < MAX_NUMBER_FOR_CHART ? clusterChart : clusterTable;
  };

  return (
    <Card>
      <CardTitle>
        <PopoverHelp
          name="cluster-distribution"
          label={t('global-stats.cluster-distribution')}
          content={t('global-stats.cluster-distribution-tooltip')}
          text={t('global-stats.cluster-distribution')}
        />
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export default ClusterDistributionChart;
