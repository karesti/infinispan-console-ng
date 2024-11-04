import React, { useContext, useEffect, useState } from 'react';

import {
  Brand,
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import brandLight from '!!url-loader!@app/assets/images/brand.svg';
import brandDark from '!!url-loader!@app/assets/images/brand_dark.svg';
import { NavLink } from 'react-router-dom';
import { IAppRoute, routes } from '@app/routes';
import { APIAlertProvider } from '@app/providers/APIAlertProvider';
import { ActionResponseAlert } from '@app/Common/ActionResponseAlert';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { t_global_spacer_sm } from '@patternfly/react-tokens';
import { About } from '@app/About/About';
import { ErrorBoundary } from '@app/ErrorBoundary';
import { BannerAlert } from '@app/Common/BannerAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { KeycloakService } from '@services/keycloakService';
import {
  BarsIcon,
  ExternalLinkAltIcon,
  InfoCircleIcon,
  MoonIcon,
  QuestionCircleIcon,
  SunIcon
} from '@patternfly/react-icons';
import { ConsoleACL } from '@services/securityService';
import { DARK, LIGHT, ThemeContext } from '@app/providers/ThemeProvider';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const { t } = useTranslation();
  const { init } = useAppInitState();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { connectedUser } = useConnectedUser();

  const [isWelcomePage, setIsWelcomePage] = useState(ConsoleServices.isWelcomePage());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setIsWelcomePage(pathname == '/welcome');
  }, [pathname]);

  const Logo = (
    <Brand src={theme == DARK ? brandDark : brandLight} alt={t('layout.console-name')} widths={{ default: '150px' }}>
      <source srcSet={theme == DARK ? brandDark : brandLight} />
    </Brand>
  );

  const userActions = () => {
    const chromeAgent = navigator.userAgent.toString().indexOf('Chrome') > -1;
    if (chromeAgent || (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated())) {
      return (
        <ToolbarItem>
          <Dropdown
            onSelect={() => setIsDropdownOpen(!isDropdownOpen)}
            isOpen={isDropdownOpen}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                isFullHeight
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                isExpanded={isDropdownOpen}
              >
                {connectedUser.name}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <DropdownGroup key="user-action-group">
              <DropdownItem
                key="user-action-group-1 logout"
                onClick={() => {
                  if (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated()) {
                    KeycloakService.Instance.logout(ConsoleServices.landing());
                  } else {
                    ConsoleServices.authentication().logOutLink();
                    navigate('/welcome');
                    window.location.reload();
                  }
                }}
              >
                {t('layout.logout')}
              </DropdownItem>
            </DropdownGroup>
          </Dropdown>
        </ToolbarItem>
      );
    }
    return (
      <ToolbarGroup variant="label-group">
        <ToolbarItem>
          {connectedUser.name}
          <Tooltip position="left" content={<Content>{t('layout.close-browser-message')}</Content>}>
            <span aria-label={t('layout.close-browser-message')} tabIndex={0}>
              <InfoCircleIcon
                style={{
                  marginLeft: t_global_spacer_sm.value,
                  marginTop: t_global_spacer_sm.value
                }}
              />
            </span>
          </Tooltip>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const headerToolbar = (
    <Toolbar id="toolbar" isFullHeight>
      <ToolbarContent>
        <ToolbarGroup variant="label-group">
          <ToolbarItem>
            <Content component={ContentVariants.h2}>{t('layout.console-name')}</Content>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <ToggleGroup>
              <ToggleGroupItem
                icon={<SunIcon />}
                aria-label={'Light mode'}
                isSelected={theme == LIGHT}
                onChange={() => toggleTheme(true)}
                buttonId="themeLight"
              />
              <ToggleGroupItem
                icon={<MoonIcon />}
                isSelected={theme == DARK}
                aria-label={'Dark mode'}
                onChange={() => toggleTheme(false)}
                buttonId="themeDark"
              />
            </ToggleGroup>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              id="aboutInfoQuestionMark"
              onSelect={() => setIsHelpOpen(!isHelpOpen)}
              popperProps={{ position: 'right' }}
              isOpen={isHelpOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  data-cy="aboutInfoQuestionMark"
                  variant={'plain'}
                  ref={toggleRef}
                  isFullHeight
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  isExpanded={isHelpOpen}
                >
                  <QuestionCircleIcon />
                </MenuToggle>
              )}
            >
              <DropdownItem
                onClick={() => window.open(t('brandname.documentation-link'), '_blank')}
                key="documentation"
                icon={<ExternalLinkAltIcon />}
              >
                {t('layout.documentation-name')}
              </DropdownItem>
              <DropdownItem onClick={() => setIsAboutOpen(!isAboutOpen)} key="about" component="button">
                {t('layout.about-name')}
              </DropdownItem>
            </Dropdown>
          </ToolbarItem>
          {!ConsoleServices.authentication().isNotSecured() && userActions()}
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  const Header = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <Button
            data-cy="sideBarToggle"
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo>{Logo}</MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const PageSkipToContent = <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>;

  const create = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  // The menu for non admin users
  const filteredRoutes = routes.filter((route) => !route.readonlyUser || (!create && route.readonlyUser));

  const displayNavMenu = (route: IAppRoute): boolean => {
    return (
      route.menu == true &&
      route.label !== undefined &&
      (!route.admin || (route.admin && ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)))
    );
  };

  const isCurrentActiveNavItem = (route: IAppRoute) => {
    if (pathname == route.path) {
      return true;
    }

    let isSubRoute = false;
    if (route.subRoutes != null) {
      for (let i = 0; i < route.subRoutes.length; i++) {
        if (pathname.includes(route.subRoutes[i])) {
          isSubRoute = true;
          break;
        }
      }
    }
    return isSubRoute;
  };

  const Navigation = (
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple">
        {filteredRoutes.map(
          (route, idx) =>
            displayNavMenu(route) && (
              <NavItem key={`${route.label}-${idx}`} id={`${route.label}-${idx}`}>
                <NavLink
                  caseSensitive={true}
                  to={route.path + location.search}
                  className={isCurrentActiveNavItem(route) ? 'pf-m-current' : ''}
                >
                  {route.label}
                </NavLink>
              </NavItem>
            )
        )}
      </NavList>
    </Nav>
  );

  const displayPage = () => {
    if (init == 'PENDING') {
      return (
        <Page mainContainerId="primary-app-container">
          <ErrorBoundary>
            <Spinner />
          </ErrorBoundary>
        </Page>
      );
    }

    if ((init == 'NOT_READY' || init == 'SERVER_ERROR') && !ConsoleServices.isWelcomePage()) {
      return <Navigate to="/welcome" />;
    }

    const Sidebar = (
      <PageSidebar>
        <PageSidebarBody>{Navigation}</PageSidebarBody>
      </PageSidebar>
    );

    return (
      <Page
        mainContainerId="primary-app-container"
        masthead={isWelcomePage ? null : Header}
        isContentFilled
        skipToContent={PageSkipToContent}
        sidebar={!isWelcomePage && sidebarOpen && Sidebar}
      >
        <ActionResponseAlert />
        <BannerAlert />
        <ErrorBoundary>{children}</ErrorBoundary>
        <About isModalOpen={isAboutOpen} closeModal={() => setIsAboutOpen(false)} />
      </Page>
    );
  };
  return <APIAlertProvider>{displayPage()}</APIAlertProvider>;
};

export { AppLayout };
