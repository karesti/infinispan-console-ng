import * as React from 'react';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CacheManagerPage } from '@app/CacheManagers/CacheMangerPage';
import { CreateCache } from '@app/Caches/CreateCache';
import { Welcome } from '@app/Welcome/Welcome';
import { DetailConfigurations } from '@app/Caches/Configuration/DetailConfigurations';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { ClusterMembership } from '@app/ClusterStatus/ClusterMembership';
import { IndexManagement } from '@app/IndexManagement/IndexManagement';
import { XSiteCache } from '@app/XSite/XSiteCache';
import { DetailCachePage } from '@app/Caches/DetailCachePage';
import { ConnectedClients } from './ConnectedClients/ConnectedClients';
import { AccessManager } from '@app/AccessManagement/AccessManager';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { NotAuthorized } from '@app/NotAuthorized/NotAuthorized';
import { NotFound } from '@app/NotFound/NotFound';
import { RoleDetail } from '@app/AccessManagement/RoleDetail';
import { useDocumentTitle } from '@utils/useDocumentTitle';
import { accessibleRouteChangeHandler } from '@utils/utils';
import { ContainerDataProvider } from '@app/providers/CacheManagerContextProvider';
import { TracingManagement } from '@app/TracingManagement/TracingManagement';

export interface IAppRoute {
  label?: string;
  component: React.JSX.Element;
  exact?: boolean;
  path: string;
  title: string;
  admin: boolean;
  isAsync?: boolean;
  menu?: boolean;
  subRoutes?: string[];
  init?: string;
  readonlyUser?: boolean;
}

const routes: IAppRoute[] = [
  {
    component: <CacheManagerPage />,
    exact: true,
    label: 'Data Container',
    path: '/',
    title: 'Data Container',
    menu: true,
    subRoutes: ['container', 'cache'],
    admin: false
  },
  {
    component: <GlobalStats />,
    exact: true,
    label: 'Global Statistics',
    path: '/global-stats',
    title: 'Global Statistics',
    menu: true,
    admin: false
  },
  {
    component: <ClusterMembership />,
    exact: true,
    label: 'Cluster Membership',
    path: '/cluster-membership',
    title: 'Cluster Membership',
    menu: true,
    admin: false
  },
  {
    component: (
      <ContainerDataProvider>
        <CreateCache />
      </ContainerDataProvider>
    ),
    exact: true,
    label: 'Cache Setup',
    path: '/caches/setup',
    title: 'Cache Setup',
    menu: false,
    readonlyUser: true,
    admin: false
  },
  {
    component: (
      <ContainerDataProvider>
        <CreateCache />
      </ContainerDataProvider>
    ),
    exact: true,
    label: 'Create cache',
    path: '/container/caches/create',
    title: 'Create cache',
    menu: false,
    admin: true
  },
  {
    component: <DetailConfigurations />,
    exact: true,
    label: 'Cache Manager Configurations',
    path: '/container/configurations',
    title: 'Configurations',
    menu: false,
    admin: false
  },
  {
    component: <IndexManagement />,
    exact: true,
    label: 'Index management',
    path: '/cache/:cacheName/indexing',
    title: 'Index management',
    menu: false,
    admin: false
  },
  {
    component: <TracingManagement />,
    exact: true,
    label: 'Tracing management',
    path: '/cache/:cacheName/tracing',
    title: 'Tracing management',
    menu: false,
    admin: false
  },
  {
    component: <XSiteCache />,
    exact: true,
    label: 'XSite Replication Cache',
    path: '/cache/:cacheName/backups',
    title: 'XSite management caches',
    menu: false,
    admin: true
  },
  {
    component: <DetailCachePage />,
    exact: true,
    label: 'Cache',
    path: '/cache/:cacheName',
    title: 'Cache',
    menu: false,
    admin: false
  },
  {
    component: <AccessManager />,
    exact: true,
    label: 'Access Management',
    path: '/access-management',
    title: 'Access Management',
    menu: true,
    admin: true,
    subRoutes: ['role']
  },
  {
    component: <ConnectedClients />,
    exact: true,
    label: 'Connected Clients',
    path: '/connected-clients',
    title: 'Connected Clients',
    menu: true,
    admin: true
  },
  {
    component: <RoleDetail />,
    exact: true,
    label: 'Role detail',
    path: '/access-management/role/:roleName',
    title: 'Role detail',
    menu: false,
    admin: true
  }
];

let routeFocusTimer: number;
const useA11yRouteChange = (isAsync: boolean) => {
  useEffect(() => {
    if (isAsync !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync]);
};

const ComponentWithTitleUpdates = (props: { appRoute: IAppRoute }) => {
  useDocumentTitle(props.appRoute.title);
  useA11yRouteChange(false);
  return props.appRoute.component;
};

const AppRoutes = () => {
  const { connectedUser } = useConnectedUser();
  const { init } = useAppInitState();
  return (
    <Routes>
      {routes.map((iroute, idx) => {
        if (iroute.admin && !ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
          return <Route key={idx} path={iroute.path} element={<NotAuthorized />} />;
        }
        return <Route key={idx} path={iroute.path} element={<ComponentWithTitleUpdates appRoute={iroute} />} />;
      })}
      <Route key={'welcome'} path={'/welcome'} element={<Welcome />} />
      <Route key={'not-found'} path={'*'} element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes, routes };
